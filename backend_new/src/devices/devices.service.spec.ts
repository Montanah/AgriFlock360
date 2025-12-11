// devices/devices.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { DevicesService } from './devices.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Device } from '../database/entities/Device.entity';
import { DeviceStatus } from '../database/entities/DeviceStatus.entity';
import { IssuedDeviceCommand } from '../database/entities/IssuedDeviceCommand.entity';
import { CommandType } from '../database/entities/CommandType.entity';
import { Telemetry } from '../database/entities/Telemetry.entity';
import { Alert } from '../database/entities/Alert.entity';
import { CustomLogger } from '../common/custom-logger.service';
import { AuditService } from '../services/audit.service';

describe('DevicesService', () => {
  let service: DevicesService;
  let deviceRepository: any;
  let deviceStatusRepository: any;
  let commandRepository: any;
  let commandTypeRepository: any;

  const mockDeviceRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockDeviceStatusRepository = {
    findOne: jest.fn(),
  };

  const mockCommandRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockCommandTypeRepository = {
    findOne: jest.fn(),
  };

  const mockTelemetryRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const mockAlertRepository = {
    find: jest.fn(),
  };

  const mockLogger = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  };

  const mockAuditService = {
    log: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DevicesService,
        {
          provide: getRepositoryToken(Device),
          useValue: mockDeviceRepository,
        },
        {
          provide: getRepositoryToken(DeviceStatus),
          useValue: mockDeviceStatusRepository,
        },
        {
          provide: getRepositoryToken(IssuedDeviceCommand),
          useValue: mockCommandRepository,
        },
        {
          provide: getRepositoryToken(CommandType),
          useValue: mockCommandTypeRepository,
        },
        {
          provide: getRepositoryToken(Telemetry),
          useValue: mockTelemetryRepository,
        },
        {
          provide: getRepositoryToken(Alert),
          useValue: mockAlertRepository,
        },
        {
          provide: CustomLogger,
          useValue: mockLogger,
        },
        {
          provide: AuditService,
          useValue: mockAuditService,
        },
      ],
    }).compile();

    service = module.get<DevicesService>(DevicesService);
    deviceRepository = module.get(getRepositoryToken(Device));
    deviceStatusRepository = module.get(getRepositoryToken(DeviceStatus));
    commandRepository = module.get(getRepositoryToken(IssuedDeviceCommand));
    commandTypeRepository = module.get(getRepositoryToken(CommandType));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new device', async () => {
      const createDeviceDto = {
        device_id: 'TEST123',
        device_name: 'Test Brooder',
        device_type: 'smart_brooder' as any,
        location: 'Test Farm',
      };

      const mockStatus = { id: 'status-1', name: 'registered' };

      mockDeviceRepository.findOne.mockResolvedValue(null);
      mockDeviceStatusRepository.findOne.mockResolvedValue(mockStatus);
      mockDeviceRepository.create.mockReturnValue(createDeviceDto);
      mockDeviceRepository.save.mockResolvedValue({
        id: 'device-1',
        ...createDeviceDto,
      });

      const result = await service.create(
        createDeviceDto,
        'user-1',
        '127.0.0.1',
        'test-agent',
      );

      expect(result).toHaveProperty('id');
      expect(mockDeviceRepository.save).toHaveBeenCalled();
      expect(mockAuditService.log).toHaveBeenCalled();
    });

    it('should throw conflict if device_id exists', async () => {
      const createDeviceDto = {
        device_id: 'EXISTING123',
        device_name: 'Test Brooder',
        device_type: 'smart_brooder' as any,
      };

      mockDeviceRepository.findOne.mockResolvedValue({ id: 'device-1' });

      await expect(
        service.create(createDeviceDto, 'user-1', '127.0.0.1', 'test-agent'),
      ).rejects.toThrow('Device ID already registered');
    });
  });

  describe('findOne', () => {
    it('should return device with telemetry and alerts', async () => {
      const mockDevice = {
        id: 'device-1',
        device_id: 'TEST123',
        device_name: 'Test Brooder',
      };

      const mockTelemetry = {
        temperature: 28.5,
        humidity: 65,
        timestamp: new Date(),
      };

      const mockAlerts = [
        {
          id: 'alert-1',
          alert_type: 'high_temperature',
          severity: 'medium',
        },
      ];

      mockDeviceRepository.findOne.mockResolvedValue(mockDevice);
      mockTelemetryRepository.findOne.mockResolvedValue(mockTelemetry);
      mockAlertRepository.find.mockResolvedValue(mockAlerts);

      const result = await service.findOne('device-1');

      expect(result).toHaveProperty('device');
      expect(result).toHaveProperty('latest_telemetry');
      expect(result).toHaveProperty('active_alerts');
      expect(result.device).toEqual(mockDevice);
    });

    it('should throw not found if device does not exist', async () => {
      mockDeviceRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        'Device not found',
      );
    });
  });

  describe('createCommand', () => {
    it('should create a command for device', async () => {
      const mockDevice = {
        id: 'device-1',
        device_id: 'TEST123',
        owner_id: 'user-1',
      };

      const mockCommandType = {
        id: 'cmd-type-1',
        name: 'set_temperature',
      };

      const createCommandDto = {
        command_type: 'set_temperature' as any,
        payload: { target_temp: 30 },
      };

      mockDeviceRepository.findOne.mockResolvedValue(mockDevice);
      mockCommandTypeRepository.findOne.mockResolvedValue(mockCommandType);
      mockCommandRepository.create.mockReturnValue({});
      mockCommandRepository.save.mockResolvedValue({
        id: 'cmd-1',
        command_status: 'pending',
      });

      const result = await service.createCommand(
        'device-1',
        createCommandDto,
        'user-1',
        'admin',
        '127.0.0.1',
        'test-agent',
      );

      expect(result).toHaveProperty('command_id');
      expect(result).toHaveProperty('status');
      expect(result.status).toBe('pending');
    });

    it('should throw forbidden if user not authorized', async () => {
      const mockDevice = {
        id: 'device-1',
        device_id: 'TEST123',
        owner_id: 'other-user',
      };

      mockDeviceRepository.findOne.mockResolvedValue(mockDevice);

      const createCommandDto = {
        command_type: 'set_temperature' as any,
        payload: { target_temp: 30 },
      };

      await expect(
        service.createCommand(
          'device-1',
          createCommandDto,
          'user-1',
          'user',
          '127.0.0.1',
          'test-agent',
        ),
      ).rejects.toThrow('Not authorized to control this device');
    });
  });
});
