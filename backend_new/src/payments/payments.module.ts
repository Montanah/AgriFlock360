// payments/payments.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsController } from './payments.controller';
import { PaygController } from './payg.controller';
import { PaymentsService } from './payments.service';
import { PaygService } from './payg.service';
import { PaystackService } from './paystack.service';
import { Payment } from '../database/entities/Payment.entity';
import { PaygTransaction } from '../database/entities/PaygTransaction.entity';
import { Device } from '../database/entities/Device.entity';
import { User } from '../database/entities/User.entity';
import { CustomLogger } from '../common/custom-logger.service';
import { AuditService } from '../services/audit.service';
import { AuditLog } from '../database/entities/AuditLog.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Payment,
      PaygTransaction,
      Device,
      User,
      AuditLog,
    ]),
    ScheduleModule.forRoot(),
    NotificationsModule,
  ],
  controllers: [PaymentsController, PaygController],
  providers: [
    PaymentsService,
    PaygService,
    PaystackService,
    CustomLogger,
    AuditService,
  ],
  exports: [PaymentsService, PaygService],
})
export class PaymentsModule {}
