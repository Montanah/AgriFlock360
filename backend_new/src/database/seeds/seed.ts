// src/database/seeds/seed.ts
import * as bcrypt from 'bcrypt';
import { QueryRunner } from 'typeorm';
import { Role } from '../entities/Role.entity';
import { User } from '../entities/User.entity';
import { Device } from '../entities/Device.entity';
import { DeviceStatus } from '../entities/DeviceStatus.entity';
import { DeviceLog } from '../entities/DeviceLog.entity';
import { CommandType } from '../entities/CommandType.entity';
import { Batch } from '../entities/Batch.entity';
import { Payment } from '../entities/Payment.entity';
import { Telemetry } from '../entities/Telemetry.entity';
import { Alert } from '../entities/Alert.entity';
import { Vaccination } from '../entities/Vaccination.entity';
import { FeedingRecord } from '../entities/FeedingRecord.entity';
import { FeedingSchedule } from '../entities/FeedingSchedule.entity';
import { WeightSample } from '../entities/WeightSample.entity';
import { BatchHistory } from '../entities/BatchHistory.entity';
import { BirdType } from '../entities/BirdType.entity';
import { dataSource } from '../data-source';

async function seed() {
  console.log('🌱 Starting database seeding...');

  try {
    // Initialize data source
    if (!dataSource.isInitialized) {
      await dataSource.initialize();
      console.log('✅ Data source initialized');
    }

    // Start transaction
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Seed Device Status
      console.log('🔌 Seeding device status...');
      await seedDeviceStatus(queryRunner);

      // 2. Seed Command Types
      console.log('📋 Seeding command types...');
      await seedCommandTypes(queryRunner);

      // 3. Seed Roles
      console.log('📝 Seeding roles...');
      const roles = await seedRoles(queryRunner);

      // 4. Seed Bird Types
      console.log('🐔 Seeding bird types...');
      const birdTypes = await seedBirdTypes(queryRunner);

      // 5. Seed Users
      console.log('👥 Seeding users...');
      const users = await seedUsers(queryRunner, roles);

      // 5. Seed Devices
      console.log('📱 Seeding devices...');
      const devices = await seedDevices(queryRunner, users);

      // 6. Seed Batches
      console.log('🐔 Seeding batches...');
      const batches = await seedBatchs(queryRunner, users, birdTypes);

      // 7. Seed Telemetry Data
      console.log('📊 Seeding telemetry data...');
      await seedTelemetry(queryRunner, devices);

      // 8. Seed Alerts
      console.log('🚨 Seeding alerts...');
      await seedAlerts(queryRunner, devices, users);

      // 9. Seed Batch Histories
      console.log('📚 Seeding batch histories...');
      await seedBatchHistories(queryRunner, batches, users);

      // 10. Seed Feeding Schedules
      console.log('📅 Seeding feeding schedules...');
      const feedingSchedules = await seedFeedingSchedules(queryRunner, batches);

      // 11. Seed Vaccinations
      console.log('💉 Seeding vaccinations...');
      await seedVaccinations(queryRunner, batches);

      // 12. Seed Feeding Records
      console.log('🌾 Seeding feeding records...');
      await seedFeedingRecords(queryRunner, batches, feedingSchedules, users);

      // 13. Seed Weight Samples
      console.log('⚖️ Seeding weight samples...');
      await seedWeightSamples(queryRunner, batches, users);

      // 14. Seed Payments
      console.log('💰 Seeding payments...');
      await seedPayments(queryRunner, users, devices);

      console.log('✅ All seed data created successfully!');

      // Commit transaction
      await queryRunner.commitTransaction();
      console.log('✅ Database seeding completed successfully!');
    } catch (error) {
      // Rollback transaction on error
      await queryRunner.rollbackTransaction();
      console.error('❌ Seeding failed:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
}

// Role Seeding
async function seedRoles(queryRunner: any) {
  const roleRepository = queryRunner.manager.getRepository(Role);

  const roles = [
    { name: 'admin', description: 'Administrator with full access' },
    { name: 'user', description: 'Regular user' },
    { name: 'viewer', description: 'Read-only access' },
  ];

  const savedRoles: Role[] = [];
  for (const roleData of roles) {
    let role = await roleRepository.findOne({ where: { name: roleData.name } });
    if (!role) {
      role = roleRepository.create(roleData);
      await roleRepository.save(role);
      console.log(`✅ Created role: ${role.name}`);
    } else {
      console.log(`⚠️ Role already exists: ${role.name}`);
    }
    savedRoles.push(role);
  }

  return savedRoles;
}

// User Seeding
async function seedUsers(queryRunner: any, roles: Role[]) {
  const userRepository = queryRunner.manager.getRepository(User);
  const adminRole = roles.find((r) => r.name === 'admin');
  const userRole = roles.find((r) => r.name === 'user');

  const users = [
    {
      email: 'admin@agriflock360.com',
      password_hash: await bcrypt.hash('admin123', 10),
      first_name: 'System',
      last_name: 'Administrator',
      role_id: adminRole!.id,
      status: 'active' as const,
      is_active: true,
      email_verification_code: null,
      email_verification_expires_at: null,
    },
    {
      email: 'farmer@agriflock360.com',
      password_hash: await bcrypt.hash('farmer123', 10),
      first_name: 'John',
      last_name: 'Poultry Farmer',
      role_id: userRole!.id,
      status: 'active' as const,
      is_active: true,
      email_verification_code: null,
      email_verification_expires_at: null,
    },
    {
      email: 'manager@agriflock360.com',
      password_hash: await bcrypt.hash('manager123', 10),
      first_name: 'Sarah',
      last_name: 'Farm Manager',
      role_id: userRole!.id,
      status: 'active' as const,
      is_active: true,
      email_verification_code: null,
      email_verification_expires_at: null,
    },
  ];

  const savedUsers: User[] = [];
  for (const userData of users) {
    let user = await userRepository.findOne({
      where: { email: userData.email },
    });
    if (!user) {
      user = userRepository.create(userData);
      await userRepository.save(user);
      console.log(`✅ Created user: ${user.email}`);
    } else {
      console.log(`⚠️ User already exists: ${user.email}`);
    }
    savedUsers.push(user);
  }

  return savedUsers;
}

// Device Status Seeding
async function seedDeviceStatus(queryRunner: any) {
  const deviceStatusRepository =
    queryRunner.manager.getRepository(DeviceStatus);

  const statuses = [
    { name: 'smart_brooder', desc: 'Smart Brooder Device' },
    { name: 'feeding_system', desc: 'Automated Feeding System' },
    { name: 'environment_sensor', desc: 'Environmental Sensor' },
    { name: 'water_system', desc: 'Automated Watering System' },
  ];

  for (const statusData of statuses) {
    let status = await deviceStatusRepository.findOne({
      where: { name: statusData.name },
    });
    if (!status) {
      status = deviceStatusRepository.create(statusData);
      await deviceStatusRepository.save(status);
      console.log(`✅ Created device status: ${status.name}`);
    }
  }
}

// Command Types Seeding
async function seedCommandTypes(queryRunner: any) {
  const commandTypeRepository = queryRunner.manager.getRepository(CommandType);

  const commandTypes = [
    { name: 'heater_on', desc: 'Turn heater on' },
    { name: 'heater_off', desc: 'Turn heater off' },
    { name: 'feed_dispense', desc: 'Dispense feed' },
    { name: 'water_level', desc: 'Check water level' },
    { name: 'temperature_read', desc: 'Read temperature' },
  ];

  for (const cmdData of commandTypes) {
    let commandType = await commandTypeRepository.findOne({
      where: { name: cmdData.name },
    });
    if (!commandType) {
      commandType = commandTypeRepository.create(cmdData);
      await commandTypeRepository.save(commandType);
      console.log(`✅ Created command type: ${commandType.name}`);
    }
  }
}

// Bird Types Seeding
async function seedBirdTypes(queryRunner: any) {
  const birdTypeRepository = queryRunner.manager.getRepository(BirdType);

  const birdTypes = [
    {
      id: 'd7a8b9c4-1234-5678-9abc-def012345678',
      name: 'Broiler',
      description:
        'Fast-growing meat birds optimized for poultry meat production',
      notes: 'Raised for 5-7 weeks, high feed conversion ratio',
    },
    {
      id: 'e8b9c4d5-2345-6789-abcd-123456789012',
      name: 'Layer',
      description: 'Egg-laying hens optimized for egg production',
      notes: 'Begin laying at 18-20 weeks, produce 280-300 eggs per year',
    },
  ];

  const savedBirdTypes: BirdType[] = [];
  for (const birdTypeData of birdTypes) {
    let birdType = await birdTypeRepository.findOne({
      where: { name: birdTypeData.name },
    });
    if (!birdType) {
      birdType = birdTypeRepository.create(birdTypeData);
      await birdTypeRepository.save(birdType);
      console.log(`✅ Created bird type: ${birdType.name}`);
    } else {
      console.log(`⚠️ Bird type already exists: ${birdType.name}`);
    }
    savedBirdTypes.push(birdType);
  }

  return savedBirdTypes;
}

// Device Seeding
async function seedDevices(queryRunner: any, users: User[]) {
  const deviceRepository = queryRunner.manager.getRepository(Device);
  const deviceStatusRepository =
    queryRunner.manager.getRepository(DeviceStatus);
  const adminUser = users.find((u) => u.email === 'admin@agriflock360.com');
  const smartBrooderStatus = await deviceStatusRepository.findOne({
    where: { name: 'smart_brooder' },
  });

  const devices = [
    {
      device_id: 'BROODER-001',
      device_name: 'Main Brooder Controller',
      device_type: 'smart_brooder' as const,
      owner_id: adminUser!.id,
      device_status_id: smartBrooderStatus!.id,
      firmware_version: 'v2.1.0',
      last_seen: new Date(),
      is_payg_locked: false,
      payg_balance: 100.5,
      installation_date: new Date('2024-11-01'),
      mqtt_topic_prefix: 'farm/brooder/001',
      wifi_ssid: 'FarmNetwork',
      location: 'Main Barn',
      notes: 'Primary brooder controller for broiler house',
    },
    {
      device_id: 'FEEDER-001',
      device_name: 'Automated Feeding System',
      device_type: 'smart_brooder' as const,
      owner_id: adminUser!.id,
      device_status_id: smartBrooderStatus!.id,
      firmware_version: 'v1.8.5',
      last_seen: new Date(Date.now() - 2 * 60 * 60 * 1000),
      is_payg_locked: false,
      payg_balance: 75.25,
      installation_date: new Date('2024-10-15'),
      mqtt_topic_prefix: 'farm/feeder/001',
      wifi_ssid: 'FarmNetwork',
      location: 'Feeding Station A',
      notes: 'Automated feeder for broiler growth stages',
    },
  ];

  const savedDevices: Device[] = [];
  for (const deviceData of devices) {
    let device = await deviceRepository.findOne({
      where: { device_id: deviceData.device_id },
    });
    if (!device) {
      device = deviceRepository.create(deviceData);
      await deviceRepository.save(device);
      console.log(`✅ Created device: ${device.device_name}`);
    } else {
      console.log(`⚠️ Device already exists: ${device.device_name}`);
    }
    savedDevices.push(device);
  }

  return savedDevices;
}

// Batch Seeding
async function seedBatchs(
  queryRunner: any,
  users: User[],
  birdTypes: BirdType[],
) {
  const batchRepository = queryRunner.manager.getRepository(Batch);
  const adminUser = users.find((u) => u.email === 'admin@agriflock360.com');
  const broilerType = birdTypes.find((bt) => bt.name === 'Broiler');
  const layerType = birdTypes.find((bt) => bt.name === 'Layer');

  const batchs = [
    {
      batch_name: 'Broiler Batch #1',
      breed: 'Cobb 500',
      bird_type_id: broilerType!.id,
      initial_count: 1000,
      current_count: 980,
      start_date: new Date('2025-01-01'),
      expected_end_date: new Date('2025-02-15'),
      current_status: 'active' as const,
      user_id: adminUser!.id,
    },
    {
      batch_name: 'Layer Hens Batch #1',
      breed: 'Lohmann Brown',
      bird_type_id: layerType!.id,
      initial_count: 500,
      current_count: 495,
      start_date: new Date('2024-12-01'),
      expected_end_date: new Date('2026-12-01'),
      current_status: 'active' as const,
      user_id: adminUser!.id,
    },
  ];

  const savedBatchs: Batch[] = [];
  for (const batchData of batchs) {
    let batch = await batchRepository.findOne({
      where: { batch_name: batchData.batch_name },
    });
    if (!batch) {
      batch = batchRepository.create(batchData);
      await batchRepository.save(batch);
      console.log(`✅ Created batch: ${batch.batch_name}`);
    } else {
      console.log(`⚠️ Batch already exists: ${batch.batch_name}`);
    }
    savedBatchs.push(batch);
  }

  return savedBatchs;
}

// Telemetry Seeding
async function seedTelemetry(queryRunner: any, devices: Device[]) {
  const telemetryRepository = queryRunner.manager.getRepository(Telemetry);
  const device = devices.find((d) => d.device_id === 'BROODER-001');

  // Generate telemetry data for the last 10 hours
  const telemetryData: any[] = [];
  const now = new Date();

  for (let i = 0; i < 10; i++) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000); // Every hour

    telemetryData.push({
      device_id: device!.id,
      temperature: 32 + Math.random() * 5, // 32-37°C
      humidity: 60 + Math.random() * 15, // 60-75%
      heater_status: Math.random() > 0.3, // Mostly on
      fan_status: Math.random() > 0.7, // Occasionally on
      power_status: true,
      timestamp,
    });
  }

  for (const data of telemetryData) {
    const telemetry = telemetryRepository.create(data);
    await telemetryRepository.save(telemetry);
  }

  console.log(`✅ Created ${telemetryData.length} telemetry records`);
}

// Alerts Seeding
async function seedAlerts(queryRunner: any, devices: Device[], users: User[]) {
  const alertRepository = queryRunner.manager.getRepository(Alert);
  const device = devices.find((d) => d.device_id === 'BROODER-001');
  const adminUser = users.find((u) => u.email === 'admin@agriflock360.com');

  const alerts = [
    {
      device_id: device!.id,
      user_id: adminUser!.id,
      severity: 'high' as const,
      alert_status: 'active' as const,
      alert_type: 'temperature_high',
      message: 'Brooder temperature exceeds safe limit: 38.5°C',
      acknowledged_at: null,
      resolved_at: null,
      meta: { temperature: 38.5 },
    },
    {
      device_id: device!.id,
      user_id: adminUser!.id,
      severity: 'medium' as const,
      alert_status: 'acknowledged' as const,
      alert_type: 'feed_low',
      message: 'Feed level is below 20% - refill required',
      acknowledged_at: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      resolved_at: null,
      meta: { feed_level: 15 },
    },
  ];

  for (const alertData of alerts) {
    const alert = alertRepository.create(alertData);
    await alertRepository.save(alert);
  }

  console.log(`✅ Created ${alerts.length} alerts`);
}

// Batch Histories Seeding
async function seedBatchHistories(
  queryRunner: any,
  batches: Batch[],
  users: User[],
) {
  const batchHistoryRepository =
    queryRunner.manager.getRepository(BatchHistory);
  const batch = batches.find((b) => b.breed === 'Cobb 500');
  const adminUser = users.find((u) => u.email === 'admin@agriflock360.com');

  const histories = [
    {
      created_by: adminUser!.id,
      batch_id: batch!.id,
      previous_count: 1000,
      batch_status: 'active' as const,
      current_count: 980,
      change_type: 'mortality' as const,
      change_amount: -20,
      reason: 'Natural causes in first week',
    },
    {
      created_by: adminUser!.id,
      batch_id: batch!.id,
      previous_count: 980,
      current_count: 975,
      change_type: 'culling' as const,
      change_amount: -5,
      batch_status: 'active' as const,
      reason: 'Poor health indicators',
    },
  ];

  for (const historyData of histories) {
    const batchHistory = batchHistoryRepository.create(historyData);
    await batchHistoryRepository.save(batchHistory);
  }

  console.log(`✅ Created ${histories.length} batch history records`);
}

// Feeding Schedules Seeding
async function seedFeedingSchedules(queryRunner: any, batches: Batch[]) {
  const feedingScheduleRepository =
    queryRunner.manager.getRepository(FeedingSchedule);
  const batch = batches.find((b) => b.breed === 'Cobb 500');

  const schedules = [
    {
      batch_id: batch!.id,
      feed_type: 'Starter Mash (0-2 weeks)',
      quantity_per_day: 45,
      start_date: new Date('2025-01-01'),
      end_date: new Date('2025-01-15'),
      times_per_day: 4,
      is_active: true,
      notes: 'High-protein starter feed for growth',
    },
    {
      batch_id: batch!.id,
      feed_type: 'Grower Mash (3-5 weeks)',
      quantity_per_day: 85,
      start_date: new Date('2025-01-15'),
      end_date: new Date('2025-02-01'),
      times_per_day: 3,
      is_active: false,
      notes: 'Balanced ration for continued growth',
    },
  ];

  const savedSchedules: any[] = [];
  for (const scheduleData of schedules) {
    let schedule = await feedingScheduleRepository.findOne({
      where: {
        batch_id: scheduleData.batch_id,
        feed_type: scheduleData.feed_type,
      },
    });

    if (!schedule) {
      schedule = feedingScheduleRepository.create(scheduleData);
      await feedingScheduleRepository.save(schedule);
      console.log(`✅ Created feeding schedule: ${schedule.feed_type}`);
    } else {
      console.log(`⚠️ Feeding schedule already exists: ${schedule.feed_type}`);
    }
    savedSchedules.push(schedule);
  }

  return savedSchedules;
}

// Vaccination Seeding
async function seedVaccinations(queryRunner: any, batches: Batch[]) {
  const vaccinationRepository = queryRunner.manager.getRepository(Vaccination);
  const batch = batches.find((b) => b.breed === 'Cobb 500');

  const vaccinations = [
    {
      batch_id: batch!.id,
      vaccine_name: 'Newcastle Disease Vaccine',
      vaccine_type: 'Live attenuated',
      scheduled_date: new Date('2025-01-10'),
      completed_date: new Date('2025-01-10'),
      vaccination_status: 'completed' as const,
      dosage: '1ml per bird (eye drop)',
      administered_by: 'Farm Vet',
      birds_vaccinated: 1000,
      cost: 500,
      reminder_sent: true,
    },
    {
      batch_id: batch!.id,
      vaccine_name: 'Infectious Bursal Disease (Gumboro)',
      vaccine_type: 'Live attenuated',
      scheduled_date: new Date('2025-01-20'),
      vaccination_status: 'scheduled' as const,
      dosage: '1ml per bird (drinking water)',
      administered_by: 'Farm Vet',
      birds_vaccinated: 1000,
      cost: 300,
      reminder_sent: false,
    },
  ];

  for (const vacData of vaccinations) {
    let vaccination = await vaccinationRepository.findOne({
      where: {
        batch_id: vacData.batch_id,
        vaccine_name: vacData.vaccine_name,
      },
    });

    if (!vaccination) {
      vaccination = vaccinationRepository.create(vacData);
      await vaccinationRepository.save(vaccination);
      console.log(`✅ Created vaccination: ${vaccination.vaccine_name}`);
    } else {
      console.log(`⚠️ Vaccination already exists: ${vaccination.vaccine_name}`);
    }
  }
}

// Feeding Records Seeding
async function seedFeedingRecords(
  queryRunner: any,
  batches: Batch[],
  feedingSchedules: any[],
  users: User[],
) {
  const feedingRecordRepository =
    queryRunner.manager.getRepository(FeedingRecord);
  const batch = batches.find((b) => b.breed === 'Cobb 500');
  const schedule = feedingSchedules.find((s) =>
    s.feed_type.includes('Starter'),
  );
  const adminUser = users.find((u) => u.email === 'admin@agriflock360.com');

  // Generate feeding records for the last 10 days
  const feedingData: {
    batch_id: string;
    schedule_id: string | null;
    feed_type: string;
    quantity: number;
    cost: number;
    fed_at: Date;
    recorded_by: string;
    notes: string;
  }[] = [];
  const now = new Date();

  for (let i = 0; i < 10; i++) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);

    for (let meal = 0; meal < 4; meal++) {
      // 4 meals per day
      feedingData.push({
        batch_id: batch!.id,
        schedule_id: schedule?.id || null,
        feed_type: schedule ? schedule.feed_type : 'Starter Mash (0-2 weeks)',
        quantity: 40 + Math.random() * 15, // 40-55 kg per meal
        cost: 2650 + Math.random() * 500, // ~65.50 per kg
        fed_at: new Date(date.getTime() + meal * 6 * 60 * 60 * 1000), // Every 6 hours
        recorded_by: adminUser!.id,
        notes: `Meal ${meal + 1} - Day ${i + 1}`,
      });
    }
  }

  for (const data of feedingData) {
    const feedingRecord = feedingRecordRepository.create(data);
    await feedingRecordRepository.save(feedingRecord);
  }

  console.log(`✅ Created ${feedingData.length} feeding records`);
}

// Weight Samples Seeding
async function seedWeightSamples(
  queryRunner: any,
  batches: Batch[],
  users: User[],
) {
  const weightSampleRepository =
    queryRunner.manager.getRepository(WeightSample);
  const batch = batches.find((b) => b.breed === 'Cobb 500');
  const adminUser = users.find((u) => u.email === 'admin@agriflock360.com');

  // Generate weight samples every 7 days for 5 weeks
  const weightData: {
    batch_id: string;
    sample_date: Date;
    sample_size: number;
    average_weight_grams: number;
    min_weight_grams: number;
    max_weight_grams: number;
    recorded_by: string;
    notes: string;
  }[] = [];
  const startDate = new Date('2025-01-01');

  for (let week = 0; week < 5; week++) {
    const sampleDate = new Date(
      startDate.getTime() + week * 7 * 24 * 60 * 60 * 1000,
    );
    const baseWeight = 0.3 + week * 0.8; // Starting weight ~300g, gaining ~800g per week

    weightData.push({
      batch_id: batch!.id,
      sample_date: sampleDate,
      sample_size: 50,
      average_weight_grams: baseWeight * 1000 + (Math.random() - 0.5) * 100, // ±50g variation
      min_weight_grams: (baseWeight - 0.2) * 1000,
      max_weight_grams: (baseWeight + 0.3) * 1000,
      recorded_by: adminUser!.id,
      notes: `Week ${week + 1} - Sample of 50 birds`,
    });
  }

  for (const data of weightData) {
    const weightSample = weightSampleRepository.create(data);
    await weightSampleRepository.save(weightSample);
  }

  console.log(`✅ Created ${weightData.length} weight samples`);
}

// Payment Seeding
async function seedPayments(
  queryRunner: any,
  users: User[],
  devices: Device[],
) {
  const paymentRepository = queryRunner.manager.getRepository(Payment);
  const adminUser = users.find((u) => u.email === 'admin@agriflock360.com');
  const device = devices.find((d) => d.device_id === 'BROODER-001');

  const payments = [
    {
      device_id: device!.id,
      user_id: adminUser!.id,
      amount: 1000,
      base_currency_rate: 1.0,
      currency: 'KES' as const,
      payment_method: 'M-Pesa',
      status: 'completed' as const,
      transaction_ref: 'TXN-001-ACT',
      phone_number: '+254712345678',
      description: 'Brooder activation payment',
      processed_at: new Date(),
    },
    {
      device_id: device!.id,
      user_id: adminUser!.id,
      amount: 500,
      base_currency_rate: 1.0,
      currency: 'KES' as const,
      payment_method: 'M-Pesa',
      status: 'completed' as const,
      transaction_ref: 'TXN-002-TOP',
      phone_number: '+254712345678',
      description: 'Mid-cycle top-up payment',
      processed_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    },
  ];

  for (const paymentData of payments) {
    let payment = await paymentRepository.findOne({
      where: { transaction_ref: paymentData.transaction_ref },
    });

    if (!payment) {
      payment = paymentRepository.create(paymentData);
      await paymentRepository.save(payment);
      console.log(`✅ Created payment: ${payment.transaction_ref}`);
    } else {
      console.log(`⚠️ Payment already exists: ${payment.transaction_ref}`);
    }
  }
}

// Run the seed
seed().catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});
