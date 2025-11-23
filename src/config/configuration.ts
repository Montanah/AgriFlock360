export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  database: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'super-secret-jwt-key-change-in-prod',
    expiresIn: '7d',
  },
  mqtt: {
    url: process.env.MQTT_URL || 'mqtts://your-emqx-broker.emqx.cloud:8883',
    username: process.env.MQTT_USER,
    password: process.env.MQTT_PASS,
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  daraja: {
    consumerKey: process.env.DARAJA_CONSUMER_KEY,
    consumerSecret: process.env.DARAJA_CONSUMER_SECRET,
    shortcode: process.env.DARAJA_SHORTCODE,
  },
});
