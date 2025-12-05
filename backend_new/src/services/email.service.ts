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

  async sendGenericNotification(email: string, title: string, body: string) {
    await this.transporter.sendMail({
      from: this.configService.get('EMAIL_FROM'),
      to: email,
      subject: title,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">${title}</h2>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px;">
            <p style="color: #666; line-height: 1.6;">${body}</p>
          </div>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
          <p style="color: #999; font-size: 12px;">
            This is an automated notification from AgriFlock360.
          </p>
        </div>
      `,
    });
  }

  async sendPaymentConfirmation(
    email: string,
    amount: number,
    reference: string,
    purpose: string,
  ) {
    await this.transporter.sendMail({
      from: this.configService.get('EMAIL_FROM'),
      to: email,
      subject: 'Payment Confirmation - AgriFlock360',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4CAF50;">Payment Successful!</h2>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px;">
            <p><strong>Amount:</strong> KES ${amount}</p>
            <p><strong>Reference:</strong> ${reference}</p>
            <p><strong>Purpose:</strong> ${purpose}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
          </div>
          <p style="margin-top: 20px;">Thank you for your payment!</p>
        </div>
      `,
    });
  }

  async sendPaygLowBalanceAlert(
    email: string,
    deviceName: string,
    balance: number,
    daysRemaining: number,
  ) {
    await this.transporter.sendMail({
      from: this.configService.get('EMAIL_FROM'),
      to: email,
      subject: '⚠️ Low PAYG Balance Alert - AgriFlock360',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #FF9800;">⚠️ Low PAYG Balance</h2>
          <div style="background-color: #fff3e0; padding: 20px; border-radius: 5px; border-left: 4px solid #FF9800;">
            <p><strong>Device:</strong> ${deviceName}</p>
            <p><strong>Current Balance:</strong> KES ${balance}</p>
            <p><strong>Days Remaining:</strong> ${daysRemaining} days</p>
          </div>
          <p style="margin-top: 20px;">
            Your device will be locked when the balance reaches zero.
            Please top up to avoid service interruption.
          </p>
          <a href="${this.configService.get('FRONTEND_URL')}/payments/topup"
             style="display: inline-block; background-color: #4CAF50; color: white;
                    padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 20px;">
            Top Up Now
          </a>
        </div>
      `,
    });
  }

  async sendAccountDeactivationEmail(email: string) {
    await this.transporter.sendMail({
      from: this.configService.get('EMAIL_FROM'),
      to: email,
      subject: 'Account Deactivated - AgriFlock360',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #FF5722;">Account Deactivated</h2>
          <div style="background-color: #ffebee; padding: 20px; border-radius: 5px; border-left: 4px solid #FF5722;">
            <p>Your AgriFlock360 account has been successfully deactivated.</p>
            <p>You will no longer receive notifications or have access to the platform.</p>
          </div>
          <p style="margin-top: 20px;">
            If you would like to reactivate your account in the future, please contact our support team.
          </p>
          <p style="color: #999; font-size: 12px;">
            If you did not request this deactivation, please contact support immediately.
          </p>
        </div>
      `,
    });
  }

  async sendEmailVerification(email: string, verificationCode: string) {
    await this.transporter.sendMail({
      from: this.configService.get('EMAIL_FROM'),
      to: email,
      subject: 'Email Verification - AgriFlock360',
      html: `
       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
         <h2 style="color: #4CAF50;">Email Verification</h2>
         <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px;">
           <p><strong>Verification Code:</strong> ${verificationCode}</p>
         </div>
         <p style="margin-top: 20px;">Please enter the verification code to verify your email address.</p>
       </div>
     `,
    });
  }

  async sendPasswordChangeAlert(email: string) {
    await this.transporter.sendMail({
      from: this.configService.get('EMAIL_FROM'),
      to: email,
      subject: 'Password Change Alert - AgriFlock360',
      html: `
       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
         <h2 style="color: #4CAF50;">Password Change Alert</h2>
         <p style="margin-top: 20px;">You have recently changed your password. If this was not you, please contact our support team immediately.</p>
       </div>
     `,
    });
  }
}
