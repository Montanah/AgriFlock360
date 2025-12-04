// database/seeds/subscription-plans.seed.ts
export const subscriptionPlanSeeds = [
  {
    name: 'PAYG Starter',
    plan_type: 'payg',
    description: 'Pay only for what you use. Perfect for small farms with 1-5 devices.',
    base_fee: 5.00, // KES 500 monthly base
    per_reading_fee: 0.01, // KES 1 per 100 readings
    per_alert_fee: 0.50, // KES 50 per alert
    per_device_fee: 1.00, // KES 100 per device per day
    per_kb_fee: 0.001, // KES 0.1 per KB
    free_readings_per_month: 1000,
    free_alerts_per_month: 10,
    max_devices: 5,
    features: {
      real_time_monitoring: true,
      historical_data_days: 30,
      sms_alerts: true,
      email_alerts: true,
      push_notifications: true,
      api_access: false,
      advanced_analytics: false,
      custom_reports: false,
      priority_support: false,
    },
    is_active: true,
    is_public: true,
    sort_order: 1,
    metadata: {
      recommended: true,
      popular: true,
      trial_days: 7,
    },
  },
  {
    name: 'Professional Monthly',
    plan_type: 'monthly',
    description: 'Fixed monthly rate for medium-sized farms. Unlimited readings and alerts.',
    monthly_price: 50.00, // KES 5,000
    max_devices: 20,
    features: {
      real_time_monitoring: true,
      historical_data_days: 90,
      sms_alerts: true,
      email_alerts: true,
      push_notifications: true,
      api_access: true,
      advanced_analytics: true,
      custom_reports: true,
      priority_support: true,
    },
    is_active: true,
    is_public: true,
    sort_order: 2,
    metadata: {
      recommended: false,
      popular: true,
      trial_days: 14,
    },
  },
  {
    name: 'Enterprise Annual',
    plan_type: 'annual',
    description: 'Best value for large farms. Save 20% with annual commitment.',
    annual_price: 480.00, // KES 48,000 (save KES 12,000)
    max_devices: 100,
    features: {
      real_time_monitoring: true,
      historical_data_days: 365,
      sms_alerts: true,
      email_alerts: true,
      push_notifications: true,
      api_access: true,
      advanced_analytics: true,
      custom_reports: true,
      priority_support: true,
    },
    is_active: true,
    is_public: true,
    sort_order: 3,
    metadata: {
      recommended: false,
      popular: false,
      minimum_commitment_months: 12,
    },
  },
];