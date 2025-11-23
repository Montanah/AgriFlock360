import { SystemConfig } from '../entities/SystemConfig.entity';
import { Role } from '../entities/Role.entity';
import { dataSource } from '../data-source';

async function seed() {
  await dataSource.initialize();

  // Seed roles
  const adminRole = await dataSource
    .getRepository(Role)
    .save({ name: 'admin', description: 'Administrator' });
  await dataSource
    .getRepository(Role)
    .save({ name: 'farmer', description: 'Farmer user' });

  // Seed system config
  await dataSource.getRepository(SystemConfig).save([
    {
      key: 'payg_daily_rate',
      value: '{"amount": 50, "currency": "KES"}',
      description: 'Daily PAYG rate',
      meta: { version: 1 },
    },
    {
      key: 'alert_thresholds',
      value:
        '{"temp_high": 35, "temp_low": 20, "humidity_low": 40, "humidity_high": 70}',
      description: 'Alert threshold values',
      meta: { version: 1 },
    },
    {
      key: 'maintenance_mode',
      value: '{"enabled": false}',
      description: 'System maintenance status',
      meta: { version: 1 },
    },
  ]);

  console.log('Seeds complete!');
  await dataSource.destroy();
}

seed().catch(console.error);
