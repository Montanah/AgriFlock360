import { Injectable } from '@nestjs/common';
import * as promClient from 'prom-client';

@Injectable()
export class MetricsService {
  private readonly register: promClient.Registry;
  private readonly httpRequestDuration: promClient.Histogram;
  private readonly httpRequestTotal: promClient.Counter;
  private readonly authSuccessTotal: promClient.Counter;
  private readonly authFailureTotal: promClient.Counter;

  constructor() {
    this.register = new promClient.Registry();

    this.httpRequestDuration = new promClient.Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
      registers: [this.register],
    });

    this.httpRequestTotal = new promClient.Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
      registers: [this.register],
    });

    this.authSuccessTotal = new promClient.Counter({
      name: 'auth_success_total',
      help: 'Total number of successful authentications',
      labelNames: ['method'],
      registers: [this.register],
    });

    this.authFailureTotal = new promClient.Counter({
      name: 'auth_failure_total',
      help: 'Total number of failed authentications',
      labelNames: ['method', 'reason'],
      registers: [this.register],
    });

    promClient.collectDefaultMetrics({ register: this.register });
  }

  recordHttpRequest(method: string, route: string, statusCode: number, duration: number) {
    this.httpRequestDuration.observe(
      { method, route, status_code: statusCode },
      duration,
    );
    this.httpRequestTotal.inc({ method, route, status_code: statusCode });
  }

  recordAuthSuccess(method: string) {
    this.authSuccessTotal.inc({ method });
  }

  recordAuthFailure(method: string, reason: string) {
    this.authFailureTotal.inc({ method, reason });
  }

  getMetrics() {
    return this.register.metrics();
  }
}
