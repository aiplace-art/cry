import type { NextApiRequest, NextApiResponse } from 'next';

interface EmailRequest {
  walletAddress: string;
  amount: number;
  tokens: number;
  transactionHash: string;
}

interface EmailResponse {
  success: boolean;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<EmailResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { walletAddress, amount, tokens, transactionHash } = req.body as EmailRequest;

    if (!walletAddress || !amount || !tokens || !transactionHash) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    // In production, integrate with email service
    // Example with SendGrid:
    /*
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const msg = {
      to: userEmail, // Would need to get from database
      from: 'noreply@hypetoken.io',
      subject: 'HYPE Token Purchase Confirmation',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #3B82F6;">Purchase Confirmed! 🎉</h1>

          <p>Thank you for your purchase of HYPE tokens!</p>

          <div style="background: #F3F4F6; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h2 style="margin-top: 0;">Transaction Details</h2>
            <table style="width: 100%;">
              <tr>
                <td><strong>Amount Paid:</strong></td>
                <td>$${amount.toLocaleString()}</td>
              </tr>
              <tr>
                <td><strong>Tokens Received:</strong></td>
                <td>${tokens.toLocaleString()} HYPE</td>
              </tr>
              <tr>
                <td><strong>Wallet Address:</strong></td>
                <td style="font-family: monospace; font-size: 12px;">${walletAddress}</td>
              </tr>
              <tr>
                <td><strong>Transaction Hash:</strong></td>
                <td style="font-family: monospace; font-size: 12px;">${transactionHash}</td>
              </tr>
            </table>
          </div>

          <h3>What's Next?</h3>
          <ul>
            <li>Your tokens will be locked for 90 days (vesting period)</li>
            <li>After vesting, tokens will be automatically transferred to your wallet</li>
            <li>You can track your vesting schedule in your dashboard</li>
          </ul>

          <p style="margin-top: 30px;">
            <a href="https://hypetoken.io/dashboard"
               style="background: #3B82F6; color: white; padding: 12px 24px;
                      text-decoration: none; border-radius: 8px; display: inline-block;">
              View My Dashboard
            </a>
          </p>

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #E5E7EB;">

          <p style="color: #6B7280; font-size: 14px;">
            If you have any questions, please contact our support team at support@hypetoken.io
          </p>
        </div>
      `,
    };

    await sgMail.send(msg);
    */

    // For now, just log the email data
    console.log('Email notification sent:', {
      walletAddress,
      amount,
      tokens,
      transactionHash,
    });

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Email send error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to send email',
    });
  }
}
