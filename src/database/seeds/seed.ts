// src/database/seeds/seed.ts
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Role } from '../entities/Role.entity';
import { User } from '../entities/User.entity';
import { Device } from '../entities/Device.entity';
import { Flock } from '../entities/Flock.entity';
import { Payment } from '../entities/Payment.entity';
import { Telemetry } from '../entities/Telemetry.entity';
import { Vaccination } from '../entities/Vaccination.entity';
import { FeedingRecord } from '../entities/FeedingRecord.entity';
// import { Brooder } from '../entities/Brooder.entity';
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
      // 1. Seed Roles
      console.log('📝 Seeding roles...');
      const roles = await seedRoles(queryRunner);

      // 2. Seed Users
      console.log('👥 Seeding users...');
      const users = await seedUsers(queryRunner, roles);

      // 3. Seed Devices
      console.log('📱 Seeding devices...');
      // const devices = await seedDevices(queryRunner, users);

      // 4. Seed Flocks
      console.log('🐔 Seeding flocks...');
      // const flocks = await seedFlock(queryRunner, users);

      // 5. Seed Payments
      console.log('💰 Seeding payments...');
      // const payments = await seedPayments(queryRunner, users, devices);

      // 6. Seed Telemetry Data
      console.log('📊 Seeding telemetry data...');
      // await seedTelemetry(queryRunner, devices);

      // 7. Seed Vaccinations
      console.log('💉 Seeding vaccinations...');
      // await seedVaccinations(queryRunner, flocks);

      // 8. Seed Feeding Records
      console.log('🌾 Seeding feeding records...');
      //   await seedFeeding(queryRunner, flocks);

      // 9. Seed Brooders
      console.log('🔥 Seeding brooders...');
      //   await seedBrooders(queryRunner, users);

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

// Device Seeding
// async function seedDevices(queryRunner: any, users: User[]) {
//   const deviceRepository = queryRunner.manager.getRepository(Device);
//   const adminUser = users.find((u) => u.email === 'admin@agriflock360.com');

//   const devices = [
//     {
//       name: 'Main Brooder Controller',
//       // device_type: 'brooder_controller',
//       device_name: 'BROODER-001',
//       status: 'active' as const,
//       is_online: true,
//       last_seen: new Date(),
//       user_id: adminUser!.id,
//     },
//     {
//       name: 'Chicken Coop Sensor',
//       // device_type: 'environment_sensor',
//       device_name: 'SENSOR-001',
//       status: 'active' as const,
//       is_online: true,
//       last_seen: new Date(),
//       user_id: adminUser!.id,
//     },
//     {
//       name: 'Feeding System Controller',
//       // device_type: 'feeding_controller',
//       device_name: 'FEED-001',
//       status: 'active' as const,
//       is_online: false,
//       last_seen: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
//       user_id: adminUser!.id,
//     },
//   ];

//   const savedDevices: Device[] = [];
//   for (const deviceData of devices) {
//     let device = await deviceRepository.findOne({
//       where: { device_name: deviceData.device_name },
//     });
//     if (!device) {
//       device = deviceRepository.create(deviceData);
//       await deviceRepository.save(device);
//       console.log(`✅ Created device: ${device.name}`);
//     } else {
//       console.log(`⚠️ Device already exists: ${device.name}`);
//     }
//     savedDevices.push(device);
//   }

//   return savedDevices;
// }

// Flock Seeding
async function seedFlock(queryRunner: any, users: User[]) {
  const flockRepository = queryRunner.manager.getRepository(Flock);
  const adminUser = users.find((u) => u.email === 'admin@agriflock360.com');

  const flocks = [
    {
      name: 'Broiler Batch #1',
      breed: 'Cobb 500',
      total_birds: 1000,
      current_birds: 980,
      start_date: new Date('2025-01-01'),
      expected_end_date: new Date('2025-02-15'),
      status: 'active' as const,
      user_id: adminUser!.id,
    },
    {
      name: 'Layer Hens Batch #1',
      breed: 'Lohmann Brown',
      total_birds: 500,
      current_birds: 495,
      start_date: new Date('2024-12-01'),
      expected_end_date: new Date('2026-12-01'),
      status: 'active' as const,
      user_id: adminUser!.id,
    },
  ];

  const savedFlocks: Flock[] = [];
  for (const flockData of flocks) {
    let flock = await flockRepository.findOne({
      where: { name: flockData.name },
    });
    if (!flock) {
      flock = flockRepository.create(flockData);
      await flockRepository.save(flock);
      console.log(`✅ Created flock: ${flock.name}`);
    } else {
      console.log(`⚠️ Flock already exists: ${flock.name}`);
    }
    savedFlocks.push(flock);
  }

  return savedFlocks;
}

// Payment Seeding
// async function seedPayments(
//   queryRunner: any,
//   users: User[],
//   devices: Device[],
// ) {
//   const paymentRepository = queryRunner.manager.getRepository(Payment);
//   const adminUser = users.find((u) => u.email === 'admin@agriflock360.com');
//   const brooderDevice = devices.find(
//     (d) => d.device_type === 'brooder_controller',
//   );

//   const payments = [
//     {
//       user_id: adminUser!.id,
//       device_id: brooderDevice!.id,
//       amount: 50.0,
//       currency: 'KES',
//       payment_method: 'mpesa',
//       status: 'completed' as const,
//       mpesa_receipt_number: 'RE001',
//       phone_number: '+254712345678',
//       description: 'Brooder activation payment',
//     },
//     {
//       user_id: adminUser!.id,
//       device_id: brooderDevice!.id,
//       amount: 25.0,
//       currency: 'KES',
//       payment_method: 'mpesa',
//       status: 'completed' as const,
//       mpesa_receipt_number: 'RE002',
//       phone_number: '+254712345678',
//       description: 'Brooder top-up payment',
//     },
//   ];

//   const savedPayments: Payment[] = [];
//   for (const paymentData of payments) {
//     let payment = await paymentRepository.findOne({
//       where: { mpesa_receipt_number: paymentData.mpesa_receipt_number },
//     });
//     if (!payment) {
//       payment = paymentRepository.create(paymentData);
//       await paymentRepository.save(payment);
//       console.log(`✅ Created payment: ${payment.mpesa_receipt_number}`);
//     } else {
//       console.log(`⚠️ Payment already exists: ${payment.mpesa_receipt_number}`);
//     }
//     savedPayments.push(payment);
//   }

//   return savedPayments;
// }

// Telemetry Seeding
// s

// Vaccination Seeding
async function seedVaccinations(queryRunner: any, flocks: Flock[]) {
  const vaccinationRepository = queryRunner.manager.getRepository(Vaccination);
  const broilerFlock = flocks.find((f) => f.breed === 'Cobb 500');

  const vaccinations = [
    {
      flock_id: broilerFlock!.id,
      vaccine_name: 'Newcastle Disease Vaccine',
      vaccine_type: 'Newcastle',
      scheduled_date: new Date('2025-01-10'),
      completed_date: new Date('2025-01-10'),
      vaccination_status: 'completed' as const,
      dosage: '1ml per bird',
      administered_by: 'Farm Vet',
      birds_vaccinated: 1000,
    },
    {
      flock_id: broilerFlock!.id,
      vaccine_name: 'Gumboro Vaccine',
      vaccine_type: 'Gumboro',
      scheduled_date: new Date('2025-01-20'),
      vaccination_status: 'scheduled' as const,
      dosage: '0.5ml per bird',
      birds_vaccinated: 1000,
    },
  ];

  for (const vacData of vaccinations) {
    let vaccination = await vaccinationRepository.findOne({
      where: {
        flock_id: vacData.flock_id,
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

// Feeding Seeding
// async function seedFeeding(queryRunner: any, flocks: Flock[]) {
//   const feedingRepository = queryRunner.manager.getRepository(FeedingRecord);
//   const broilerFlock = flocks.find(f => f.breed === 'Cobb 500');

//   // Generate feeding records for the last 5 days
//   const feedingData = [];
//   const now = new Date();

//   for (let i = 0; i < 5; i++) {
//     const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);

//     feedingData.push({
//       flock_id: broilerFlock!.id,
//       feed_type: 'Starter Mash',
//       quantity_kg: 50 + Math.random() * 20,
//       feeding_time: date,
//       cost_per_kg: 65.50,
//       notes: `Daily feeding - Day ${i + 1}`,
//     });
//   }

//   for (const data of feedingData) {
//     const feeding = feedingRepository.create(data);
//     await feedingRepository.save(feeding);
//   }

//   console.log(`✅ Created ${feedingData.length} feeding records`);
// }

// Brooder Seeding
// async function seedBrooders(queryRunner: any, users: User[]) {
//   const brooderRepository = queryRunner.manager.getRepository(Brooder);
//   const adminUser = users.find(u => u.email === 'admin@agriflock360.com');

//   const brooders = [
//     {
//       name: 'Main Brooder House',
//       capacity: 1000,
//       current_occupancy: 980,
//       temperature: 32.5,
//       humidity: 65.0,
//       status: 'active' as const,
//       user_id: adminUser!.id,
//     },
//     {
//       name: 'Nursery Brooder',
//       capacity: 200,
//       current_occupancy: 150,
//       temperature: 34.0,
//       humidity: 70.0,
//       status: 'active' as const,
//       user_id: adminUser!.id,
//     },
//   ];

//   for (const brooderData of brooders) {
//     let brooder = await brooderRepository.findOne({ where: { name: brooderData.name } });
//     if (!brooder) {
//       brooder = brooderRepository.create(brooderData);
//       await brooderRepository.save(brooder);
//       console.log(`✅ Created brooder: ${brooder.name}`);
//     } else {
//       console.log(`⚠️ Brooder already exists: ${brooder.name}`);
//     }
//   }
// }

// Run the seed
seed().catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});
