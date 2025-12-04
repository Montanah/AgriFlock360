// analytics/dashboard.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Device } from '../database/entities/Device.entity';
import { Batch, BatchStatus } from '../database/entities/Batch.entity';
import { Alert } from '../database/entities/Alert.entity';
import { Payment } from '../database/entities/Payment.entity';
import { Vaccination } from '../database/entities/Vaccination.entity';
import { User } from '../database/entities/User.entity';
import { Farm } from '../database/entities/Farm.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Device)
    private deviceRepository: Repository<Device>,
    @InjectRepository(Batch)
    private batchRepository: Repository<Batch>,
    @InjectRepository(Alert)
    private alertRepository: Repository<Alert>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Vaccination)
    private vaccinationRepository: Repository<Vaccination>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Farm)
    private farmRepository: Repository<Farm>,
  ) {}

  async getFarmerSummary(userId: string) {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get counts
    const [
      totalDevices,
      activeDevices,
      totalBatches,
      activeBatches,
      TotalFarms,
      activeAlerts,
      recentPayments,
      upcomingVaccinations,
    ] = await Promise.all([
      // Total devices
      this.deviceRepository.count({
        where: { owner_id: userId },
      }),

      // Active devices (seen in last 24 hours)
      this.deviceRepository.count({
        where: {
          owner_id: userId,
          last_seen: Between(
            new Date(Date.now() - 24 * 60 * 60 * 1000),
            new Date(),
          ) as any,
        },
      }),

      // Total batches
      this.batchRepository.count({
        where: { user_id: userId },
      }),

      // Active batches
      this.batchRepository.count({
        where: { user_id: userId, current_status: BatchStatus.ACTIVE },
      }),

      //Total Farms
      this.farmRepository.count({
        where: { user_id: userId },
      }),

      // Active alerts
      this.alertRepository.count({
        where: { user_id: userId, alert_status: 'active' },
      }),

      // Recent payments (last 30 days)
      this.paymentRepository.find({
        where: {
          user_id: userId,
          created_at: Between(thirtyDaysAgo, today) as any,
        },
        order: { created_at: 'DESC' },
        take: 5,
      }),

      // Upcoming vaccinations (next 7 days)
      this.vaccinationRepository
        .createQueryBuilder('vaccination')
        .leftJoinAndSelect('vaccination.batch', 'batch')
        .where('batch.user_id = :userId', { userId })
        .andWhere('vaccination.vaccination_status = :status', {
          status: 'scheduled',
        })
        .andWhere('vaccination.scheduled_date BETWEEN :today AND :nextWeek', {
          today: today.toISOString().split('T')[0],
          nextWeek: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
        })
        .orderBy('vaccination.scheduled_date', 'ASC')
        .take(5)
        .getMany(),
    ]);

    // Calculate summary statistics
    const totalPaymentsAmount = recentPayments.reduce(
      (sum, payment) => sum + Number(payment.amount),
      0,
    );

    const completedPayments = recentPayments.filter(
      (p) => p.status === 'completed',
    ).length;

    //calculate total birds
    const totalBirds = await this.batchRepository
      .createQueryBuilder('batch')
      .select('SUM(batch.current_count)', 'total_birds')
      .where('batch.user_id = :userId', { userId })
      .getRawOne();

    return {
      devices: {
        total: totalDevices,
        active: activeDevices,
        offline: totalDevices - activeDevices,
      },
      farms: {
        total: TotalFarms,
      },
      batches: {
        total: totalBatches,
        active: activeBatches,
        completed: totalBatches - activeBatches,
      },
      alerts: {
        active: activeAlerts,
      },
      payments: {
        recent_count: recentPayments.length,
        total_amount: totalPaymentsAmount,
        completed: completedPayments,
        recent: recentPayments,
      },
      vaccinations: {
        upcoming_count: upcomingVaccinations.length,
        upcoming: upcomingVaccinations,
      },
      birds: {
        total: totalBirds.total_birds,
      },
    };
  }

  async getAdminSummary() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      activeUsers,
      totalDevices,
      activeDevices,
      totalFarms,
      totalBatches,
      activeBatches,
      revenueToday,
      activeAlerts,
      pendingPayments,
    ] = await Promise.all([
      // Total users
      this.userRepository.count(),

      // Active users (logged in last 7 days)
      this.userRepository.count({
        where: {
          updated_at: Between(
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            new Date(),
          ) as any,
        },
      }),

      // Total devices
      this.deviceRepository.count(),

      // Active devices
      this.deviceRepository.count({
        where: {
          last_seen: Between(
            new Date(Date.now() - 24 * 60 * 60 * 1000),
            new Date(),
          ) as any,
        },
      }),

      //Total Farms
      this.farmRepository.count(),

      // Total batches
      this.batchRepository.count(),

      // Active batches
      this.batchRepository.count({
        where: { current_status: BatchStatus.ACTIVE },
      }),

      // Revenue today
      this.paymentRepository
        .createQueryBuilder('payment')
        .select('COALESCE(SUM(payment.amount), 0)', 'total')
        .where('payment.status = :status', { status: 'completed' })
        .andWhere('payment.created_at >= :today', { today })
        .andWhere('payment.created_at < :tomorrow', { tomorrow })
        .getRawOne()
        .then((result) => Number(result.total)),

      // Active alerts by severity
      this.alertRepository
        .createQueryBuilder('alert')
        .select('alert.severity', 'severity')
        .addSelect('COUNT(*)', 'count')
        .where('alert.alert_status = :status', { status: 'active' })
        .groupBy('alert.severity')
        .getRawMany(),

      // Pending payments
      this.paymentRepository.count({
        where: { status: 'pending' },
      }),
    ]);

    // Alert summary
    const alertSummary = {
      high: 0,
      medium: 0,
      low: 0,
      total: 0,
    };

    activeAlerts.forEach((alert) => {
      alertSummary[alert.severity] = Number(alert.count);
      alertSummary.total += Number(alert.count);
    });

    // Get recent registrations (last 7 days)
    const recentUsers = await this.userRepository.find({
      where: {
        created_at: Between(
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          new Date(),
        ) as any,
      },
      order: { created_at: 'DESC' },
      take: 10,
      select: ['id', 'email', 'name', 'created_at'],
    });

    return {
      users: {
        total: totalUsers,
        active_last_7_days: activeUsers,
        recent: recentUsers,
      },
      devices: {
        total: totalDevices,
        active: activeDevices,
        offline: totalDevices - activeDevices,
      },
      farms: {
        total: totalFarms
      },
      batches: {
        total: totalBatches,
        active: activeBatches,
      },
      revenue: {
        today: revenueToday,
      },
      alerts: alertSummary,
      payments: {
        pending: pendingPayments,
      },
    };
  }

  async getDeviceMetrics(deviceId: string, startDate: Date, endDate: Date) {
    // Implementation for device-specific metrics
    const device = await this.deviceRepository.findOne({
      where: { id: deviceId },
      relations: ['owner'],
    });

    if (!device) {
      throw new Error('Device not found');
    }

    // Get telemetry stats, uptime, alert history, etc.
    // This is a placeholder - implement based on your needs
    return {
      device,
      period: { start: startDate, end: endDate },
      // Add metrics here
    };
  }
}
