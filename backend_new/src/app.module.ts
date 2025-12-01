import { Module, MiddlewareConsumer, RequestMethod  } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { UsersModule } from './users/users.module';
import { DevicesModule } from './devices/devices.module';
import { TelemetryModule } from './telemetry/telemetry.module';
import { BrooderModule } from './brooder/brooder.module';
import { PaymentsModule } from './payments/payments.module';
import { VaccinationModule } from './vaccination/vaccination.module';
import { FeedingModule } from './feeding/feeding.module';
import { ReportsModule } from './reports/reports.module';
import { WebsocketModule } from './websocket/websocket.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FarmModule } from './farm/farm.module';
import { BatchModule } from './batch/batch.module';
import { NotificationsController } from './notifications/notifications.controller';
import { NotificationsModule } from './notifications/notifications.module';
import { RawBodyMiddleware } from './common/raw-body.middleware';
import { AnalyticsModule } from './analytics/analytics.module';
import { AdminModule } from './admin/admin.module';
import { RedisModule } from './common/redis/redis.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { RedisRateLimitGuard } from './auth/guards/redis-rate-limit.guard';
import { CacheInterceptor } from './common/interceptors/cache.interceptor';
import { ScheduleModule } from '@nestjs/schedule';
import { UploadsModule } from './uploads/uploads.module';
import { PermissionsModule } from './permissions/permissions.module';
import { RolesController } from './roles/roles.controller';
import { RolesModule } from './roles/roles.module';
import { VaccineCatalogModule } from './vaccine-catalog/vaccine-catalog.module';
import { InventoryModule } from './inventory/inventory.module';
import { HousingModule } from './housing/housing.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false, // Use migrations in production
        logging: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    RedisModule,
    HealthModule,
    AuthModule,
    UsersModule,
    DevicesModule,
    TelemetryModule,
    BrooderModule,
    PaymentsModule,
    VaccinationModule,
    FeedingModule,
    ReportsModule,
    WebsocketModule,
    FarmModule,
    BatchModule,
    NotificationsModule,
    AnalyticsModule,
    AdminModule,
    UploadsModule,
    PermissionsModule,
    RolesModule,
    VaccineCatalogModule,
    InventoryModule,
    HousingModule,
  ],
  controllers: [AppController, NotificationsController, RolesController],
  providers: [AppService,
    {
      provide: APP_GUARD,
      useClass: RedisRateLimitGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply raw body middleware for webhook signature verification
    consumer
      .apply(RawBodyMiddleware)
      .forRoutes({ path: 'payments/callback', method: RequestMethod.POST });
  }
}
