const nodemailer = require('nodemailer');
const axios = require('axios');
const { format } = require('date-fns');

class DailyReportGenerator {
  constructor(config) {
    this.config = config;
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async generateReport() {
    console.log('Generating daily report...');

    const data = await this.fetchData();
    const html = this.generateHTML(data);

    return {
      date: format(new Date(), 'yyyy-MM-dd'),
      data,
      html,
    };
  }

  async fetchData() {
    const baseUrl = process.env.DASHBOARD_URL || 'http://localhost:3001';

    try {
      const [tokenData, priceData, socialData] = await Promise.all([
        axios.get(`${baseUrl}/api/token`).then(r => r.data),
        axios.get(`${baseUrl}/api/price`).then(r => r.data),
        axios.get(`${baseUrl}/api/social`).then(r => r.data),
      ]);

      return { tokenData, priceData, socialData };
    } catch (error) {
      console.error('Error fetching data:', error.message);
      return null;
    }
  }

  generateHTML(data) {
    if (!data) {
      return '<p>Error generating report. Please check the dashboard API.</p>';
    }

    const { tokenData, priceData, socialData } = data;

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>HypeAI Daily Report - ${format(new Date(), 'MMM dd, yyyy')}</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f7fa;
    }
    .header {
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: white;
      padding: 30px;
      border-radius: 10px;
      margin-bottom: 30px;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
    }
    .header p {
      margin: 10px 0 0;
      opacity: 0.9;
    }
    .metric-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin-bottom: 30px;
    }
    .metric-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .metric-label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 5px;
    }
    .metric-value {
      font-size: 28px;
      font-weight: bold;
      color: #6366f1;
      margin-bottom: 5px;
    }
    .metric-change {
      font-size: 14px;
      font-weight: 600;
    }
    .positive {
      color: #10b981;
    }
    .negative {
      color: #ef4444;
    }
    .section {
      background: white;
      padding: 25px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 20px;
    }
    .section h2 {
      margin-top: 0;
      color: #1e293b;
      font-size: 20px;
      border-bottom: 2px solid #6366f1;
      padding-bottom: 10px;
    }
    .social-metrics {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;
    }
    .social-item {
      text-align: center;
      padding: 15px;
      background: #f8fafc;
      border-radius: 6px;
    }
    .footer {
      text-align: center;
      padding: 20px;
      color: #666;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🚀 HypeAI Daily Report</h1>
    <p>${format(new Date(), 'EEEE, MMMM dd, yyyy')}</p>
  </div>

  <div class="metric-grid">
    <div class="metric-card">
      <div class="metric-label">Token Price</div>
      <div class="metric-value">$${priceData.price.toFixed(6)}</div>
      <div class="metric-change ${priceData.priceChange24h >= 0 ? 'positive' : 'negative'}">
        ${priceData.priceChange24h >= 0 ? '▲' : '▼'} ${Math.abs(priceData.priceChange24h).toFixed(2)}%
      </div>
    </div>

    <div class="metric-card">
      <div class="metric-label">Market Cap</div>
      <div class="metric-value">$${(priceData.marketCap / 1000000).toFixed(2)}M</div>
      <div class="metric-change ${priceData.priceChange24h >= 0 ? 'positive' : 'negative'}">
        ${priceData.priceChange24h >= 0 ? '▲' : '▼'} ${Math.abs(priceData.priceChange24h).toFixed(2)}%
      </div>
    </div>

    <div class="metric-card">
      <div class="metric-label">24h Volume</div>
      <div class="metric-value">$${(priceData.volume24h / 1000000).toFixed(2)}M</div>
    </div>

    <div class="metric-card">
      <div class="metric-label">Token Holders</div>
      <div class="metric-value">${tokenData.holders.toLocaleString()}</div>
    </div>
  </div>

  <div class="section">
    <h2>📱 Social Media Metrics</h2>
    <div class="social-metrics">
      <div class="social-item">
        <h3 style="margin:0 0 10px;color:#1DA1F2;">Twitter</h3>
        <p style="font-size:24px;font-weight:bold;margin:5px 0;">${socialData.twitter.followers.toLocaleString()}</p>
        <p style="color:#10b981;margin:0;">+${socialData.twitter.growth_24h} today</p>
      </div>

      <div class="social-item">
        <h3 style="margin:0 0 10px;color:#0088cc;">Telegram</h3>
        <p style="font-size:24px;font-weight:bold;margin:5px 0;">${socialData.telegram.members.toLocaleString()}</p>
        <p style="color:#10b981;margin:0;">+${socialData.telegram.growth_24h} today</p>
      </div>

      <div class="social-item">
        <h3 style="margin:0 0 10px;color:#5865F2;">Discord</h3>
        <p style="font-size:24px;font-weight:bold;margin:5px 0;">${socialData.discord.members.toLocaleString()}</p>
        <p style="color:#10b981;margin:0;">+${socialData.discord.growth_24h} today</p>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>📊 Key Highlights</h2>
    <ul>
      <li>Total social reach: <strong>${socialData.total_reach.toLocaleString()}</strong> members</li>
      <li>Price range: $${priceData.low24h.toFixed(6)} - $${priceData.high24h.toFixed(6)}</li>
      <li>Twitter engagement rate: <strong>${socialData.twitter.engagement_rate.toFixed(2)}%</strong></li>
      <li>Telegram engagement: <strong>${socialData.telegram.engagement_rate.toFixed(2)}%</strong></li>
    </ul>
  </div>

  <div class="footer">
    <p>This report was automatically generated by HypeAI Analytics</p>
    <p>View the full dashboard at <a href="${process.env.DASHBOARD_URL || 'http://localhost:3001'}">${process.env.DASHBOARD_URL || 'http://localhost:3001'}</a></p>
  </div>
</body>
</html>
    `;
  }

  async sendReport(report) {
    if (!report || !report.html) {
      console.error('Invalid report data');
      return false;
    }

    const recipients = this.config.hypeai.notifications.email.recipients;

    try {
      await this.transporter.sendMail({
        from: `"HypeAI Analytics" <${process.env.SMTP_USER}>`,
        to: recipients.join(', '),
        subject: `HypeAI Daily Report - ${format(new Date(), 'MMM dd, yyyy')}`,
        html: report.html,
      });

      console.log('Daily report sent successfully');
      return true;
    } catch (error) {
      console.error('Error sending report:', error.message);
      return false;
    }
  }
}

// Main execution
async function main() {
  const config = require('../../metrics-config.json');
  const generator = new DailyReportGenerator(config);

  const report = await generator.generateReport();
  await generator.sendReport(report);

  console.log('Daily report generation complete!');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = DailyReportGenerator;
