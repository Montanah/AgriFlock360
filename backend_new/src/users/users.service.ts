// users/users.service.ts
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities/User.entity';
import { UserPreferences } from '../database/entities/UserPreferences.entity';
import { DeviceToken } from '../database/entities/DeviceToken.entity';
import { UpdateProfileDto, UpdateEmailDto, ChangePasswordDto, Enable2FADto, Verify2FADto, Disable2FADto,
    NotificationPreferencesDto, PrivacySettingsDto, RegisterDeviceTokenDto, DeactivateAccountDto, DeleteAccountDto  } from './dto/users.dto';
import { UploadsService } from '../uploads/uploads.service';
import { FileCategory } from '../uploads/dto/upload-file.dto';
import { CustomLogger } from '../common/custom-logger.service';
import * as bcrypt from 'bcrypt';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import * as crypto from 'crypto';
import { EmailService } from '../services/email.service';
import { AuditService } from '../services/audit.service';
import { Profile } from '../database/entities/Profile.entity';


@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
    @InjectRepository(UserPreferences)
    private preferencesRepository: Repository<UserPreferences>,
    @InjectRepository(DeviceToken)
    private deviceTokenRepository: Repository<DeviceToken>,
    private uploadsService: UploadsService,
    private logger: CustomLogger,
    private emailService: EmailService,
    private auditService: AuditService
  ) {}

  // ============= PROFILE MANAGEMENT =============

  async getProfile(userId: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['role', 'profile.farm', 'profile'],
      select: {
        id: true,
        email: true,
        name: true,
        phone_number: true,
        avatar: true,
        status: true,
        is_2fa_enabled: true,
        oauth_provider: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get user preferences
    const preferences = await this.getUserPreferences(user.id);

    return {
      ...user,
      preferences,
    };
  }

  // async updateProfile(userId: string, updateDto: UpdateProfileDto): Promise<User> {
  //   const user = await this.userRepository.findOne({ where: { id: userId } });
    
  //   if (!user) {
  //     throw new NotFoundException('User not found');
  //   }

  //   // Check if phone number is being updated and if it's already taken
  //   if (updateDto.phone_number && updateDto.phone_number !== user.phone_number) {
  //     const existingUser = await this.userRepository.findOne({
  //       where: { phone_number: updateDto.phone_number },
  //     });

  //     if (existingUser) {
  //       throw new ConflictException('Phone number already in use');
  //     }
  //   }
    
  //   // Calculate age from date of birth
  //   if (updateDto.date_of_birth) {
  //     const age = this.calculateAge(new Date(updateDto.date_of_birth));
  //     Object.assign(user, { ...updateDto, age: age.toString() });
  //   } else {
  //     Object.assign(user, updateDto);
  //   }

  //   await this.userRepository.save(user);

  //   const profile = await this.profileRepository.findOne({ 
  //     where: { user_id: userId } 
  //   });

  //   if (!profile) {
  //     throw new NotFoundException('Profile not found');
  //   }

  //   // Check if phone number is being updated and if it's already taken
  //   if (updateDto.phone_number && updateDto.phone_number !== profile.phone_number) {
  //     const existingProfile = await this.profileRepository.findOne({
  //       where: { phone_number: updateDto.phone_number },
  //     });

  //     if (existingProfile) {
  //       throw new ConflictException('Phone number already in use');
  //     }
  //   }

  //   // Calculate age from date of birth
  //   if (updateDto.date_of_birth) {
  //     const age = this.calculateAge(new Date(updateDto.date_of_birth));
  //     Object.assign(profile, { ...updateDto, age: age.toString() });
  //   } else {
  //     Object.assign(profile, updateDto);
  //   }

  //   Object.assign(profile, updateDto);
  //   await this.profileRepository.save(profile);


  //   this.logger.log(`Profile updated for user ${userId}`);

  //   return user;
  // }

  async updateProfile(userId: string, updateDto: UpdateProfileDto): Promise<User> {
  const user = await this.userRepository.findOne({ where: { id: userId } });
  if (!user) throw new NotFoundException('User not found');

  const profile = await this.profileRepository.findOne({ where: { user_id: userId } });
  if (!profile) throw new NotFoundException('Profile not found');

  // --- Handle USER fields (name & phone only) ---
  if (updateDto.phone_number && updateDto.phone_number !== user.phone_number) {
    const existingUser = await this.userRepository.findOne({
      where: { phone_number: updateDto.phone_number },
    });
    if (existingUser) throw new ConflictException('Phone number already in use');
    user.phone_number = updateDto.phone_number;
  }

  if (updateDto.full_name) {
    user.name = updateDto.full_name;
  }

  await this.userRepository.save(user);

  // --- Handle PROFILE fields ---
  const profileUpdateData = { ...updateDto };

  // Prevent phone_number & name from being saved into profile
  // delete profileUpdateData.phone_number;
  // delete profileUpdateData.name;

  // Calculate age if DOB updated
  if (profileUpdateData.date_of_birth) {
    const age = this.calculateAge(new Date(profileUpdateData.date_of_birth));
      Object.assign(profile, { ...updateDto, age: age.toString() });
    // profileUpdateData.age = this.calculateAge(new Date(profileUpdateData.date_of_birth)).toString();
  }

  Object.assign(profile, profileUpdateData);
  await this.profileRepository.save(profile);

  this.logger.log(`Profile updated for user ${userId}`);
  return user;
}


  async updateAvatar(userId: string, file: any): Promise<{ avatar_url: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Upload avatar using uploads service
    const upload = await this.uploadsService.uploadFile(file, userId, {
      category: FileCategory.AVATAR,
      entity_type: 'user',
      entity_id: userId,
      is_public: true,
    });

    // Update user avatar
    user.avatar = upload.file_url;
    await this.userRepository.save(user);

    await this.profileRepository.update({ user_id: userId }, { avatar: upload.file_url });

    this.logger.log(`Avatar updated for user ${userId}`);

    return { avatar_url: upload.file_url };
  }

  async deleteAvatar(userId: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.avatar) {
      throw new BadRequestException('No avatar to delete');
    }

    // Find and delete the avatar upload
    const uploads = await this.uploadsService.getUploads(userId, {
      category: 'avatar',
      entity_type: 'user',
    });

    if (uploads.uploads.length > 0) {
      await this.uploadsService.deleteUpload(uploads.uploads[0].id, userId);
    }

    user.avatar = null;
    await this.userRepository.save(user);

    //delete from profile too
    await this.profileRepository.update({ user_id: userId }, { avatar: null });

    this.logger.log(`Avatar deleted for user ${userId}`);
  }

  // ============= EMAIL MANAGEMENT =============

  async updateEmail(userId: string, updateEmailDto: UpdateEmailDto): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      updateEmailDto.current_password,
      user.password_hash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    // Check if new email is already in use
    const existingUser = await this.userRepository.findOne({
      where: { email: updateEmailDto.new_email },
    });

    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    // Generate verification code
    const verificationCode = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours

    user.email_verification_code = verificationCode;
    user.email_verification_expires_at = expiresAt;

    await this.userRepository.save(user);

    // Send verification email to new email address
    await this.emailService.sendVerificationEmail(updateEmailDto.new_email, verificationCode);

    this.logger.log(`Email change requested for user ${userId}`);
  }

  async verifyEmailChange(userId: string, verificationCode: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (
      !user.email_verification_code ||
      user.email_verification_code !== verificationCode
    ) {
      throw new BadRequestException('Invalid verification code');
    }

    if (
      !user.email_verification_expires_at ||
      user.email_verification_expires_at < new Date()
    ) {
      throw new BadRequestException('Verification code expired');
    }

    // Update email (assuming new email was stored temporarily)
    user.email_verification_code = undefined;
    user.email_verification_expires_at = undefined;

    await this.userRepository.save(user);

    this.logger.log(`Email verified and updated for user ${userId}`);
  }

  // ============= PASSWORD MANAGEMENT =============

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // OAuth users cannot change password
    if (user.oauth_provider && user.oauth_provider !== 'email') {
      throw new BadRequestException('Cannot change password for OAuth accounts');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      changePasswordDto.current_password,
      user.password_hash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Verify new passwords match
    if (changePasswordDto.new_password !== changePasswordDto.confirm_password) {
      throw new BadRequestException('Passwords do not match');
    }

    // Check if new password is same as old password
    const isSamePassword = await bcrypt.compare(
      changePasswordDto.new_password,
      user.password_hash,
    );

    if (isSamePassword) {
      throw new BadRequestException('New password must be different from current password');
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password_hash = await bcrypt.hash(changePasswordDto.new_password, salt);

    // Invalidate all refresh tokens
    user.refresh_token = undefined;
    user.refresh_token_expires_at = undefined;

    await this.userRepository.save(user);

    // Send security alert email
    await this.emailService.sendPasswordChangeAlert(user.email);

    this.logger.log(`Password changed for user ${userId}`);
  }

  // ============= TWO-FACTOR AUTHENTICATION =============

  async enable2FA(userId: string, enable2FADto: Enable2FADto): Promise<{ secret: string; qrCode: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(enable2FADto.password, user.password_hash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    if (user.is_2fa_enabled) {
      throw new BadRequestException('2FA is already enabled');
    }

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `FarmApp (${user.email})`,
      length: 32,
    });

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

    // Store secret temporarily (user needs to verify before enabling)
    const preferences = await this.getOrCreatePreferences(userId);
    preferences.two_factor_secret = secret.base32;
    await this.preferencesRepository.save(preferences);

    return {
      secret: secret.base32,
      qrCode: qrCodeUrl,
    };
  }

  async verify2FA(userId: string, verify2FADto: Verify2FADto): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const preferences = await this.preferencesRepository.findOne({
      where: { user_id: userId },
    });

    if (!preferences?.two_factor_secret) {
      throw new BadRequestException('2FA setup not initiated');
    }

    // Verify OTP
    const isValid = speakeasy.totp.verify({
      secret: preferences.two_factor_secret,
      encoding: 'base32',
      token: verify2FADto.otp_code,
      window: 2,
    });

    if (!isValid) {
      throw new BadRequestException('Invalid OTP code');
    }

    // Enable 2FA
    user.is_2fa_enabled = true;
    await this.userRepository.save(user);

    this.logger.log(`2FA enabled for user ${userId}`);
  }

  async disable2FA(userId: string, disable2FADto: Disable2FADto): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.is_2fa_enabled) {
      throw new BadRequestException('2FA is not enabled');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(disable2FADto.password, user.password_hash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    const preferences = await this.preferencesRepository.findOne({
      where: { user_id: userId },
    });

    if (!preferences?.two_factor_secret) {
      throw new BadRequestException('2FA secret not found');
    }

    // Verify OTP
    const isValid = speakeasy.totp.verify({
      secret: preferences.two_factor_secret,
      encoding: 'base32',
      token: disable2FADto.otp_code,
      window: 2,
    });

    if (!isValid) {
      throw new BadRequestException('Invalid OTP code');
    }

    // Disable 2FA
    user.is_2fa_enabled = false;
    preferences.two_factor_secret = undefined;
    
    await this.userRepository.save(user);
    await this.preferencesRepository.save(preferences);

    this.logger.log(`2FA disabled for user ${userId}`);
  }

  // ============= NOTIFICATION PREFERENCES =============

  async updateNotificationPreferences(
    userId: string,
    preferencesDto: NotificationPreferencesDto,
  ): Promise<UserPreferences> {
    const preferences = await this.getOrCreatePreferences(userId);

    if (preferencesDto.email) {
      preferences.email_notifications = {
        ...preferences.email_notifications,
        ...preferencesDto.email,
      };
    }

    if (preferencesDto.push) {
      preferences.push_notifications = {
        ...preferences.push_notifications,
        ...preferencesDto.push,
      };
    }

    await this.preferencesRepository.save(preferences);

    this.logger.log(`Notification preferences updated for user ${userId}`);

    return preferences;
  }

  async getNotificationPreferences(userId: string): Promise<any> {
    const preferences = await this.getUserPreferences(userId);

    return {
      email: preferences.email_notifications,
      push: preferences.push_notifications,
    };
  }

  // ============= PRIVACY SETTINGS =============

  async updatePrivacySettings(
    userId: string,
    privacyDto: PrivacySettingsDto,
  ): Promise<UserPreferences> {
    const preferences = await this.getOrCreatePreferences(userId);

    preferences.privacy_settings = {
      ...preferences.privacy_settings,
      ...privacyDto,
    };

    await this.preferencesRepository.save(preferences);

    this.logger.log(`Privacy settings updated for user ${userId}`);

    return preferences;
  }

  async getPrivacySettings(userId: string): Promise<any> {
    const preferences = await this.getUserPreferences(userId);
    return preferences.privacy_settings;
  }

  // ============= DEVICE TOKEN MANAGEMENT =============

  async registerDeviceToken(userId: string, tokenDto: RegisterDeviceTokenDto): Promise<void> {
    // Check if token already exists
    const existingToken = await this.deviceTokenRepository.findOne({
      where: {
        user_id: userId,
        device_token: tokenDto.device_token,
      },
    });

    if (existingToken) {
      // Update existing token
      existingToken.platform = tokenDto.platform;
      existingToken.device_name = tokenDto.device_name;
      existingToken.last_used_at = new Date();
      await this.deviceTokenRepository.save(existingToken);
    } else {
      // Create new token
      const deviceToken = this.deviceTokenRepository.create({
        user_id: userId,
        device_token: tokenDto.device_token,
        platform: tokenDto.platform,
        device_name: tokenDto.device_name,
      });
      await this.deviceTokenRepository.save(deviceToken);
    }

    this.logger.log(`Device token registered for user ${userId}`);
  }

  async removeDeviceToken(userId: string, deviceToken: string): Promise<void> {
    await this.deviceTokenRepository.delete({
      user_id: userId,
      device_token: deviceToken,
    });

    this.logger.log(`Device token removed for user ${userId}`);
  }

  async getUserDeviceTokens(userId: string): Promise<DeviceToken[]> {
    return this.deviceTokenRepository.find({
      where: { user_id: userId },
      order: { last_used_at: 'DESC' },
    });
  }

  // ============= ACCOUNT MANAGEMENT =============

  async deactivateAccount(userId: string, deactivateDto: DeactivateAccountDto): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(deactivateDto.password, user.password_hash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    user.status = 'inactive';
    user.is_active = false;
    user.refresh_token = undefined;

    await this.userRepository.save(user);

    // Send deactivation email
    await this.emailService.sendAccountDeactivationEmail(user.email);

    this.logger.log(`Account deactivated for user ${userId}. Reason: ${deactivateDto.reason}`);
  }

  async reactivateAccount(userId: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.status = 'active';
    user.is_active = true;

    await this.userRepository.save(user);

    this.logger.log(`Account reactivated for user ${userId}`);
  }

  async deleteAccount(userId: string, deleteDto: DeleteAccountDto): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(deleteDto.password, user.password_hash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    // Soft delete
    await this.userRepository.softRemove(user);

    // Delete all device tokens
    await this.deviceTokenRepository.delete({ user_id: userId });

    // TODO: Delete user data, uploads, etc.
    // TODO: Send deletion confirmation email

    this.logger.log(`Account deleted for user ${userId}. Reason: ${deleteDto.reason}`);
  }

  async getLoginHistory(userId: string, page = 1, limit = 20): Promise<any> {
    const { logs, total } = await this.auditService.getLoginHistory(userId, page, limit);

    return {
    success: true,
    data: logs.map(log => ({
      id: log.id,
      success: log.meta?.success ?? true,
      ip: log.ip_address,
      location: log.meta?.location,
      device: log.meta?.device || this.detectDevice(log.user_agent),
      method: log.meta?.method || 'unknown',
      timestamp: log.created_at,
    })),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}

  async getUserWithRoleAndPermissions(userId: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id: userId },
      relations: ['role', 'role.permissions'],
    });
  }

  // ============= HELPER METHODS =============

  private async getOrCreatePreferences(userId: string): Promise<UserPreferences> {
    let preferences = await this.preferencesRepository.findOne({
      where: { user_id: userId },
    });

    if (!preferences) {
      const pref = new UserPreferences();
      pref.user_id = userId;
      pref.email_notifications = {
        marketing: true,
        security_alerts: true,
        product_updates: true,
        system_notifications: true,
      };
      pref.push_notifications = {
        alerts: true,
        reminders: true,
        messages: true,
        reports: true,
      };
      pref.privacy_settings = {
        profile_visibility: 'private',
        show_email: false,
        show_phone: false,
        show_location: false,
        search_engine_indexing: false,
        analytics_consent: true,
      };
      preferences = await this.preferencesRepository.save(pref);
    }

    return preferences;
  }

  private async getUserPreferences(userId: string): Promise<UserPreferences> {
    return this.getOrCreatePreferences(userId);
  }

  private calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }

  private detectDevice(userAgent?: string): string {
    if (!userAgent) return 'unknown';
      const ua = userAgent.toLowerCase();
    if (/mobile|android|iphone|ipad/.test(ua)) return 'mobile';
    if (/tablet|ipad/.test(ua)) return 'tablet';
      return 'desktop';
  }
}
