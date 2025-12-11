import { MigrationInterface, QueryRunner } from 'typeorm';

export class BatchsTables1764712317459 implements MigrationInterface {
  name = 'BatchsTables1764712317459';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "farms" DROP CONSTRAINT "farms_user_id_fkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "users_role_id_fkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" DROP CONSTRAINT "payments_device_id_fkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" DROP CONSTRAINT "payments_user_id_fkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "devices" DROP CONSTRAINT "devices_owner_id_fkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "devices" DROP CONSTRAINT "devices_device_status_id_fkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "devices" DROP CONSTRAINT "fk_devices_firmware_version_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "feeding_schedules" DROP CONSTRAINT "feeding_schedules_batch_id_fkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "feeding_records" DROP CONSTRAINT "feeding_records_schedule_id_fkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "feeding_records" DROP CONSTRAINT "feeding_records_recorded_by_fkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "feeding_records" DROP CONSTRAINT "feeding_records_batch_id_fkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "weight_samples" DROP CONSTRAINT "weight_samples_recorded_by_fkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "weight_samples" DROP CONSTRAINT "weight_samples_batch_id_fkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "batchs" DROP CONSTRAINT "FK_eb1a352c73f341695809ca75095"`,
    );
    await queryRunner.query(
      `ALTER TABLE "batchs" DROP CONSTRAINT "FK_bfa977de58c6112a1e0f370ab0c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "batchs" DROP CONSTRAINT "FK_46484b9304dc8534a95bb2cacd7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "batchs" DROP CONSTRAINT "FK_15d5dc882abffbe9edd8502d450"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vaccinations" DROP CONSTRAINT "vaccinations_batch_id_fkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_notification_settings" DROP CONSTRAINT "user_notification_settings_user_id_fkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_sessions" DROP CONSTRAINT "user_sessions_user_id_fkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "two_factor_auth" DROP CONSTRAINT "two_factor_auth_user_id_fkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "telemetry" DROP CONSTRAINT "telemetry_device_id_fkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "system_config" DROP CONSTRAINT "system_config_updated_by_fkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sent_notifications" DROP CONSTRAINT "sent_notifications_user_id_fkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payg_transactions" DROP CONSTRAINT "payg_transactions_device_id_fkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payg_transactions" DROP CONSTRAINT "payg_transactions_payment_id_fkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ota_updates" DROP CONSTRAINT "ota_updates_device_id_fkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ota_updates" DROP CONSTRAINT "ota_updates_firmware_id_fkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" DROP CONSTRAINT "notifications_user_id_fkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "issued_device_commands" DROP CONSTRAINT "issued_device_commands_device_id_fkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "issued_device_commands" DROP CONSTRAINT "issued_device_commands_issued_by_fkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "issued_device_commands" DROP CONSTRAINT "issued_device_commands_command_type_id_fkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "device_logs" DROP CONSTRAINT "device_logs_device_id_fkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_user_id_fkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alerts" DROP CONSTRAINT "alerts_device_id_fkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alerts" DROP CONSTRAINT "alerts_user_id_fkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alerts" DROP CONSTRAINT "alerts_acknowledged_by_fkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_178199805b901ccd220ab7740ec"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_17022daf3f885f7d35423e9971e"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_permissions_module"`);
    await queryRunner.query(`DROP INDEX "public"."idx_permissions_action"`);
    await queryRunner.query(`DROP INDEX "public"."idx_bird_types_name"`);
    await queryRunner.query(`DROP INDEX "public"."idx_users_google_id"`);
    await queryRunner.query(`DROP INDEX "public"."idx_users_apple_id"`);
    await queryRunner.query(`DROP INDEX "public"."idx_users_oauth_provider"`);
    await queryRunner.query(`DROP INDEX "public"."idx_device_status_name"`);
    await queryRunner.query(`DROP INDEX "public"."idx_devices_device_id"`);
    await queryRunner.query(
      `DROP INDEX "public"."idx_firmware_device_version_id"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_feeding_flock"`);
    await queryRunner.query(`DROP INDEX "public"."idx_feeding_records_flock"`);
    await queryRunner.query(`DROP INDEX "public"."idx_batchs_bird_type"`);
    await queryRunner.query(`DROP INDEX "public"."idx_vaccinations_flock"`);
    await queryRunner.query(`DROP INDEX "public"."idx_sessions_user_active"`);
    await queryRunner.query(`DROP INDEX "public"."idx_sessions_expires"`);
    await queryRunner.query(`DROP INDEX "public"."idx_uploads_category"`);
    await queryRunner.query(`DROP INDEX "public"."idx_uploads_created_at"`);
    await queryRunner.query(
      `DROP INDEX "public"."idx_rate_limit_identifier_time"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_login_attempts_identifier_time"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_command_type_name"`);
    await queryRunner.query(`DROP INDEX "public"."idx_commands_pending"`);
    await queryRunner.query(
      `DROP INDEX "public"."idx_housing_quantities_unique"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_role_permissions_role"`);
    await queryRunner.query(
      `DROP INDEX "public"."idx_role_permissions_permission"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_role_permissions_unique"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "users_status_check"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_notification_settings" DROP CONSTRAINT "user_notification_settings_timing_minutes_check"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_notification_settings" DROP CONSTRAINT "user_notification_settings_delivery_method_check"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sent_notifications" DROP CONSTRAINT "sent_notifications_timing_minutes_check"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sent_notifications" DROP CONSTRAINT "sent_notifications_delivery_method_check"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" DROP CONSTRAINT "notifications_type_check"`,
    );
    await queryRunner.query(
      `ALTER TABLE "firmware_versions" DROP CONSTRAINT "firmware_versions_version_device_type_key"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sent_notifications" DROP CONSTRAINT "sent_notifications_user_id_notification_type_reference_id_t_key"`,
    );
    await queryRunner.query(
      `CREATE TABLE "subscription_plans" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "plan_type" character varying(100) NOT NULL, "description" text, "base_fee" numeric(10,2) NOT NULL DEFAULT '0', "per_reading_fee" numeric(10,4) NOT NULL DEFAULT '0', "per_alert_fee" numeric(10,4) NOT NULL DEFAULT '0', "per_device_fee" numeric(10,4) NOT NULL DEFAULT '0', "per_kb_fee" numeric(10,4) NOT NULL DEFAULT '0', "free_readings_per_month" integer NOT NULL DEFAULT '0', "free_alerts_per_month" integer NOT NULL DEFAULT '0', "monthly_price" numeric(10,2), "quarterly_price" numeric(10,2), "annual_price" numeric(10,2), "max_devices" integer, "max_readings_per_day" integer, "max_alerts_per_day" integer, "max_data_per_month_kb" bigint, "features" jsonb, "is_active" boolean NOT NULL DEFAULT true, "is_public" boolean NOT NULL DEFAULT true, "sort_order" integer NOT NULL DEFAULT '0', "metadata" jsonb, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_9ab8fe6918451ab3d0a4fb6bb0c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_subscription_plans_active" ON "subscription_plans" ("is_active") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_subscription_plans_type" ON "subscription_plans" ("plan_type") `,
    );
    await queryRunner.query(
      `CREATE TABLE "usage_records" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "subscription_id" uuid NOT NULL, "device_id" uuid, "usage_type" character varying(100) NOT NULL, "usage_date" TIMESTAMP WITH TIME ZONE NOT NULL, "quantity" integer NOT NULL DEFAULT '1', "data_size_kb" bigint, "unit_price" numeric(10,4) NOT NULL, "total_cost" numeric(10,2) NOT NULL, "is_free" boolean NOT NULL DEFAULT false, "is_billed" boolean NOT NULL DEFAULT false, "invoice_id" uuid, "metadata" jsonb, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_e511cf9f7dc53851569f87467a5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_usage_records_type" ON "usage_records" ("usage_type") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_usage_records_date" ON "usage_records" ("usage_date") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_usage_records_device" ON "usage_records" ("device_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_usage_records_subscription" ON "usage_records" ("subscription_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "subscription_invoices" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "invoice_number" character varying(100) NOT NULL, "subscription_id" uuid NOT NULL, "invoice_date" date NOT NULL, "due_date" date NOT NULL, "period_start" date NOT NULL, "period_end" date NOT NULL, "status" character varying(50) NOT NULL DEFAULT 'pending', "subtotal" numeric(12,2) NOT NULL, "discount" numeric(12,2) NOT NULL DEFAULT '0', "tax" numeric(12,2) NOT NULL DEFAULT '0', "total" numeric(12,2) NOT NULL, "amount_paid" numeric(12,2) NOT NULL DEFAULT '0', "balance" numeric(12,2) NOT NULL DEFAULT '0', "usage_summary" jsonb, "line_items" jsonb, "payment_id" uuid, "paid_at" date, "notes" text, "metadata" jsonb, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_6c62b1deceda54a99b61dec8857" UNIQUE ("invoice_number"), CONSTRAINT "PK_7050ae7d81f0f0207b8f1cd2efc" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_subscription_invoices_date" ON "subscription_invoices" ("invoice_date") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_subscription_invoices_status" ON "subscription_invoices" ("status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_subscription_invoices_subscription" ON "subscription_invoices" ("subscription_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "subscriptions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "plan_id" uuid NOT NULL, "status" character varying(50) NOT NULL DEFAULT 'active', "start_date" date NOT NULL, "end_date" date, "next_billing_date" date, "trial_end_date" date, "auto_renew" boolean NOT NULL DEFAULT false, "current_period_start" date, "current_period_end" date, "balance" numeric(12,2) NOT NULL DEFAULT '0', "low_balance_threshold" numeric(12,2) NOT NULL DEFAULT '0', "auto_topup_enabled" boolean NOT NULL DEFAULT false, "auto_topup_amount" numeric(10,2), "auto_topup_trigger" numeric(10,2), "custom_max_devices" integer, "custom_max_readings_per_day" integer, "custom_max_alerts_per_day" integer, "current_readings_count" integer NOT NULL DEFAULT '0', "current_alerts_count" integer NOT NULL DEFAULT '0', "current_data_usage_kb" bigint NOT NULL DEFAULT '0', "current_charges" numeric(12,2) NOT NULL DEFAULT '0', "total_readings" bigint NOT NULL DEFAULT '0', "total_alerts" bigint NOT NULL DEFAULT '0', "total_spent" numeric(12,2) NOT NULL DEFAULT '0', "cancelled_at" date, "cancellation_reason" character varying(255), "cancellation_notes" text, "discount_code" character varying(100), "discount_percentage" numeric(5,2) NOT NULL DEFAULT '0', "discount_amount" numeric(10,2) NOT NULL DEFAULT '0', "metadata" jsonb, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_a87248d73155605cf782be9ee5e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_subscriptions_dates" ON "subscriptions" ("start_date", "end_date") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_subscriptions_status" ON "subscriptions" ("status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_subscriptions_plan" ON "subscriptions" ("plan_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_subscriptions_user" ON "subscriptions" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "extension_officers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "officer_type" character varying(100) NOT NULL, "email" character varying(255) NOT NULL, "phone_number" character varying(20) NOT NULL, "region" character varying(255), "age" integer, "gender" character varying(20), "years_of_experience" integer, "profile_bio" text, "id_photo_url" text, "face_selfie_url" text, "certificate_url" text, "additional_certificate_url" text, "license_number" character varying(255), "license_expiry_date" date, "status" character varying(50) NOT NULL DEFAULT 'active', "is_verified" boolean NOT NULL DEFAULT false, "verified_at" date, "verified_by" character varying(255), "specializations" jsonb, "coverage_areas" jsonb, "average_rating" numeric(5,2) NOT NULL DEFAULT '0', "total_appraisals" integer NOT NULL DEFAULT '0', "contact_info" jsonb, "metadata" jsonb, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_348f22c319a2cabfa81ee18ca37" UNIQUE ("email"), CONSTRAINT "UQ_ec1747dee766be05bc435351ba1" UNIQUE ("phone_number"), CONSTRAINT "PK_0f60830cdaeaa2f2b5ff4abf9ca" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_extension_officers_status" ON "extension_officers" ("status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_extension_officers_region" ON "extension_officers" ("region") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_extension_officers_type" ON "extension_officers" ("officer_type") `,
    );
    await queryRunner.query(
      `CREATE TABLE "field_appraisals" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "officer_id" uuid NOT NULL, "farmer_id" uuid NOT NULL, "farm_id" uuid, "visit_date" TIMESTAMP WITH TIME ZONE NOT NULL, "visit_purpose" character varying(255), "latitude" numeric(10,8), "longitude" numeric(11,8), "location_name" character varying(255), "structure_integrity_score" integer, "ventilation_score" integer, "hygiene_score" integer, "biosecurity_score" integer, "feed_storage_score" integer, "water_reliability_score" integer, "brooder_verified" boolean NOT NULL DEFAULT false, "brooder_condition" text, "feeders_verified" boolean NOT NULL DEFAULT false, "feeders_condition" text, "drinkers_verified" boolean NOT NULL DEFAULT false, "drinkers_condition" text, "farmer_knowledge_score" integer, "farmer_knowledge_notes" text, "buyer_verified" boolean NOT NULL DEFAULT false, "buyer_name" character varying(255), "buyer_contact" character varying(20), "fraud_flag_raised" boolean NOT NULL DEFAULT false, "fraud_indicators" jsonb, "photos" jsonb, "overall_score" integer NOT NULL DEFAULT '0', "recommendation" text NOT NULL, "observations" text, "action_items" text, "follow_up_date" date, "status" character varying(50) NOT NULL DEFAULT 'completed', "checklist" jsonb, "recommendations_given" jsonb, "farmer_rating" integer, "farmer_feedback" text, "metadata" jsonb, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_418f0b585bcec181c010987c76b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_field_appraisals_status" ON "field_appraisals" ("status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_field_appraisals_date" ON "field_appraisals" ("visit_date") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_field_appraisals_farm" ON "field_appraisals" ("farm_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_field_appraisals_farmer" ON "field_appraisals" ("farmer_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_field_appraisals_officer" ON "field_appraisals" ("officer_id") `,
    );
    await queryRunner.query(`ALTER TABLE "bird_types" DROP COLUMN "is_active"`);
    await queryRunner.query(
      `ALTER TABLE "devices" DROP COLUMN "firmware_version"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP CONSTRAINT "PK_84059017c90bfcb701b8fa42297"`,
    );
    await queryRunner.query(`ALTER TABLE "role_permissions" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP COLUMN "created_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "farms" ADD "farmPhoto" character varying(500)`,
    );
    await queryRunner.query(`ALTER TABLE "devices" ADD "subscription_id" uuid`);
    await queryRunner.query(
      `ALTER TABLE "batchs" ADD "batch_type" character varying(255)`,
    );
    await queryRunner.query(`ALTER TABLE "batchs" ADD "age" integer NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "batchs" ADD "birds_alive" integer NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "batchs" ADD "current_weight" integer NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "batchs" ADD "expected_weight" integer NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "batchs" ADD "feeding_time" character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "batchs" ADD "feeding_schedule" jsonb`,
    );
    await queryRunner.query(
      `ALTER TABLE "batchs" ADD "batchPhoto" character varying(500)`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD CONSTRAINT "PK_84059017c90bfcb701b8fa42297" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP CONSTRAINT "PK_84059017c90bfcb701b8fa42297"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD CONSTRAINT "PK_25d24010f53bb80b78e412c9656" PRIMARY KEY ("role_id", "permission_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "farms" ALTER COLUMN "is_active" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "farms" ALTER COLUMN "created_at" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "farms" ALTER COLUMN "updated_at" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "feeding_recommendations" ALTER COLUMN "created_at" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "feeding_recommendations" ALTER COLUMN "updated_at" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "bird_types" ALTER COLUMN "created_at" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "bird_types" ALTER COLUMN "updated_at" SET DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "status"`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "status" character varying NOT NULL DEFAULT 'active'`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "is_active" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "created_at" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "updated_at" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "device_status" ALTER COLUMN "created_at" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "device_status" ALTER COLUMN "updated_at" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "firmware_versions" ALTER COLUMN "release_type" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "firmware_versions" ALTER COLUMN "is_mandatory" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "firmware_versions" ALTER COLUMN "status" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "firmware_versions" ALTER COLUMN "created_at" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "firmware_versions" ALTER COLUMN "updated_at" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" ALTER COLUMN "currency" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" DROP COLUMN "payment_method"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" ADD "payment_method" character varying(20)`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" DROP COLUMN "payment_purpose"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" ADD "payment_purpose" character varying`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_payments_status"`);
    await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN "status"`);
    await queryRunner.query(
      `ALTER TABLE "payments" ADD "status" character varying NOT NULL DEFAULT 'pending'`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" ALTER COLUMN "transaction_date" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" ALTER COLUMN "transaction_date" SET DEFAULT NOW()`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" ALTER COLUMN "created_at" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" ALTER COLUMN "updated_at" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "devices" DROP CONSTRAINT "devices_device_id_key"`,
    );
    await queryRunner.query(`ALTER TABLE "devices" DROP COLUMN "device_type"`);
    await queryRunner.query(`DROP TYPE "public"."device_type"`);
    await queryRunner.query(
      `ALTER TABLE "devices" ADD "device_type" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "devices" ALTER COLUMN "is_payg_locked" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "devices" ALTER COLUMN "payg_balance" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "devices" ALTER COLUMN "payg_balance" SET DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "devices" ALTER COLUMN "created_at" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "devices" ALTER COLUMN "updated_at" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "batch_history" ALTER COLUMN "created_at" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "batch_history" ALTER COLUMN "updated_at" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "feeding_schedules" ALTER COLUMN "times_per_day" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "feeding_schedules" ALTER COLUMN "is_active" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "feeding_schedules" ALTER COLUMN "created_at" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "feeding_schedules" ALTER COLUMN "updated_at" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "feeding_records" ALTER COLUMN "age" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "feeding_records" ALTER COLUMN "age" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "feeding_records" ALTER COLUMN "fed_at" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "feeding_records" ALTER COLUMN "created_at" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "weight_samples" ALTER COLUMN "sample_size" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "batchs" ALTER COLUMN "bird_type_id" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "batchs" ALTER COLUMN "start_date" SET DEFAULT ('now'::text)::date`,
    );
    await queryRunner.query(
      `ALTER TABLE "batchs" ALTER COLUMN "created_at" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "batchs" ALTER COLUMN "updated_at" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "vaccinations" ALTER COLUMN "reminder_sent" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "vaccinations" ALTER COLUMN "source" SET DEFAULT 'catalog'`,
    );
    await queryRunner.query(
      `ALTER TABLE "vaccinations" ALTER COLUMN "created_at" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "vaccinations" ALTER COLUMN "updated_at" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "vaccine_catalog" ALTER COLUMN "created_at" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "vaccine_catalog" ALTER COLUMN "updated_at" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_preferences" ALTER COLUMN "created_at" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_preferences" ALTER COLUMN "updated_at" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_activities" ALTER COLUMN "created_at" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_sessions" ALTER COLUMN "user_agent" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_sessions" ALTER COLUMN "is_active" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_sessions" ALTER COLUMN "created_at" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "uploads" ALTER COLUMN "created_at" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "two_factor_auth" DROP CONSTRAINT "two_factor_auth_user_id_key"`,
    );
    await queryRunner.query(
      `ALTER TABLE "two_factor_auth" ALTER COLUMN "is_enabled" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "two_factor_auth" DROP COLUMN "backup_codes"`,
    );
    await queryRunner.query(
      `ALTER TABLE "two_factor_auth" ADD "backup_codes" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "two_factor_auth" ALTER COLUMN "created_at" SET NOT NULL`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_telemetry_device_time"`);
    await queryRunner.query(
      `ALTER TABLE "telemetry" DROP CONSTRAINT "telemetry_pkey"`,
    );
    await queryRunner.query(`ALTER TABLE "telemetry" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "telemetry" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "telemetry" ADD CONSTRAINT "PK_9b2e5d3feb141269a262aa75fe8" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "telemetry" ALTER COLUMN "device_id" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "telemetry" ALTER COLUMN "heater_status" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "telemetry" ALTER COLUMN "fan_status" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "telemetry" ALTER COLUMN "power_status" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "telemetry" ALTER COLUMN "timestamp" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "system_config" ALTER COLUMN "updated_at" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "system_config" ALTER COLUMN "updated_at" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP CONSTRAINT "PK_64c787dc722a5e6856df47f45a1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD CONSTRAINT "PK_440fc6de1c80777a3d1abcc44f5" PRIMARY KEY ("permission_id", "id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP CONSTRAINT "PK_440fc6de1c80777a3d1abcc44f5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD CONSTRAINT "PK_84059017c90bfcb701b8fa42297" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "rate_limit_logs" ALTER COLUMN "created_at" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "payg_transactions" ALTER COLUMN "created_at" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "ota_updates" ALTER COLUMN "status" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "ota_updates" ALTER COLUMN "progress" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "ota_updates" ALTER COLUMN "retry_count" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "ota_updates" ALTER COLUMN "created_at" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "ota_updates" ALTER COLUMN "updated_at" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" DROP COLUMN "entity_type"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD "entity_type" uuid`,
    );
    await queryRunner.query(`ALTER TABLE "notifications" DROP COLUMN "type"`);
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD "type" character varying NOT NULL DEFAULT 'info'`,
    );
    await queryRunner.query(
      `ALTER TABLE "login_attempts" ALTER COLUMN "created_at" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "command_type" ALTER COLUMN "created_at" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "command_type" ALTER COLUMN "updated_at" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "issued_device_commands" ALTER COLUMN "device_id" SET NOT NULL`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_commands_status"`);
    await queryRunner.query(
      `ALTER TABLE "issued_device_commands" DROP COLUMN "command_status"`,
    );
    await queryRunner.query(
      `ALTER TABLE "issued_device_commands" ADD "command_status" character varying NOT NULL DEFAULT 'pending'`,
    );
    await queryRunner.query(
      `ALTER TABLE "issued_device_commands" ALTER COLUMN "created_at" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "inventory_categories" ALTER COLUMN "created_at" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "inventory_categories" ALTER COLUMN "updated_at" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "inventory_items" ALTER COLUMN "created_at" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "inventory_items" ALTER COLUMN "updated_at" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "inventory_transactions" ALTER COLUMN "created_at" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "housing_quotations" ALTER COLUMN "created_at" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "housing_materials" ALTER COLUMN "created_at" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "housing_materials" ALTER COLUMN "updated_at" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "housing_quantities" ALTER COLUMN "created_at" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "housing_quantities" ALTER COLUMN "updated_at" SET DEFAULT now()`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_logs_device_time"`);
    await queryRunner.query(
      `ALTER TABLE "device_logs" DROP CONSTRAINT "device_logs_pkey"`,
    );
    await queryRunner.query(`ALTER TABLE "device_logs" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "device_logs" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "device_logs" ADD CONSTRAINT "PK_16e38d55a3924c19dfb91dfc5ec" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "device_logs" ALTER COLUMN "device_id" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "device_logs" ALTER COLUMN "timestamp" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "device_tokens" ALTER COLUMN "created_at" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "device_tokens" ALTER COLUMN "updated_at" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_pkey"`,
    );
    await queryRunner.query(`ALTER TABLE "audit_logs" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "audit_logs" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "audit_logs" ADD CONSTRAINT "PK_1bb179d048bbc581caa3b013439" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "audit_logs" ALTER COLUMN "created_at" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "alerts" ALTER COLUMN "device_id" SET NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "alerts" DROP COLUMN "severity"`);
    await queryRunner.query(
      `ALTER TABLE "alerts" ADD "severity" character varying NOT NULL`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_alerts_status"`);
    await queryRunner.query(`ALTER TABLE "alerts" DROP COLUMN "alert_status"`);
    await queryRunner.query(
      `ALTER TABLE "alerts" ADD "alert_status" character varying NOT NULL DEFAULT 'active'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alerts" ALTER COLUMN "created_at" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP CONSTRAINT "PK_84059017c90bfcb701b8fa42297"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD CONSTRAINT "PK_dacada7b409a8e89b675efd2f2e" PRIMARY KEY ("id", "role_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP CONSTRAINT "PK_dacada7b409a8e89b675efd2f2e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD CONSTRAINT "PK_64c787dc722a5e6856df47f45a1" PRIMARY KEY ("role_id", "id", "permission_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_payments_status" ON "payments" ("status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_devices_firmware_version" ON "devices" ("firmware_version_id") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_devices_device_id" ON "devices" ("device_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_batch_history_created" ON "batch_history" ("created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_batch_history_batch" ON "batch_history" ("batch_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_weight_samples_date" ON "weight_samples" ("sample_date") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_weight_samples_batch" ON "weight_samples" ("batch_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_vaccinations_batch" ON "vaccinations" ("batch_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_telemetry_device_time" ON "telemetry" ("device_id", "timestamp") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_role_permissions_unique" ON "role_permissions" ("role_id", "permission_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_role_permissions_permission" ON "role_permissions" ("permission_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_role_permissions_role" ON "role_permissions" ("role_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_commands_status" ON "issued_device_commands" ("command_status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_logs_device_time" ON "device_logs" ("device_id", "timestamp") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_alerts_status" ON "alerts" ("alert_status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_178199805b901ccd220ab7740e" ON "role_permissions" ("role_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_17022daf3f885f7d35423e9971" ON "role_permissions" ("permission_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "farms" ADD CONSTRAINT "FK_7bf65ce0749585b87ac2a7ce429" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_a2cecd1a3531c0b041e29ba46e1" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "usage_records" ADD CONSTRAINT "FK_4733c4313650f4e34a8396599ee" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "usage_records" ADD CONSTRAINT "FK_2176ec02b2218f3ce14e5e38763" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" ADD CONSTRAINT "FK_9a6e6e244818561bc0eab48ea06" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" ADD CONSTRAINT "FK_427785468fb7d2733f59e7d7d39" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscription_invoices" ADD CONSTRAINT "FK_4f183991dc9bcbda39fa6141931" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscription_invoices" ADD CONSTRAINT "FK_b3ec35008b5d8ed730bc1045a14" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" ADD CONSTRAINT "FK_d0a95ef8a28188364c546eb65c1" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" ADD CONSTRAINT "FK_e45fca5d912c3a2fab512ac25dc" FOREIGN KEY ("plan_id") REFERENCES "subscription_plans"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "devices" ADD CONSTRAINT "FK_cce90811a9e65e2c51357a0fbbd" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "devices" ADD CONSTRAINT "FK_aae9b232a92f873113cc7f78fc1" FOREIGN KEY ("device_status_id") REFERENCES "device_status"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "devices" ADD CONSTRAINT "FK_758d5b763efdb842ec8ed000f30" FOREIGN KEY ("firmware_version_id") REFERENCES "firmware_versions"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "devices" ADD CONSTRAINT "FK_6cc0b90be758458b261715c2238" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "batch_history" ADD CONSTRAINT "FK_9879b9fa9ca2930741fa930deae" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "batch_history" ADD CONSTRAINT "FK_f820d976378075ac881bb5922e4" FOREIGN KEY ("batch_id") REFERENCES "batchs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "weight_samples" ADD CONSTRAINT "FK_07e2414e59e5c445beb2a107ecf" FOREIGN KEY ("batch_id") REFERENCES "batchs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "weight_samples" ADD CONSTRAINT "FK_a6a437cc5338d389e84341ba88b" FOREIGN KEY ("recorded_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "batchs" ADD CONSTRAINT "FK_eb1a352c73f341695809ca75095" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "batchs" ADD CONSTRAINT "FK_bfa977de58c6112a1e0f370ab0c" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "batchs" ADD CONSTRAINT "FK_46484b9304dc8534a95bb2cacd7" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "batchs" ADD CONSTRAINT "FK_15d5dc882abffbe9edd8502d450" FOREIGN KEY ("bird_type_id") REFERENCES "bird_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "vaccinations" ADD CONSTRAINT "FK_f5da34bc1ae65997cbf627095a3" FOREIGN KEY ("batch_id") REFERENCES "batchs"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_notification_settings" ADD CONSTRAINT "FK_52182ffd0f785e8256f8fcb4fd6" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "telemetry" ADD CONSTRAINT "FK_1b1f8787dd0ad68df686cad2829" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "system_config" ADD CONSTRAINT "FK_674473bbaa9859ba7e7d9f7ea9e" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sent_notifications" ADD CONSTRAINT "FK_e4cafad841018448953ae6817a1" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_178199805b901ccd220ab7740ec" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_17022daf3f885f7d35423e9971e" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "payg_transactions" ADD CONSTRAINT "FK_5decb91ca0fd06b5d484d71b74d" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "payg_transactions" ADD CONSTRAINT "FK_91fb4c96ba0d74e230c973c2f4c" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ota_updates" ADD CONSTRAINT "FK_5cc1abee300fca2b60febfd9a78" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ota_updates" ADD CONSTRAINT "FK_fc62205f0408eac325b23d20548" FOREIGN KEY ("firmware_id") REFERENCES "firmware_versions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD CONSTRAINT "FK_9a8a82462cab47c73d25f49261f" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "issued_device_commands" ADD CONSTRAINT "FK_a682083e75caef3dfafae1d2874" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "issued_device_commands" ADD CONSTRAINT "FK_f1eca4fb9bd72d0a491eff16723" FOREIGN KEY ("issued_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "issued_device_commands" ADD CONSTRAINT "FK_314fd3e138fe4ec5ef743059f51" FOREIGN KEY ("command_type_id") REFERENCES "command_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "field_appraisals" ADD CONSTRAINT "FK_173ed7bda64e73fdafc145b3073" FOREIGN KEY ("officer_id") REFERENCES "extension_officers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "field_appraisals" ADD CONSTRAINT "FK_b5d86395f0456fbeb91d0f7afb6" FOREIGN KEY ("farmer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "field_appraisals" ADD CONSTRAINT "FK_9e76fd7d3658e8082c65919da3a" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "device_logs" ADD CONSTRAINT "FK_3c53571cd0e501be51f6fcb72f8" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alerts" ADD CONSTRAINT "FK_bde35b32d03b804b0944331ac85" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alerts" ADD CONSTRAINT "FK_f1eba840c1761991f142affee66" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alerts" DROP CONSTRAINT "FK_f1eba840c1761991f142affee66"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alerts" DROP CONSTRAINT "FK_bde35b32d03b804b0944331ac85"`,
    );
    await queryRunner.query(
      `ALTER TABLE "device_logs" DROP CONSTRAINT "FK_3c53571cd0e501be51f6fcb72f8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "field_appraisals" DROP CONSTRAINT "FK_9e76fd7d3658e8082c65919da3a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "field_appraisals" DROP CONSTRAINT "FK_b5d86395f0456fbeb91d0f7afb6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "field_appraisals" DROP CONSTRAINT "FK_173ed7bda64e73fdafc145b3073"`,
    );
    await queryRunner.query(
      `ALTER TABLE "issued_device_commands" DROP CONSTRAINT "FK_314fd3e138fe4ec5ef743059f51"`,
    );
    await queryRunner.query(
      `ALTER TABLE "issued_device_commands" DROP CONSTRAINT "FK_f1eca4fb9bd72d0a491eff16723"`,
    );
    await queryRunner.query(
      `ALTER TABLE "issued_device_commands" DROP CONSTRAINT "FK_a682083e75caef3dfafae1d2874"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" DROP CONSTRAINT "FK_9a8a82462cab47c73d25f49261f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ota_updates" DROP CONSTRAINT "FK_fc62205f0408eac325b23d20548"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ota_updates" DROP CONSTRAINT "FK_5cc1abee300fca2b60febfd9a78"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payg_transactions" DROP CONSTRAINT "FK_91fb4c96ba0d74e230c973c2f4c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payg_transactions" DROP CONSTRAINT "FK_5decb91ca0fd06b5d484d71b74d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_17022daf3f885f7d35423e9971e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_178199805b901ccd220ab7740ec"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sent_notifications" DROP CONSTRAINT "FK_e4cafad841018448953ae6817a1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "system_config" DROP CONSTRAINT "FK_674473bbaa9859ba7e7d9f7ea9e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "telemetry" DROP CONSTRAINT "FK_1b1f8787dd0ad68df686cad2829"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_notification_settings" DROP CONSTRAINT "FK_52182ffd0f785e8256f8fcb4fd6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vaccinations" DROP CONSTRAINT "FK_f5da34bc1ae65997cbf627095a3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "batchs" DROP CONSTRAINT "FK_15d5dc882abffbe9edd8502d450"`,
    );
    await queryRunner.query(
      `ALTER TABLE "batchs" DROP CONSTRAINT "FK_46484b9304dc8534a95bb2cacd7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "batchs" DROP CONSTRAINT "FK_bfa977de58c6112a1e0f370ab0c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "batchs" DROP CONSTRAINT "FK_eb1a352c73f341695809ca75095"`,
    );
    await queryRunner.query(
      `ALTER TABLE "weight_samples" DROP CONSTRAINT "FK_a6a437cc5338d389e84341ba88b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "weight_samples" DROP CONSTRAINT "FK_07e2414e59e5c445beb2a107ecf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "batch_history" DROP CONSTRAINT "FK_f820d976378075ac881bb5922e4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "batch_history" DROP CONSTRAINT "FK_9879b9fa9ca2930741fa930deae"`,
    );
    await queryRunner.query(
      `ALTER TABLE "devices" DROP CONSTRAINT "FK_6cc0b90be758458b261715c2238"`,
    );
    await queryRunner.query(
      `ALTER TABLE "devices" DROP CONSTRAINT "FK_758d5b763efdb842ec8ed000f30"`,
    );
    await queryRunner.query(
      `ALTER TABLE "devices" DROP CONSTRAINT "FK_aae9b232a92f873113cc7f78fc1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "devices" DROP CONSTRAINT "FK_cce90811a9e65e2c51357a0fbbd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_e45fca5d912c3a2fab512ac25dc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_d0a95ef8a28188364c546eb65c1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscription_invoices" DROP CONSTRAINT "FK_b3ec35008b5d8ed730bc1045a14"`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscription_invoices" DROP CONSTRAINT "FK_4f183991dc9bcbda39fa6141931"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" DROP CONSTRAINT "FK_427785468fb7d2733f59e7d7d39"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" DROP CONSTRAINT "FK_9a6e6e244818561bc0eab48ea06"`,
    );
    await queryRunner.query(
      `ALTER TABLE "usage_records" DROP CONSTRAINT "FK_2176ec02b2218f3ce14e5e38763"`,
    );
    await queryRunner.query(
      `ALTER TABLE "usage_records" DROP CONSTRAINT "FK_4733c4313650f4e34a8396599ee"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_a2cecd1a3531c0b041e29ba46e1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "farms" DROP CONSTRAINT "FK_7bf65ce0749585b87ac2a7ce429"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_17022daf3f885f7d35423e9971"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_178199805b901ccd220ab7740e"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_alerts_status"`);
    await queryRunner.query(`DROP INDEX "public"."idx_logs_device_time"`);
    await queryRunner.query(`DROP INDEX "public"."idx_commands_status"`);
    await queryRunner.query(`DROP INDEX "public"."idx_role_permissions_role"`);
    await queryRunner.query(
      `DROP INDEX "public"."idx_role_permissions_permission"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_role_permissions_unique"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_telemetry_device_time"`);
    await queryRunner.query(`DROP INDEX "public"."idx_vaccinations_batch"`);
    await queryRunner.query(`DROP INDEX "public"."idx_weight_samples_batch"`);
    await queryRunner.query(`DROP INDEX "public"."idx_weight_samples_date"`);
    await queryRunner.query(`DROP INDEX "public"."idx_batch_history_batch"`);
    await queryRunner.query(`DROP INDEX "public"."idx_batch_history_created"`);
    await queryRunner.query(`DROP INDEX "public"."idx_devices_device_id"`);
    await queryRunner.query(
      `DROP INDEX "public"."idx_devices_firmware_version"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_payments_status"`);
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP CONSTRAINT "PK_64c787dc722a5e6856df47f45a1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD CONSTRAINT "PK_dacada7b409a8e89b675efd2f2e" PRIMARY KEY ("role_id", "id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP CONSTRAINT "PK_dacada7b409a8e89b675efd2f2e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD CONSTRAINT "PK_84059017c90bfcb701b8fa42297" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "alerts" ALTER COLUMN "created_at" DROP NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "alerts" DROP COLUMN "alert_status"`);
    await queryRunner.query(
      `ALTER TABLE "alerts" ADD "alert_status" character varying(20) NOT NULL DEFAULT 'active'`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_alerts_status" ON "alerts" ("alert_status") `,
    );
    await queryRunner.query(`ALTER TABLE "alerts" DROP COLUMN "severity"`);
    await queryRunner.query(
      `ALTER TABLE "alerts" ADD "severity" character varying(20) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "alerts" ALTER COLUMN "device_id" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "audit_logs" ALTER COLUMN "created_at" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "audit_logs" DROP CONSTRAINT "PK_1bb179d048bbc581caa3b013439"`,
    );
    await queryRunner.query(`ALTER TABLE "audit_logs" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "audit_logs" ADD "id" BIGSERIAL NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "device_tokens" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "device_tokens" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "device_logs" ALTER COLUMN "timestamp" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "device_logs" ALTER COLUMN "device_id" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "device_logs" DROP CONSTRAINT "PK_16e38d55a3924c19dfb91dfc5ec"`,
    );
    await queryRunner.query(`ALTER TABLE "device_logs" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "device_logs" ADD "id" BIGSERIAL NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "device_logs" ADD CONSTRAINT "device_logs_pkey" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_logs_device_time" ON "device_logs" ("device_id", "timestamp") `,
    );
    await queryRunner.query(
      `ALTER TABLE "housing_quantities" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "housing_quantities" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "housing_materials" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "housing_materials" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "housing_quotations" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "inventory_transactions" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "inventory_items" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "inventory_items" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "inventory_categories" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "inventory_categories" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "issued_device_commands" ALTER COLUMN "created_at" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "issued_device_commands" DROP COLUMN "command_status"`,
    );
    await queryRunner.query(
      `ALTER TABLE "issued_device_commands" ADD "command_status" character varying(20) NOT NULL DEFAULT 'pending'`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_commands_status" ON "issued_device_commands" ("command_status") `,
    );
    await queryRunner.query(
      `ALTER TABLE "issued_device_commands" ALTER COLUMN "device_id" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "command_type" ALTER COLUMN "updated_at" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "command_type" ALTER COLUMN "created_at" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "login_attempts" ALTER COLUMN "created_at" DROP NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "notifications" DROP COLUMN "type"`);
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD "type" text NOT NULL DEFAULT 'info'`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" DROP COLUMN "entity_type"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD "entity_type" character varying(50)`,
    );
    await queryRunner.query(
      `ALTER TABLE "ota_updates" ALTER COLUMN "updated_at" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "ota_updates" ALTER COLUMN "created_at" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "ota_updates" ALTER COLUMN "retry_count" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "ota_updates" ALTER COLUMN "progress" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "ota_updates" ALTER COLUMN "status" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "payg_transactions" ALTER COLUMN "created_at" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "rate_limit_logs" ALTER COLUMN "created_at" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP CONSTRAINT "PK_84059017c90bfcb701b8fa42297"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD CONSTRAINT "PK_440fc6de1c80777a3d1abcc44f5" PRIMARY KEY ("permission_id", "id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP CONSTRAINT "PK_440fc6de1c80777a3d1abcc44f5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD CONSTRAINT "PK_64c787dc722a5e6856df47f45a1" PRIMARY KEY ("role_id", "permission_id", "id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "system_config" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "system_config" ALTER COLUMN "updated_at" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "telemetry" ALTER COLUMN "timestamp" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "telemetry" ALTER COLUMN "power_status" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "telemetry" ALTER COLUMN "fan_status" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "telemetry" ALTER COLUMN "heater_status" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "telemetry" ALTER COLUMN "device_id" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "telemetry" DROP CONSTRAINT "PK_9b2e5d3feb141269a262aa75fe8"`,
    );
    await queryRunner.query(`ALTER TABLE "telemetry" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "telemetry" ADD "id" BIGSERIAL NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "telemetry" ADD CONSTRAINT "telemetry_pkey" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_telemetry_device_time" ON "telemetry" ("device_id", "timestamp") `,
    );
    await queryRunner.query(
      `ALTER TABLE "two_factor_auth" ALTER COLUMN "created_at" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "two_factor_auth" DROP COLUMN "backup_codes"`,
    );
    await queryRunner.query(
      `ALTER TABLE "two_factor_auth" ADD "backup_codes" text array`,
    );
    await queryRunner.query(
      `ALTER TABLE "two_factor_auth" ALTER COLUMN "is_enabled" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "two_factor_auth" ADD CONSTRAINT "two_factor_auth_user_id_key" UNIQUE ("user_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "uploads" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_sessions" ALTER COLUMN "created_at" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_sessions" ALTER COLUMN "is_active" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_sessions" ALTER COLUMN "user_agent" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_activities" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_preferences" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_preferences" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "vaccine_catalog" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "vaccine_catalog" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "vaccinations" ALTER COLUMN "updated_at" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "vaccinations" ALTER COLUMN "created_at" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "vaccinations" ALTER COLUMN "source" SET DEFAULT 'manual'`,
    );
    await queryRunner.query(
      `ALTER TABLE "vaccinations" ALTER COLUMN "reminder_sent" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "batchs" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "batchs" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "batchs" ALTER COLUMN "start_date" SET DEFAULT CURRENT_DATE`,
    );
    await queryRunner.query(
      `ALTER TABLE "batchs" ALTER COLUMN "bird_type_id" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "weight_samples" ALTER COLUMN "sample_size" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "feeding_records" ALTER COLUMN "created_at" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "feeding_records" ALTER COLUMN "fed_at" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "feeding_records" ALTER COLUMN "age" SET DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "feeding_records" ALTER COLUMN "age" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "feeding_schedules" ALTER COLUMN "updated_at" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "feeding_schedules" ALTER COLUMN "created_at" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "feeding_schedules" ALTER COLUMN "is_active" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "feeding_schedules" ALTER COLUMN "times_per_day" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "batch_history" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "batch_history" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "devices" ALTER COLUMN "updated_at" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "devices" ALTER COLUMN "created_at" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "devices" ALTER COLUMN "payg_balance" SET DEFAULT 0.00`,
    );
    await queryRunner.query(
      `ALTER TABLE "devices" ALTER COLUMN "payg_balance" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "devices" ALTER COLUMN "is_payg_locked" DROP NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "devices" DROP COLUMN "device_type"`);
    await queryRunner.query(
      `CREATE TYPE "public"."device_type" AS ENUM('smart_brooder')`,
    );
    await queryRunner.query(
      `ALTER TABLE "devices" ADD "device_type" "public"."device_type" NOT NULL DEFAULT 'smart_brooder'`,
    );
    await queryRunner.query(
      `ALTER TABLE "devices" ADD CONSTRAINT "devices_device_id_key" UNIQUE ("device_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" ALTER COLUMN "updated_at" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" ALTER COLUMN "created_at" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" ALTER COLUMN "transaction_date" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" ALTER COLUMN "transaction_date" DROP NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN "status"`);
    await queryRunner.query(
      `ALTER TABLE "payments" ADD "status" character varying(20) DEFAULT 'pending'`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_payments_status" ON "payments" ("status") `,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" DROP COLUMN "payment_purpose"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" ADD "payment_purpose" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" DROP COLUMN "payment_method"`,
    );
    await queryRunner.query(`ALTER TABLE "payments" ADD "payment_method" text`);
    await queryRunner.query(
      `ALTER TABLE "payments" ALTER COLUMN "currency" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "firmware_versions" ALTER COLUMN "updated_at" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "firmware_versions" ALTER COLUMN "created_at" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "firmware_versions" ALTER COLUMN "status" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "firmware_versions" ALTER COLUMN "is_mandatory" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "firmware_versions" ALTER COLUMN "release_type" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "device_status" ALTER COLUMN "updated_at" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "device_status" ALTER COLUMN "created_at" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "updated_at" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "created_at" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "is_active" DROP NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "status"`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "status" text NOT NULL DEFAULT 'active'`,
    );
    await queryRunner.query(
      `ALTER TABLE "bird_types" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "bird_types" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "feeding_recommendations" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "feeding_recommendations" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "farms" ALTER COLUMN "updated_at" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "farms" ALTER COLUMN "created_at" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "farms" ALTER COLUMN "is_active" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP CONSTRAINT "PK_25d24010f53bb80b78e412c9656"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD CONSTRAINT "PK_84059017c90bfcb701b8fa42297" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP COLUMN "created_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP CONSTRAINT "PK_84059017c90bfcb701b8fa42297"`,
    );
    await queryRunner.query(`ALTER TABLE "role_permissions" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "batchs" DROP COLUMN "batchPhoto"`);
    await queryRunner.query(
      `ALTER TABLE "batchs" DROP COLUMN "feeding_schedule"`,
    );
    await queryRunner.query(`ALTER TABLE "batchs" DROP COLUMN "feeding_time"`);
    await queryRunner.query(
      `ALTER TABLE "batchs" DROP COLUMN "expected_weight"`,
    );
    await queryRunner.query(
      `ALTER TABLE "batchs" DROP COLUMN "current_weight"`,
    );
    await queryRunner.query(`ALTER TABLE "batchs" DROP COLUMN "birds_alive"`);
    await queryRunner.query(`ALTER TABLE "batchs" DROP COLUMN "age"`);
    await queryRunner.query(`ALTER TABLE "batchs" DROP COLUMN "batch_type"`);
    await queryRunner.query(
      `ALTER TABLE "devices" DROP COLUMN "subscription_id"`,
    );
    await queryRunner.query(`ALTER TABLE "farms" DROP COLUMN "farmPhoto"`);
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD CONSTRAINT "PK_84059017c90bfcb701b8fa42297" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "devices" ADD "firmware_version" character varying(20)`,
    );
    await queryRunner.query(
      `ALTER TABLE "bird_types" ADD "is_active" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_field_appraisals_officer"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_field_appraisals_farmer"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_field_appraisals_farm"`);
    await queryRunner.query(`DROP INDEX "public"."idx_field_appraisals_date"`);
    await queryRunner.query(
      `DROP INDEX "public"."idx_field_appraisals_status"`,
    );
    await queryRunner.query(`DROP TABLE "field_appraisals"`);
    await queryRunner.query(
      `DROP INDEX "public"."idx_extension_officers_type"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_extension_officers_region"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_extension_officers_status"`,
    );
    await queryRunner.query(`DROP TABLE "extension_officers"`);
    await queryRunner.query(`DROP INDEX "public"."idx_subscriptions_user"`);
    await queryRunner.query(`DROP INDEX "public"."idx_subscriptions_plan"`);
    await queryRunner.query(`DROP INDEX "public"."idx_subscriptions_status"`);
    await queryRunner.query(`DROP INDEX "public"."idx_subscriptions_dates"`);
    await queryRunner.query(`DROP TABLE "subscriptions"`);
    await queryRunner.query(
      `DROP INDEX "public"."idx_subscription_invoices_subscription"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_subscription_invoices_status"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_subscription_invoices_date"`,
    );
    await queryRunner.query(`DROP TABLE "subscription_invoices"`);
    await queryRunner.query(
      `DROP INDEX "public"."idx_usage_records_subscription"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_usage_records_device"`);
    await queryRunner.query(`DROP INDEX "public"."idx_usage_records_date"`);
    await queryRunner.query(`DROP INDEX "public"."idx_usage_records_type"`);
    await queryRunner.query(`DROP TABLE "usage_records"`);
    await queryRunner.query(
      `DROP INDEX "public"."idx_subscription_plans_type"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_subscription_plans_active"`,
    );
    await queryRunner.query(`DROP TABLE "subscription_plans"`);
    await queryRunner.query(
      `ALTER TABLE "sent_notifications" ADD CONSTRAINT "sent_notifications_user_id_notification_type_reference_id_t_key" UNIQUE ("user_id", "notification_type", "reference_id", "timing_minutes", "delivery_method")`,
    );
    await queryRunner.query(
      `ALTER TABLE "firmware_versions" ADD CONSTRAINT "firmware_versions_version_device_type_key" UNIQUE ("version", "device_type")`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD CONSTRAINT "notifications_type_check" CHECK ((type = ANY (ARRAY['info'::text, 'reminder'::text, 'deadline'::text, 'warning'::text])))`,
    );
    await queryRunner.query(
      `ALTER TABLE "sent_notifications" ADD CONSTRAINT "sent_notifications_delivery_method_check" CHECK ((delivery_method = ANY (ARRAY['email'::text, 'push'::text, 'sms'::text, 'other'::text])))`,
    );
    await queryRunner.query(
      `ALTER TABLE "sent_notifications" ADD CONSTRAINT "sent_notifications_timing_minutes_check" CHECK ((timing_minutes >= 0))`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_notification_settings" ADD CONSTRAINT "user_notification_settings_delivery_method_check" CHECK ((delivery_method = ANY (ARRAY['email'::text, 'push'::text, 'sms'::text, 'whatsapp'::text, 'telegram'::text, 'slack'::text, 'webhook'::text, 'other'::text])))`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_notification_settings" ADD CONSTRAINT "user_notification_settings_timing_minutes_check" CHECK ((timing_minutes >= 0))`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "users_status_check" CHECK ((status = ANY (ARRAY['active'::text, 'inactive'::text, 'deleted'::text, 'pending'::text])))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_role_permissions_unique" ON "role_permissions" ("permission_id", "role_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_role_permissions_permission" ON "role_permissions" ("permission_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_role_permissions_role" ON "role_permissions" ("role_id") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_housing_quantities_unique" ON "housing_quantities" ("bird_capacity", "material_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_commands_pending" ON "issued_device_commands" ("command_status") WHERE ((command_status)::text = 'pending'::text)`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_command_type_name" ON "command_type" ("name") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_login_attempts_identifier_time" ON "login_attempts" ("created_at", "identifier") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_rate_limit_identifier_time" ON "rate_limit_logs" ("created_at", "identifier") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_uploads_created_at" ON "uploads" ("created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_uploads_category" ON "uploads" ("category") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_sessions_expires" ON "user_sessions" ("expires_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_sessions_user_active" ON "user_sessions" ("is_active", "user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_vaccinations_flock" ON "vaccinations" ("batch_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_batchs_bird_type" ON "batchs" ("bird_type_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_feeding_records_flock" ON "feeding_records" ("batch_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_feeding_flock" ON "feeding_schedules" ("batch_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_firmware_device_version_id" ON "devices" ("firmware_version_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_devices_device_id" ON "devices" ("device_id") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_device_status_name" ON "device_status" ("name") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_users_oauth_provider" ON "users" ("oauth_provider") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_users_apple_id" ON "users" ("apple_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_users_google_id" ON "users" ("google_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_bird_types_name" ON "bird_types" ("name") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_permissions_action" ON "permissions" ("action") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_permissions_module" ON "permissions" ("module") `,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_17022daf3f885f7d35423e9971e" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_178199805b901ccd220ab7740ec" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alerts" ADD CONSTRAINT "alerts_acknowledged_by_fkey" FOREIGN KEY ("acknowledged_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alerts" ADD CONSTRAINT "alerts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alerts" ADD CONSTRAINT "alerts_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "device_logs" ADD CONSTRAINT "device_logs_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "issued_device_commands" ADD CONSTRAINT "issued_device_commands_command_type_id_fkey" FOREIGN KEY ("command_type_id") REFERENCES "command_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "issued_device_commands" ADD CONSTRAINT "issued_device_commands_issued_by_fkey" FOREIGN KEY ("issued_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "issued_device_commands" ADD CONSTRAINT "issued_device_commands_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ota_updates" ADD CONSTRAINT "ota_updates_firmware_id_fkey" FOREIGN KEY ("firmware_id") REFERENCES "firmware_versions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ota_updates" ADD CONSTRAINT "ota_updates_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "payg_transactions" ADD CONSTRAINT "payg_transactions_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "payg_transactions" ADD CONSTRAINT "payg_transactions_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sent_notifications" ADD CONSTRAINT "sent_notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "system_config" ADD CONSTRAINT "system_config_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "telemetry" ADD CONSTRAINT "telemetry_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "two_factor_auth" ADD CONSTRAINT "two_factor_auth_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_notification_settings" ADD CONSTRAINT "user_notification_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "vaccinations" ADD CONSTRAINT "vaccinations_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "batchs"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "batchs" ADD CONSTRAINT "FK_15d5dc882abffbe9edd8502d450" FOREIGN KEY ("bird_type_id") REFERENCES "bird_types"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "batchs" ADD CONSTRAINT "FK_46484b9304dc8534a95bb2cacd7" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "batchs" ADD CONSTRAINT "FK_bfa977de58c6112a1e0f370ab0c" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "batchs" ADD CONSTRAINT "FK_eb1a352c73f341695809ca75095" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "weight_samples" ADD CONSTRAINT "weight_samples_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "batchs"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "weight_samples" ADD CONSTRAINT "weight_samples_recorded_by_fkey" FOREIGN KEY ("recorded_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "feeding_records" ADD CONSTRAINT "feeding_records_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "batchs"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "feeding_records" ADD CONSTRAINT "feeding_records_recorded_by_fkey" FOREIGN KEY ("recorded_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "feeding_records" ADD CONSTRAINT "feeding_records_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "feeding_schedules"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "feeding_schedules" ADD CONSTRAINT "feeding_schedules_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "batchs"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "devices" ADD CONSTRAINT "fk_devices_firmware_version_id" FOREIGN KEY ("firmware_version_id") REFERENCES "firmware_versions"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "devices" ADD CONSTRAINT "devices_device_status_id_fkey" FOREIGN KEY ("device_status_id") REFERENCES "device_status"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "devices" ADD CONSTRAINT "devices_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" ADD CONSTRAINT "payments_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "farms" ADD CONSTRAINT "farms_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
