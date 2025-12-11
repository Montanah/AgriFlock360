// services/iot-subscription-integration.service.ts
import { Injectable } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';

@Injectable()
export class IoTSubscriptionIntegrationService {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  /**
   * Called when IoT device sends sensor reading
   */
  async onSensorReading(
    deviceId: string,
    subscriptionId: string,
    sensorData: any,
  ) {
    try {
      // Record usage for the reading
      await this.subscriptionService.recordUsage({
        subscription_id: subscriptionId,
        device_id: deviceId,
        usage_type: 'reading',
        quantity: 1,
        metadata: {
          sensor_type: sensorData.type,
          value: sensorData.value,
          timestamp: sensorData.timestamp,
        },
      });

      // Check if alert should be sent
      if (this.shouldSendAlert(sensorData)) {
        await this.onAlertSent(deviceId, subscriptionId, sensorData);
      }

      return { success: true, charged: true };
    } catch (error) {
      if (error.message.includes('Insufficient balance')) {
        // Handle low balance - maybe suspend device or notify user
        return { success: false, reason: 'insufficient_balance' };
      }
      throw error;
    }
  }

  /**
   * Called when alert is sent to farmer
   */
  async onAlertSent(deviceId: string, subscriptionId: string, alertData: any) {
    await this.subscriptionService.recordUsage({
      subscription_id: subscriptionId,
      device_id: deviceId,
      usage_type: 'alert',
      quantity: 1,
      metadata: {
        alert_type: alertData.type,
        severity: alertData.severity,
        message: alertData.message,
      },
    });
  }

  /**
   * Called when device transmits data
   */
  async onDataTransmit(
    deviceId: string,
    subscriptionId: string,
    dataSizeKb: number,
  ) {
    await this.subscriptionService.recordUsage({
      subscription_id: subscriptionId,
      device_id: deviceId,
      usage_type: 'data_transfer',
      quantity: 1,
      data_size_kb: dataSizeKb,
    });
  }

  private shouldSendAlert(sensorData: any): boolean {
    // Implement your alert logic
    if (sensorData.type === 'temperature' && sensorData.value > 35) {
      return true;
    }
    if (sensorData.type === 'humidity' && sensorData.value < 40) {
      return true;
    }
    return false;
  }
}
