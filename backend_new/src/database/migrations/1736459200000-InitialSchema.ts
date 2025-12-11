import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1736459200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      -- Enable UUID extension
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

      -- Roles
      CREATE TABLE IF NOT EXISTS roles (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_roles_created_at ON roles(created_at);

      -- Permissions (optional)
      CREATE TABLE IF NOT EXISTS permissions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_permissions_created_at ON permissions(created_at);

      -- Users
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name VARCHAR(255),
        location TEXT,
        is_active BOOLEAN DEFAULT true,
        first_name TEXT,
        last_name TEXT,
        phone_number VARCHAR(20) UNIQUE,
        calling_code VARCHAR(10) DEFAULT '+254',
        is_2fa_enabled BOOLEAN NOT NULL DEFAULT false,
        email_verification_code TEXT,
        email_verification_expires_at TIMESTAMPTZ,
        refresh_token TEXT,
        refresh_token_expires_at TIMESTAMPTZ,
        password_reset_token TEXT,
        password_reset_expires_at TIMESTAMPTZ,
        status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'deleted', 'pending')),
        role_id UUID NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        deleted_at TIMESTAMPTZ
      );

      -- Device Status
      CREATE TABLE IF NOT EXISTS device_status (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL,
        "desc" TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Device Type Enum
      CREATE TYPE device_type AS ENUM ('smart_brooder');

      -- Devices
      CREATE TABLE IF NOT EXISTS devices (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        device_id VARCHAR(50) UNIQUE NOT NULL,
        device_name VARCHAR(255) NOT NULL,
        device_type device_type NOT NULL DEFAULT 'smart_brooder',
        owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
        device_status_id UUID NOT NULL REFERENCES device_status(id),
        firmware_version VARCHAR(20),
        last_seen TIMESTAMPTZ,
        is_payg_locked BOOLEAN DEFAULT false,
        payg_balance DECIMAL(10,2) DEFAULT 0.00,
        installation_date DATE,
        warranty_expiry DATE,
        mqtt_topic_prefix VARCHAR(100),
        wifi_ssid VARCHAR(100),
        location VARCHAR(255),
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_devices_owner ON devices(owner_id);
      CREATE INDEX IF NOT EXISTS idx_devices_device_id ON devices(device_id);

      -- Telemetry
      CREATE TABLE IF NOT EXISTS telemetry (
        id BIGSERIAL PRIMARY KEY,
        device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
        temperature DECIMAL(5,2),
        humidity DECIMAL(5,2),
        heater_status BOOLEAN DEFAULT false,
        fan_status BOOLEAN DEFAULT false,
        power_status BOOLEAN DEFAULT true,
        error_code VARCHAR(50),
        meta JSONB,
        timestamp TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_telemetry_device_time ON telemetry(device_id, timestamp DESC);
      CREATE INDEX IF NOT EXISTS idx_telemetry_timestamp ON telemetry(timestamp DESC);

      -- Alerts (AlertSeverity enum - define as text for simplicity)
      CREATE TABLE IF NOT EXISTS alerts (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        severity VARCHAR(20) NOT NULL,  -- 'low', 'medium', 'high'
        alert_status VARCHAR(20) NOT NULL DEFAULT 'active',
        alert_type VARCHAR(50) NOT NULL,
        message TEXT NOT NULL,
        meta JSONB,
        acknowledged_at TIMESTAMPTZ,
        acknowledged_by UUID REFERENCES users(id) ON DELETE SET NULL,
        resolved_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_alerts_device ON alerts(device_id);
      CREATE INDEX IF NOT EXISTS idx_alerts_user ON alerts(user_id);
      CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(alert_status);
      CREATE INDEX IF NOT EXISTS idx_alerts_created ON alerts(created_at DESC);

      -- Command Type
      CREATE TABLE IF NOT EXISTS command_type (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL,
        "desc" TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Issued Device Commands
      CREATE TABLE IF NOT EXISTS issued_device_commands (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
        issued_by UUID REFERENCES users(id) ON DELETE SET NULL,
        command_type_id UUID REFERENCES command_type(id),
        payload JSONB NOT NULL,
        command_status VARCHAR(20) NOT NULL DEFAULT 'pending',
        response JSONB,
        sent_at TIMESTAMPTZ,
        acknowledged_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        expires_at TIMESTAMPTZ
      );
      CREATE INDEX IF NOT EXISTS idx_issued_commands_device ON issued_device_commands(device_id);
      CREATE INDEX IF NOT EXISTS idx_commands_status ON issued_device_commands(command_status);

      -- Device Logs
      CREATE TABLE IF NOT EXISTS device_logs (
        id BIGSERIAL PRIMARY KEY,
        device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
        log_level VARCHAR(20) NOT NULL,
        event_type VARCHAR(50) NOT NULL,
        message TEXT,
        meta JSONB,
        timestamp TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_logs_device_time ON device_logs(device_id, timestamp DESC);

      -- Flocks
      CREATE TABLE IF NOT EXISTS flocks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id),
        device_id UUID REFERENCES devices(id),
        breed VARCHAR(100),
        flock_name VARCHAR(255) NOT NULL,
        bird_type VARCHAR(20) CHECK (bird_type IN ('broiler', 'layer')),
        current_count INTEGER NOT NULL,
        hatch_date DATE,
        start_date DATE DEFAULT CURRENT_DATE,
        expected_end_date DATE,
        actual_end_date DATE,
        current_status VARCHAR(20) NOT NULL DEFAULT 'active',
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_flocks_user ON flocks(user_id);
      CREATE INDEX IF NOT EXISTS idx_flocks_device ON flocks(device_id);
      CREATE INDEX IF NOT EXISTS idx_flocks_status ON flocks(current_status);

      -- Flock History
      CREATE TABLE IF NOT EXISTS flock_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        created_by UUID REFERENCES users(id),
        batch_id UUID NOT NULL REFERENCES flocks(id),
        previous_count INTEGER NOT NULL,
        current_count INTEGER,
        hatch_date DATE,
        start_date DATE DEFAULT CURRENT_DATE,
        expected_end_date DATE,
        actual_end_date DATE,
        flock_status VARCHAR(20) NOT NULL DEFAULT 'active',
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Vaccinations
      CREATE TABLE IF NOT EXISTS vaccinations (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        batch_id UUID NOT NULL REFERENCES flocks(id) ON DELETE CASCADE,
        vaccine_name VARCHAR(255) NOT NULL,
        vaccine_type VARCHAR(100),
        scheduled_date DATE NOT NULL,
        completed_date DATE,
        vaccination_status VARCHAR(20) NOT NULL DEFAULT 'scheduled',
        dosage VARCHAR(100),
        administered_by VARCHAR(255),
        birds_vaccinated INTEGER,
        cost DECIMAL(10,2),
        notes TEXT,
        reminder_sent BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_vaccinations_flock ON vaccinations(batch_id);
      CREATE INDEX IF NOT EXISTS idx_vaccinations_status ON vaccinations(vaccination_status);
      CREATE INDEX IF NOT EXISTS idx_vaccinations_scheduled ON vaccinations(scheduled_date);

      -- Feeding Schedules
      CREATE TABLE IF NOT EXISTS feeding_schedules (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        batch_id UUID NOT NULL REFERENCES flocks(id) ON DELETE CASCADE,
        feed_type VARCHAR(100) NOT NULL,
        quantity_per_day DECIMAL(10,2) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE,
        times_per_day INTEGER DEFAULT 2,
        is_active BOOLEAN DEFAULT true,
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_feeding_flock ON feeding_schedules(batch_id);

      -- Feeding Records
      CREATE TABLE IF NOT EXISTS feeding_records (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        batch_id UUID NOT NULL REFERENCES flocks(id) ON DELETE CASCADE,
        schedule_id UUID REFERENCES feeding_schedules(id) ON DELETE SET NULL,
        feed_type VARCHAR(100) NOT NULL,
        quantity DECIMAL(10,2) NOT NULL,
        cost DECIMAL(10,2),
        fed_at TIMESTAMPTZ DEFAULT NOW(),
        recorded_by UUID REFERENCES users(id) ON DELETE SET NULL,
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_feeding_records_flock ON feeding_records(batch_id);
      CREATE INDEX IF NOT EXISTS idx_feeding_records_date ON feeding_records(fed_at DESC);

      -- Weight Samples
      CREATE TABLE IF NOT EXISTS weight_samples (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        batch_id UUID REFERENCES flocks(id),
        sample_date DATE,
        sample_size INTEGER DEFAULT 10,
        average_weight_grams DECIMAL(8,2),
        recorded_by UUID REFERENCES users(id)
      );

      -- Payments
      CREATE TABLE IF NOT EXISTS payments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        device_id UUID REFERENCES devices(id),
        user_id UUID REFERENCES users(id),
        amount DECIMAL(10,2) NOT NULL,
        base_currency_rate DECIMAL(10,2),
        base_currency DECIMAL(10,2),
        currency VARCHAR(3) DEFAULT 'KES',
        payment_method TEXT,
        payment_purpose TEXT,
        status VARCHAR(20) DEFAULT 'pending',
        transaction_ref VARCHAR(255) UNIQUE,
        phone_number VARCHAR(20),
        transaction_date TIMESTAMPTZ DEFAULT NOW(),
        meta JSONB,
        processed_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
      CREATE INDEX IF NOT EXISTS idx_payments_device ON payments(device_id);
      CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
      CREATE INDEX IF NOT EXISTS idx_payments_transaction_ref ON payments(transaction_ref);

      -- PAYG Transactions
      CREATE TABLE IF NOT EXISTS payg_transactions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
        payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
        transaction_type VARCHAR(20) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        balance_before DECIMAL(10,2) NOT NULL,
        balance_after DECIMAL(10,2) NOT NULL,
        description TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_payg_device ON payg_transactions(device_id);
      CREATE INDEX IF NOT EXISTS idx_payg_created ON payg_transactions(created_at DESC);

      -- Audit Logs
      CREATE TABLE IF NOT EXISTS audit_logs (
        id BIGSERIAL PRIMARY KEY,
        user_id UUID REFERENCES users(id),
        entity_type VARCHAR(50) NOT NULL,
        entity_id UUID,
        action VARCHAR(100),
        meta JSONB,
        changes JSONB,
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
      CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_type, entity_id);
      CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at DESC);

      -- User Notification Settings
      CREATE TABLE IF NOT EXISTS user_notification_settings (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        notification_type TEXT NOT NULL,
        timing_minutes INTEGER NOT NULL CHECK (timing_minutes >= 0),
        delivery_method TEXT NOT NULL DEFAULT 'email' CHECK (delivery_method IN ('email', 'push', 'sms', 'whatsapp', 'telegram', 'slack', 'webhook', 'other')),
        is_enabled BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_user_notification_settings_user_id ON user_notification_settings(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_notification_settings_type ON user_notification_settings(notification_type);
      CREATE INDEX IF NOT EXISTS idx_user_notification_settings_enabled ON user_notification_settings(is_enabled);
      CREATE INDEX IF NOT EXISTS idx_user_notification_settings_delivery_method ON user_notification_settings(delivery_method);

      -- Notifications
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        entity_type VARCHAR(50),
        entity_id UUID,
        body TEXT,
        type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'reminder', 'deadline', 'warning')),
        delivery_channel TEXT NOT NULL DEFAULT 'email',
        is_read BOOLEAN NOT NULL DEFAULT false,
        is_sent BOOLEAN NOT NULL DEFAULT false,
        sent_at TIMESTAMPTZ,
        read_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      -- Sent Notifications
      CREATE TABLE IF NOT EXISTS sent_notifications (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        notification_type TEXT NOT NULL,
        reference_id UUID NOT NULL,
        timing_minutes INTEGER NOT NULL CHECK (timing_minutes >= 0),
        delivery_method TEXT NOT NULL DEFAULT 'email' CHECK (delivery_method IN ('email', 'push', 'sms', 'other')),
        sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (user_id, notification_type, reference_id, timing_minutes, delivery_method)
      );
      CREATE INDEX IF NOT EXISTS idx_sent_notifications_user_id ON sent_notifications(user_id);
      CREATE INDEX IF NOT EXISTS idx_sent_notifications_reference ON sent_notifications(notification_type, reference_id);
      CREATE INDEX IF NOT EXISTS idx_sent_notifications_delivery_method ON sent_notifications(delivery_method);

      -- System Config
      CREATE TABLE IF NOT EXISTS system_config (
        key VARCHAR(100) PRIMARY KEY,
        value TEXT NOT NULL,
        description TEXT,
        meta JSONB NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_by UUID REFERENCES users(id) ON DELETE SET NULL
      );

      -- Additional Performance Indexes
      CREATE INDEX IF NOT EXISTS idx_flocks_user_active ON flocks(user_id) WHERE current_status = 'active';
      CREATE INDEX IF NOT EXISTS idx_commands_pending ON issued_device_commands(command_status) WHERE command_status = 'pending';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop in reverse order to avoid FK issues
    await queryRunner.query(`DROP TABLE IF EXISTS sent_notifications CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS notifications CASCADE;`);
    await queryRunner.query(
      `DROP TABLE IF EXISTS user_notification_settings CASCADE;`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS audit_logs CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS payg_transactions CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS payments CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS weight_samples CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS feeding_records CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS feeding_schedules CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS vaccinations CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS flock_history CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS flocks CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS device_logs CASCADE;`);
    await queryRunner.query(
      `DROP TABLE IF EXISTS issued_device_commands CASCADE;`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS command_type CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS alerts CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS telemetry CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS devices CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS device_status CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS users CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS roles CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS permissions CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS system_config CASCADE;`);
    await queryRunner.query(`DROP TYPE IF EXISTS device_type CASCADE;`);
  }
}
