import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST'),
      port: this.configService.get('SMTP_PORT'),
      secure: false,
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASSWORD'),
      },
    });
  }

  async sendVerificationEmail(email: string, code: string) {
    const url = `${this.configService.get('FRONTEND_URL')}/verify-email?code=${code}`;
    
    await this.transporter.sendMail({
      from: this.configService.get('EMAIL_FROM'),
      to: email,
      subject: 'Verify Your Email - AgriFlock360',
      html: `
        <h1>Welcome to AgriFlock360!</h1>
        <p>Please verify your email by clicking the link below:</p>
        <a href="${url}">Verify Email</a>
        <p>Or use this code: <strong>${code}</strong></p>
        <p>This link expires in 24 hours.</p>
      `,
    });
  }

  async sendPasswordResetEmail(email: string, token: string) {
    const url = `${this.configService.get('FRONTEND_URL')}/reset-password?token=${token}`;
    
    await this.transporter.sendMail({
      from: this.configService.get('EMAIL_FROM'),
      to: email,
      subject: 'Password Reset - AgriFlock360',
      html: `
        <h1>Password Reset Request</h1>
        <p>Click the link below to reset your password:</p>
        <a href="${url}">Reset Password</a>
        <p>This link expires in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    });
  }

  async send2FACode(email: string, code: string) {
    await this.transporter.sendMail({
      from: this.configService.get('EMAIL_FROM'),
      to: email,
      subject: 'Your 2FA Code - AgriFlock360',
      html: `
        <h1>Two-Factor Authentication</h1>
        <p>Your verification code is: <strong style="font-size: 24px">${code}</strong></p>
        <p>This code expires in 5 minutes.</p>
      `,
    });
  }

  async sendLoginAlert(email: string, ipAddress: string, userAgent: string) {
    await this.transporter.sendMail({
      from: this.configService.get('EMAIL_FROM'),
      to: email,
      subject: 'New Login Detected - AgriFlock360',
      html: `
        <h1>New Login to Your Account</h1>
        <p>A new login was detected:</p>
        <ul>
          <li>IP Address: ${ipAddress}</li>
          <li>Device: ${userAgent}</li>
          <li>Time: ${new Date().toLocaleString()}</li>
        </ul>
        <p>If this wasn't you, please reset your password immediately.</p>
      `,
    });
  }
}
