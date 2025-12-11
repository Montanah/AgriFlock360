// test/devices.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('DevicesController (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let userToken: string;
  let deviceId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    // Login as admin
    const adminLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@agriflock360.com',
        password: 'Admin123!',
      });
    adminToken = adminLogin.body.access_token;

    // Login as regular user
    const userLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'farmer@agriflock360.com',
        password: 'Farmer123!',
      });
    userToken = userLogin.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/devices (POST)', () => {
    it('should create device as admin', () => {
      return request(app.getHttpServer())
        .post('/devices')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          device_id: 'E2E-TEST-001',
          device_name: 'E2E Test Brooder',
          device_type: 'smart_brooder',
          location: 'Test Farm',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          deviceId = res.body.id;
        });
    });

    it('should fail without admin role', () => {
      return request(app.getHttpServer())
        .post('/devices')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          device_id: 'E2E-TEST-002',
          device_name: 'Test Brooder 2',
          device_type: 'smart_brooder',
        })
        .expect(403);
    });
  });

  describe('/devices (GET)', () => {
    it('should list all devices', () => {
      return request(app.getHttpServer())
        .get('/devices')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('devices');
          expect(res.body).toHaveProperty('pagination');
        });
    });

    it('should filter devices by status', () => {
      return request(app.getHttpServer())
        .get('/devices?status=active')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);
    });
  });

  describe('/devices/:deviceId (GET)', () => {
    it('should get device details', () => {
      return request(app.getHttpServer())
        .get(`/devices/${deviceId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('device');
          expect(res.body).toHaveProperty('latest_telemetry');
          expect(res.body).toHaveProperty('active_alerts');
        });
    });
  });

  describe('/devices/:deviceId/commands (POST)', () => {
    it('should send command to device', () => {
      return request(app.getHttpServer())
        .post(`/devices/${deviceId}/commands`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          command_type: 'set_temperature',
          payload: { target_temp: 30 },
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('command_id');
          expect(res.body).toHaveProperty('status');
          expect(res.body.status).toBe('pending');
        });
    });

    it('should validate command payload', () => {
      return request(app.getHttpServer())
        .post(`/devices/${deviceId}/commands`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          command_type: 'set_temperature',
          payload: { target_temp: 100 }, // Invalid temp
        })
        .expect(400);
    });
  });

  describe('/telemetry/:deviceId (POST)', () => {
    it('should record telemetry data', () => {
      return request(app.getHttpServer())
        .post(`/telemetry/${deviceId}`)
        .send({
          temperature: 28.5,
          humidity: 65,
          heater_status: false,
          fan_status: true,
          power_status: true,
        })
        .expect(201);
    });
  });

  describe('/telemetry/:deviceId/latest (GET)', () => {
    it('should get latest telemetry', () => {
      return request(app.getHttpServer())
        .get(`/telemetry/${deviceId}/latest`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('temperature');
          expect(res.body).toHaveProperty('humidity');
        });
    });
  });

  describe('/alerts (GET)', () => {
    it('should get user alerts', () => {
      return request(app.getHttpServer())
        .get('/alerts')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('alerts');
        });
    });
  });
});
