import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../database/entities/User.entity';
import { Role } from '../database/entities/Role.entity';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: any;
  let roleRepository: any;

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };

  const mockRoleRepository = {
    findOne: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Role),
          useValue: mockRoleRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get(getRepositoryToken(User));
    roleRepository = module.get(getRepositoryToken(Role));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'Password123!',
        first_name: 'Test',
        last_name: 'User',
      };

      const mockRole = { id: '1', name: 'user' };
      
      mockUserRepository.findOne.mockResolvedValue(null);
      mockRoleRepository.findOne.mockResolvedValue(mockRole);
      mockUserRepository.create.mockReturnValue({ ...registerDto, role_id: mockRole.id });
      mockUserRepository.save.mockResolvedValue({ id: '1', ...registerDto });
      mockJwtService.sign.mockReturnValue('mock-token');

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('should throw conflict exception if user exists', async () => {
      const registerDto = {
        email: 'existing@example.com',
        password: 'Password123!',
      };

      mockUserRepository.findOne.mockResolvedValue({ id: '1', email: registerDto.email });

      await expect(service.register(registerDto)).rejects.toThrow();
    });
  });

  describe('login', () => {
    it('should login user with valid credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      const mockUser = {
        id: '1',
        email: loginDto.email,
        password_hash: '$2b$10$hashedpassword',
        is_active: true,
        role: { name: 'user' },
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('mock-token');

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('user');
    });

    it('should throw unauthorized exception for invalid credentials', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(
        service.login({ email: 'wrong@example.com', password: 'wrong' }),
      ).rejects.toThrow();
    });
  });
});
