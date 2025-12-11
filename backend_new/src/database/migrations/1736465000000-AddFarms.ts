// database/migrations/1736465000000-AddFarms.ts
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFarms1736465000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      -- Farms table
      CREATE TABLE IF NOT EXISTS farms (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        farm_name VARCHAR(255) NOT NULL,
        location TEXT,
        total_area DECIMAL(10,2),
        farm_type VARCHAR(20),
        description TEXT,
        contact_info JSONB,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_farms_user ON farms(user_id);

      -- Add farm_id to flocks table
      ALTER TABLE flocks ADD COLUMN IF NOT EXISTS farm_id UUID REFERENCES farms(id) ON DELETE SET NULL;
      CREATE INDEX IF NOT EXISTS idx_flocks_farm ON flocks(farm_id);

      -- Add initial_count to flocks
      ALTER TABLE flocks ADD COLUMN IF NOT EXISTS initial_count INTEGER;
      UPDATE flocks SET initial_count = current_count WHERE initial_count IS NULL;

      -- Add change tracking to flock_history
      ALTER TABLE flock_history 
        ADD COLUMN IF NOT EXISTS change_type VARCHAR(50),
        ADD COLUMN IF NOT EXISTS change_amount INTEGER,
        ADD COLUMN IF NOT EXISTS reason TEXT;

      -- Add weight range to weight_samples
      ALTER TABLE weight_samples
        ADD COLUMN IF NOT EXISTS min_weight_grams DECIMAL(8,2),
        ADD COLUMN IF NOT EXISTS max_weight_grams DECIMAL(8,2),
        ADD COLUMN IF NOT EXISTS notes TEXT;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE flocks DROP COLUMN IF EXISTS farm_id;
      ALTER TABLE flocks DROP COLUMN IF EXISTS initial_count;
      ALTER TABLE flock_history DROP COLUMN IF EXISTS change_type;
      ALTER TABLE flock_history DROP COLUMN IF EXISTS change_amount;
      ALTER TABLE flock_history DROP COLUMN IF EXISTS reason;
      ALTER TABLE weight_samples DROP COLUMN IF EXISTS min_weight_grams;
      ALTER TABLE weight_samples DROP COLUMN IF EXISTS max_weight_grams;
      ALTER TABLE weight_samples DROP COLUMN IF EXISTS notes;
      DROP TABLE IF EXISTS farms CASCADE;
    `);
  }
}
