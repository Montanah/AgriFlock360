// mqtt/mqtt.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { connect, MqttClient, IClientOptions } from 'mqtt';
import { TelemetryService } from '../telemetry/telemetry.service';
import { CustomLogger } from '../common/custom-logger.service';

export interface MqttTelemetryData {
  temperature?: number;
  humidity?: number;
  status?: string;
  rssi?: number;
  battery?: number;
  heater_status?: boolean;
  fan_status?: boolean;
  power_status?: boolean;
  error_code?: string;
  meta?: any;
}

@Injectable()
export class MqttService implements OnModuleInit, OnModuleDestroy {
  private client: MqttClient;
  private isConnected = false;

  constructor(
    private telemetryService: TelemetryService,
    private logger: CustomLogger,
  ) {}

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  private async connect() {
    const mqttOptions: Partial<IClientOptions> = {
      host: process.env.MQTT_HOST || 'localhost',
      port: parseInt(process.env.MQTT_PORT || '1883'),
      clientId: `nestjs-server-${Math.random().toString(16).substr(2, 8)}`,
      clean: true,
      reconnectPeriod: 5000,
      connectTimeout: 30000,
    };

    console.log(
      'process.env.MQTT_USERNAME',
      process.env.MQTT_USERNAME,
      'process.env.MQTT_PASSWORD',
      process.env.MQTT_PASSWORD,
      'mqttOptions',
      mqttOptions,
    );

    if (process.env.MQTT_USERNAME) {
      mqttOptions.username = process.env.MQTT_USERNAME;
    }
    if (process.env.MQTT_PASSWORD) {
      mqttOptions.password = process.env.MQTT_PASSWORD;
    }

    try {
      this.client = connect(mqttOptions);

      this.client.on('connect', () => {
        this.isConnected = true;
        this.logger.log('MQTT Client connected');
        this.subscribeToTopics();
      });

      this.client.on('message', (topic: string, payload: Buffer) => {
        this.handleMessage(topic, payload);
      });

      this.client.on('error', (error) => {
        this.logger.error(
          'MQTT Client error:',
          error instanceof Error
            ? error.message || error.toString()
            : String(error),
        );
        this.isConnected = false;
      });

      this.client.on('close', () => {
        this.logger.log('MQTT Client disconnected');
        this.isConnected = false;
      });

      this.client.on('reconnect', () => {
        this.logger.log('MQTT Client reconnecting...');
      });
    } catch (error) {
      this.logger.error(
        'Failed to connect to MQTT broker:',
        error instanceof Error
          ? error.message || error.toString()
          : String(error),
      );
    }
  }

  private subscribeToTopics() {
    // Subscribe to all device telemetry topics
    this.client.subscribe('iot/+/telemetry', { qos: 1 }, (err) => {
      if (err) {
        this.logger.error(
          'Failed to subscribe to telemetry topics:',
          err instanceof Error ? err.message || err.toString() : String(err),
        );
      } else {
        this.logger.log('Subscribed to iot/+/telemetry topics');
      }
    });

    // Optional: Subscribe to device status topics
    this.client.subscribe('iot/+/status', { qos: 1 }, (err) => {
      if (err) {
        this.logger.error(
          'Failed to subscribe to status topics:',
          err instanceof Error ? err.message || err.toString() : String(err),
        );
      } else {
        this.logger.log('Subscribed to iot/+/status topics');
      }
    });
  }

  private async handleMessage(topic: string, payload: Buffer) {
    try {
      const payloadStr = payload.toString();
      const data = JSON.parse(payloadStr);

      this.logger.log(`Received MQTT message on topic: ${topic}`);

      // Extract device ID from topic (iot/<device_id>/telemetry)
      const topicParts = topic.split('/');
      if (
        topicParts.length >= 3 &&
        topicParts[0] === 'iot' &&
        topicParts[2] === 'telemetry'
      ) {
        const deviceId = topicParts[1];
        await this.processTelemetryData(deviceId, data);
      } else if (
        topicParts.length >= 3 &&
        topicParts[0] === 'iot' &&
        topicParts[2] === 'status'
      ) {
        const deviceId = topicParts[1];
        await this.processStatusMessage(deviceId, data);
      }
    } catch (error) {
      this.logger.error(
        'Error processing MQTT message:',
        error instanceof Error
          ? error.message || error.toString()
          : String(error),
      );
    }
  }

  private async processTelemetryData(
    deviceId: string,
    data: MqttTelemetryData,
  ) {
    try {
      // Transform MQTT data to match your telemetry service interface
      const telemetryData = {
        temperature: data.temperature,
        humidity: data.humidity,
        heater_status: data.heater_status,
        fan_status: data.fan_status,
        power_status: data.power_status,
        error_code: data.error_code,
        meta: {
          ...data.meta,
          rssi: data.rssi,
          battery: data.battery,
          status: data.status,
          received_via: 'mqtt',
        },
      };

      await this.telemetryService.recordTelemetry(deviceId, telemetryData);
      this.logger.log(`Telemetry recorded for device: ${deviceId}`);
    } catch (error) {
      this.logger.error(
        `Failed to process telemetry for device ${deviceId}:`,
        error instanceof Error
          ? error.message || error.toString()
          : String(error),
      );
    }
  }

  private async processStatusMessage(deviceId: string, data: any) {
    // Handle device status messages (online/offline, etc.)
    this.logger.log(`Status update for device ${deviceId}:`, data);
  }

  // Method to publish messages (if needed)
  public publish(topic: string, message: any, options?: any): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isConnected) {
        reject(new Error('MQTT client not connected'));
        return;
      }

      const payload = JSON.stringify(message);

      this.client.publish(topic, payload, options, (error) => {
        if (error) {
          this.logger.error(
            `Failed to publish to ${topic}:`,
            error instanceof Error
              ? error.message || error.toString()
              : String(error),
          );
          reject(error);
        } else {
          this.logger.log(`Message published to ${topic}`);
          resolve();
        }
      });
    });
  }

  // Method to send commands to devices
  public async sendCommand(deviceId: string, command: any): Promise<void> {
    const topic = `iot/${deviceId}/command`;
    await this.publish(topic, command, { qos: 1 });
  }

  public isClientConnected(): boolean {
    return this.isConnected;
  }

  private async disconnect() {
    if (this.client) {
      this.client.end();
    }
  }
}
