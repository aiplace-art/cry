import nodemailer from 'nodemailer';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

export enum EmailType {
  PURCHASE_INITIATED = 'purchase_initiated',
  PAYMENT_RECEIVED = 'payment_received',
  TOKENS_AVAILABLE = 'tokens_available',
  VESTING_UNLOCK = 'vesting_unlock',
  PURCHASE_FAILED = 'purchase_failed'
}

interface EmailData {
  to: string;
  type: EmailType;
  data: any;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private sesClient: SESClient | null = null;
  private useAWS: boolean;

  constructor() {
    this.useAWS = process.env.EMAIL_PROVIDER === 'aws';

    if (this.useAWS) {
      this.sesClient = new SESClient({
        region: process.env.AWS_REGION || 'us-east-1',
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
        }
      });
    } else {
      // Use SMTP
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    }
  }

  async sendEmail(emailData: EmailData): Promise<void> {
    const emailContent = this.generateEmailContent(emailData.type, emailData.data);

    try {
      if (this.useAWS && this.sesClient) {
        await this.sendViaAWS(emailData.to, emailContent);
      } else if (this.transporter) {
        await this.sendViaSMTP(emailData.to, emailContent);
      }
      console.log(`Email sent successfully to ${emailData.to} - Type: ${emailData.type}`);
    } catch (error) {
      console.error('Email sending error:', error);
      throw new Error('Failed to send email');
    }
  }

  private async sendViaSMTP(to: string, content: EmailContent): Promise<void> {
    if (!this.transporter) throw new Error('SMTP transporter not initialized');

    await this.transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@cryptoproject.com',
      to,
      subject: content.subject,
      html: content.html,
      text: content.text
    });
  }

  private async sendViaAWS(to: string, content: EmailContent): Promise<void> {
    if (!this.sesClient) throw new Error('AWS SES client not initialized');

    const command = new SendEmailCommand({
      Source: process.env.EMAIL_FROM || 'noreply@cryptoproject.com',
      Destination: {
        ToAddresses: [to]
      },
      Message: {
        Subject: {
          Data: content.subject
        },
        Body: {
          Html: {
            Data: content.html
          },
          Text: {
            Data: content.text
          }
        }
      }
    });

    await this.sesClient.send(command);
  }

  private generateEmailContent(type: EmailType, data: any): EmailContent {
    switch (type) {
      case EmailType.PURCHASE_INITIATED:
        return this.generatePurchaseInitiatedEmail(data);
      case EmailType.PAYMENT_RECEIVED:
        return this.generatePaymentReceivedEmail(data);
      case EmailType.TOKENS_AVAILABLE:
        return this.generateTokensAvailableEmail(data);
      case EmailType.VESTING_UNLOCK:
        return this.generateVestingUnlockEmail(data);
      case EmailType.PURCHASE_FAILED:
        return this.generatePurchaseFailedEmail(data);
      default:
        throw new Error('Unknown email type');
    }
  }

  private generatePurchaseInitiatedEmail(data: any): EmailContent {
    const subject = 'Token Purchase Initiated';
    const text = `
Your token purchase has been initiated!

Wallet Address: ${data.walletAddress}
Amount: $${data.amount}
Tokens: ${data.tokens}

Please complete the payment using the following link:
${data.paymentUrl}

This link will expire in 1 hour.

Thank you for participating in our private sale!
    `;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .info { background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Token Purchase Initiated</h1>
    </div>
    <div class="content">
      <p>Your token purchase has been successfully initiated!</p>

      <div class="info">
        <p><strong>Wallet Address:</strong> ${data.walletAddress}</p>
        <p><strong>Amount:</strong> $${data.amount}</p>
        <p><strong>Tokens:</strong> ${data.tokens}</p>
      </div>

      <p>Please complete your payment to secure your tokens:</p>

      <a href="${data.paymentUrl}" class="button">Complete Payment</a>

      <p><em>This payment link will expire in 1 hour.</em></p>

      <p>Thank you for participating in our private sale!</p>
    </div>
  </div>
</body>
</html>
    `;

    return { subject, text, html };
  }

  private generatePaymentReceivedEmail(data: any): EmailContent {
    const subject = 'Payment Received - Tokens Confirmed';
    const text = `
Your payment has been received!

Transaction Hash: ${data.txHash}
Tokens Purchased: ${data.tokens}
Vesting Period: ${data.vestingMonths} months

Your tokens will be available for claiming according to the vesting schedule.

Thank you!
    `;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #10b981; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .success { background: white; padding: 20px; border-left: 4px solid #10b981; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Payment Received!</h1>
    </div>
    <div class="content">
      <div class="success">
        <p><strong>Transaction Hash:</strong> ${data.txHash}</p>
        <p><strong>Tokens Purchased:</strong> ${data.tokens}</p>
        <p><strong>Vesting Period:</strong> ${data.vestingMonths} months</p>
      </div>

      <p>Your tokens will be available for claiming according to the vesting schedule.</p>

      <p>Thank you for your purchase!</p>
    </div>
  </div>
</body>
</html>
    `;

    return { subject, text, html };
  }

  private generateTokensAvailableEmail(data: any): EmailContent {
    const subject = 'Tokens Available for Claiming';
    const text = `
Your tokens are now available for claiming!

Claimable Tokens: ${data.claimableTokens}
Wallet: ${data.walletAddress}

Visit the dashboard to claim your tokens.
    `;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #8b5cf6; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; background: #8b5cf6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Tokens Available!</h1>
    </div>
    <div class="content">
      <p>Great news! Your tokens are now available for claiming.</p>

      <p><strong>Claimable Tokens:</strong> ${data.claimableTokens}</p>
      <p><strong>Wallet:</strong> ${data.walletAddress}</p>

      <a href="${process.env.FRONTEND_URL}/claim" class="button">Claim Tokens</a>
    </div>
  </div>
</body>
</html>
    `;

    return { subject, text, html };
  }

  private generateVestingUnlockEmail(data: any): EmailContent {
    const subject = 'Vesting Unlock Reminder';
    const text = `
Vesting unlock reminder!

${data.tokensUnlocked} tokens will be unlocked on ${data.unlockDate}.

Visit your dashboard to view your vesting schedule.
    `;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #f59e0b; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Vesting Unlock Reminder</h1>
    </div>
    <div class="content">
      <p><strong>${data.tokensUnlocked}</strong> tokens will be unlocked on <strong>${data.unlockDate}</strong>.</p>

      <p>Visit your dashboard to view your complete vesting schedule.</p>
    </div>
  </div>
</body>
</html>
    `;

    return { subject, text, html };
  }

  private generatePurchaseFailedEmail(data: any): EmailContent {
    const subject = 'Purchase Failed';
    const text = `
Your token purchase failed.

Reason: ${data.reason}

Please try again or contact support if you need assistance.
    `;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #ef4444; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Purchase Failed</h1>
    </div>
    <div class="content">
      <p>Unfortunately, your token purchase could not be completed.</p>

      <p><strong>Reason:</strong> ${data.reason}</p>

      <p>Please try again or contact our support team if you need assistance.</p>
    </div>
  </div>
</body>
</html>
    `;

    return { subject, text, html };
  }
}

interface EmailContent {
  subject: string;
  text: string;
  html: string;
}

export const emailService = new EmailService();
export const sendEmail = (data: EmailData) => emailService.sendEmail(data);
