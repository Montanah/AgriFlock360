import { Injectable } from '@nestjs/common';
import * as mqtt from 'mqtt';

@Injectable()
export class MqttService {
  private client: mqtt.MqttClient;

  constructor() {
    this.client = mqtt.connect(
      process.env.MQTT_URL || 'mqtt://localhost:1883',
      {
        username: process.env.MQTT_USER,
        password: process.env.MQTT_PASS,
      },
    );

    this.client.on('connect', () => {
      console.log('MQTT Connected');
      this.client.subscribe('agriflock/telemetry/#');
      this.client.subscribe('agriflock/status/#');
    });

    this.client.on('message', (topic, message) => {
      // Forward to TelemetryService or Redis queue
    });
  }

  publishCommand(deviceId: string, command: any) {
    this.client.publish(`agriflock/cmd/${deviceId}`, JSON.stringify(command));
  }
}
