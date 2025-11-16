const nodemailer = require('nodemailer');
const logger = require('./logger');

// Email configuration
const EMAIL_CONFIG = {
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
};

const FROM_EMAIL = process.env.EMAIL_FROM || process.env.EMAIL_USER;
const APP_NAME = process.env.APP_NAME || 'PortSmith';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Create transporter
let transporter = null;

const createTransporter = () => {
  if (!EMAIL_CONFIG.auth.user || !EMAIL_CONFIG.auth.pass) {
    logger.warn('Email credentials not configured. Email sending will be simulated.');
    return null;
  }

  try {
    const t = nodemailer.createTransport(EMAIL_CONFIG);
    logger.info('Email transporter created successfully');
    return t;
  } catch (error) {
    logger.error('Failed to create email transporter:', error);
    return null;
  }
};

// Initialize transporter
transporter = createTransporter();

/**
 * Send verification email to user
 * @param {string} email - User's email address
 * @param {string} fullName - User's full name
 * @param {string} verificationToken - Verification token
 */
const sendVerificationEmail = async (email, fullName, verificationToken) => {
  const verificationLink = `${FRONTEND_URL}/verify-email?token=${verificationToken}`;

  const mailOptions = {
    from: `"${APP_NAME}" <${FROM_EMAIL}>`,
    to: email,
    subject: `Verify Your Email - ${APP_NAME}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to ${APP_NAME}!</h1>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Hi ${fullName},</h2>
            
            <p style="font-size: 16px; color: #555;">
              Thank you for signing up! We're excited to have you on board.
            </p>
            
            <p style="font-size: 16px; color: #555;">
              To complete your registration and access all features, please verify your email address by clicking the button below:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationLink}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 14px 30px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        display: inline-block;
                        font-weight: bold;
                        font-size: 16px;">
                Verify Email Address
              </a>
            </div>
            
            <p style="font-size: 14px; color: #777; border-top: 1px solid #ddd; padding-top: 20px; margin-top: 30px;">
              If the button doesn't work, copy and paste this link into your browser:
            </p>
            <p style="font-size: 12px; color: #999; word-break: break-all;">
              ${verificationLink}
            </p>
            
            <p style="font-size: 14px; color: #777; margin-top: 20px;">
              This verification link will expire in <strong>24 hours</strong>.
            </p>
            
            <p style="font-size: 14px; color: #777;">
              If you didn't create an account with ${APP_NAME}, please ignore this email.
            </p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center;">
              <p style="font-size: 12px; color: #999; margin: 0;">
                © ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Welcome to ${APP_NAME}!
      
      Hi ${fullName},
      
      Thank you for signing up! We're excited to have you on board.
      
      To complete your registration and access all features, please verify your email address by clicking the link below:
      
      ${verificationLink}
      
      This verification link will expire in 24 hours.
      
      If you didn't create an account with ${APP_NAME}, please ignore this email.
      
      © ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
    `
  };

  try {
    if (!transporter) {
      // Simulate email sending for development
      logger.info('EMAIL SIMULATION MODE');
      logger.info(`To: ${email}`);
      logger.info(`Subject: ${mailOptions.subject}`);
      logger.info(`Verification Link: ${verificationLink}`);
      logger.info('Email would have been sent in production mode.');
      return { success: true, simulated: true };
    }

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Verification email sent to ${email}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error(`Failed to send verification email to ${email}:`, error);
    throw new Error('Failed to send verification email');
  }
};

/**
 * Send password reset email
 * @param {string} email - User's email address
 * @param {string} fullName - User's full name
 * @param {string} resetToken - Password reset token
 */
const sendPasswordResetEmail = async (email, fullName, resetToken) => {
  const resetLink = `${FRONTEND_URL}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: `"${APP_NAME}" <${FROM_EMAIL}>`,
    to: email,
    subject: `Password Reset Request - ${APP_NAME}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Password Reset</h1>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Hi ${fullName},</h2>
            
            <p style="font-size: 16px; color: #555;">
              We received a request to reset your password for your ${APP_NAME} account.
            </p>
            
            <p style="font-size: 16px; color: #555;">
              Click the button below to reset your password:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 14px 30px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        display: inline-block;
                        font-weight: bold;
                        font-size: 16px;">
                Reset Password
              </a>
            </div>
            
            <p style="font-size: 14px; color: #777; border-top: 1px solid #ddd; padding-top: 20px; margin-top: 30px;">
              If the button doesn't work, copy and paste this link into your browser:
            </p>
            <p style="font-size: 12px; color: #999; word-break: break-all;">
              ${resetLink}
            </p>
            
            <p style="font-size: 14px; color: #777; margin-top: 20px;">
              This password reset link will expire in <strong>1 hour</strong>.
            </p>
            
            <p style="font-size: 14px; color: #777;">
              If you didn't request a password reset, please ignore this email and your password will remain unchanged.
            </p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center;">
              <p style="font-size: 12px; color: #999; margin: 0;">
                © ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Password Reset
      
      Hi ${fullName},
      
      We received a request to reset your password for your ${APP_NAME} account.
      
      Click the link below to reset your password:
      
      ${resetLink}
      
      This password reset link will expire in 1 hour.
      
      If you didn't request a password reset, please ignore this email and your password will remain unchanged.
      
      © ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
    `
  };

  try {
    if (!transporter) {
      // Simulate email sending for development
      logger.info('EMAIL SIMULATION MODE');
      logger.info(`To: ${email}`);
      logger.info(`Subject: ${mailOptions.subject}`);
      logger.info(`Reset Link: ${resetLink}`);
      logger.info('Email would have been sent in production mode.');
      return { success: true, simulated: true };
    }

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Password reset email sent to ${email}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error(`Failed to send password reset email to ${email}:`, error);
    throw new Error('Failed to send password reset email');
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail
};
