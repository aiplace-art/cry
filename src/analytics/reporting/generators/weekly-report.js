const DailyReportGenerator = require('./daily-report');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { format, subDays } = require('date-fns');

class WeeklyReportGenerator extends DailyReportGenerator {
  async generateReport() {
    console.log('Generating weekly report...');

    const data = await this.fetchWeeklyData();
    const html = this.generateWeeklyHTML(data);
    const pdf = await this.generatePDF(data);

    return {
      startDate: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
      endDate: format(new Date(), 'yyyy-MM-dd'),
      data,
      html,
      pdf,
    };
  }

  async fetchWeeklyData() {
    // Fetch current data
    const currentData = await this.fetchData();

    // In production, you would fetch historical data for the week
    // For now, returning current data with mock weekly trends
    return {
      ...currentData,
      weeklyTrends: {
        priceChange: 28.7,
        holderGrowth: 347,
        volumeChange: 42.3,
        socialGrowth: {
          twitter: 892,
          telegram: 621,
          discord: 334,
        },
      },
    };
  }

  generateWeeklyHTML(data) {
    if (!data) {
      return '<p>Error generating weekly report.</p>';
    }

    const { tokenData, priceData, socialData, weeklyTrends } = data;

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>HypeAI Weekly Report - Week of ${format(subDays(new Date(), 7), 'MMM dd')}</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 900px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f7fa;
    }
    .header {
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: white;
      padding: 40px;
      border-radius: 10px;
      margin-bottom: 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 32px;
    }
    .header p {
      margin: 15px 0 0;
      opacity: 0.9;
      font-size: 18px;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin-bottom: 30px;
    }
    .summary-card {
      background: white;
      padding: 25px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      text-align: center;
    }
    .summary-card h3 {
      margin: 0 0 10px;
      font-size: 14px;
      color: #666;
      text-transform: uppercase;
    }
    .summary-card .value {
      font-size: 32px;
      font-weight: bold;
      color: #6366f1;
      margin-bottom: 10px;
    }
    .summary-card .change {
      font-size: 16px;
      font-weight: 600;
    }
    .positive { color: #10b981; }
    .negative { color: #ef4444; }
    .section {
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 25px;
    }
    .section h2 {
      margin-top: 0;
      color: #1e293b;
      font-size: 24px;
      border-bottom: 3px solid #6366f1;
      padding-bottom: 12px;
      margin-bottom: 20px;
    }
    .highlights {
      background: linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%);
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #6366f1;
    }
    .highlights ul {
      margin: 10px 0;
      padding-left: 25px;
    }
    .highlights li {
      margin: 8px 0;
      font-size: 16px;
    }
    .footer {
      text-align: center;
      padding: 25px;
      color: #666;
      font-size: 13px;
      background: white;
      border-radius: 8px;
      margin-top: 30px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 HypeAI Weekly Report</h1>
    <p>Week of ${format(subDays(new Date(), 7), 'MMM dd')} - ${format(new Date(), 'MMM dd, yyyy')}</p>
  </div>

  <div class="summary-grid">
    <div class="summary-card">
      <h3>Weekly Price Change</h3>
      <div class="value">+${weeklyTrends.priceChange.toFixed(1)}%</div>
      <div class="change positive">▲ Strong Growth</div>
    </div>

    <div class="summary-card">
      <h3>New Holders</h3>
      <div class="value">+${weeklyTrends.holderGrowth}</div>
      <div class="change positive">▲ ${((weeklyTrends.holderGrowth / tokenData.holders) * 100).toFixed(1)}%</div>
    </div>

    <div class="summary-card">
      <h3>Volume Growth</h3>
      <div class="value">+${weeklyTrends.volumeChange.toFixed(1)}%</div>
      <div class="change positive">▲ Increased Activity</div>
    </div>

    <div class="summary-card">
      <h3>Social Growth</h3>
      <div class="value">+${weeklyTrends.socialGrowth.twitter + weeklyTrends.socialGrowth.telegram + weeklyTrends.socialGrowth.discord}</div>
      <div class="change positive">▲ New Members</div>
    </div>
  </div>

  <div class="section">
    <h2>🎯 Key Highlights</h2>
    <div class="highlights">
      <ul>
        <li><strong>Price Performance:</strong> Token price increased ${weeklyTrends.priceChange.toFixed(1)}% this week to $${priceData.price.toFixed(6)}</li>
        <li><strong>Community Growth:</strong> Added ${weeklyTrends.holderGrowth} new token holders, bringing total to ${tokenData.holders.toLocaleString()}</li>
        <li><strong>Social Expansion:</strong> ${weeklyTrends.socialGrowth.twitter} new Twitter followers, ${weeklyTrends.socialGrowth.telegram} Telegram members, ${weeklyTrends.socialGrowth.discord} Discord members</li>
        <li><strong>Trading Activity:</strong> 24h volume reached $${(priceData.volume24h / 1000000).toFixed(2)}M, up ${weeklyTrends.volumeChange.toFixed(1)}% from last week</li>
        <li><strong>Market Cap:</strong> Now at $${(priceData.marketCap / 1000000).toFixed(2)}M with strong upward momentum</li>
      </ul>
    </div>
  </div>

  <div class="section">
    <h2>📈 Current Metrics</h2>
    <table style="width:100%;border-collapse:collapse;">
      <tr style="background:#f8fafc;">
        <th style="padding:12px;text-align:left;border-bottom:2px solid #e2e8f0;">Metric</th>
        <th style="padding:12px;text-align:right;border-bottom:2px solid #e2e8f0;">Value</th>
        <th style="padding:12px;text-align:right;border-bottom:2px solid #e2e8f0;">Weekly Change</th>
      </tr>
      <tr>
        <td style="padding:12px;border-bottom:1px solid #e2e8f0;">Token Price</td>
        <td style="padding:12px;text-align:right;border-bottom:1px solid #e2e8f0;">$${priceData.price.toFixed(6)}</td>
        <td style="padding:12px;text-align:right;border-bottom:1px solid #e2e8f0;color:#10b981;">+${weeklyTrends.priceChange.toFixed(2)}%</td>
      </tr>
      <tr>
        <td style="padding:12px;border-bottom:1px solid #e2e8f0;">Market Cap</td>
        <td style="padding:12px;text-align:right;border-bottom:1px solid #e2e8f0;">$${(priceData.marketCap / 1000000).toFixed(2)}M</td>
        <td style="padding:12px;text-align:right;border-bottom:1px solid #e2e8f0;color:#10b981;">+${weeklyTrends.priceChange.toFixed(2)}%</td>
      </tr>
      <tr>
        <td style="padding:12px;border-bottom:1px solid #e2e8f0;">Token Holders</td>
        <td style="padding:12px;text-align:right;border-bottom:1px solid #e2e8f0;">${tokenData.holders.toLocaleString()}</td>
        <td style="padding:12px;text-align:right;border-bottom:1px solid #e2e8f0;color:#10b981;">+${weeklyTrends.holderGrowth}</td>
      </tr>
      <tr>
        <td style="padding:12px;border-bottom:1px solid #e2e8f0;">Twitter Followers</td>
        <td style="padding:12px;text-align:right;border-bottom:1px solid #e2e8f0;">${socialData.twitter.followers.toLocaleString()}</td>
        <td style="padding:12px;text-align:right;border-bottom:1px solid #e2e8f0;color:#10b981;">+${weeklyTrends.socialGrowth.twitter}</td>
      </tr>
      <tr>
        <td style="padding:12px;">Telegram Members</td>
        <td style="padding:12px;text-align:right;">${socialData.telegram.members.toLocaleString()}</td>
        <td style="padding:12px;text-align:right;color:#10b981;">+${weeklyTrends.socialGrowth.telegram}</td>
      </tr>
    </table>
  </div>

  <div class="section">
    <h2>🎯 Goals for Next Week</h2>
    <ul>
      <li>Reach ${(tokenData.holders + 250).toLocaleString()} token holders</li>
      <li>Increase Twitter engagement rate to ${(socialData.twitter.engagement_rate + 1).toFixed(1)}%</li>
      <li>Launch 2 new influencer campaigns</li>
      <li>Achieve $${((priceData.marketCap + 500000) / 1000000).toFixed(2)}M market cap</li>
    </ul>
  </div>

  <div class="footer">
    <p><strong>HypeAI Analytics</strong> - Automated Weekly Report</p>
    <p>View the full dashboard at <a href="${process.env.DASHBOARD_URL || 'http://localhost:3001'}">${process.env.DASHBOARD_URL || 'http://localhost:3001'}</a></p>
    <p style="margin-top:10px;color:#999;font-size:11px;">Generated on ${format(new Date(), 'PPpp')}</p>
  </div>
</body>
</html>
    `;
  }

  async generatePDF(data) {
    const outputPath = path.join(__dirname, '../../data', `weekly-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);

    // Ensure data directory exists
    await fs.promises.mkdir(path.dirname(outputPath), { recursive: true });

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(outputPath);

      doc.pipe(stream);

      // Header
      doc.fontSize(24).fillColor('#6366f1').text('HypeAI Weekly Report', { align: 'center' });
      doc.fontSize(12).fillColor('#666').text(
        `Week of ${format(subDays(new Date(), 7), 'MMM dd')} - ${format(new Date(), 'MMM dd, yyyy')}`,
        { align: 'center' }
      );
      doc.moveDown(2);

      // Summary Section
      doc.fontSize(16).fillColor('#000').text('Weekly Summary');
      doc.moveDown(0.5);
      doc.fontSize(10).fillColor('#333');
      doc.text(`Price: $${data.priceData.price.toFixed(6)} (+${data.weeklyTrends.priceChange.toFixed(1)}%)`);
      doc.text(`Market Cap: $${(data.priceData.marketCap / 1000000).toFixed(2)}M`);
      doc.text(`Holders: ${data.tokenData.holders.toLocaleString()} (+${data.weeklyTrends.holderGrowth})`);
      doc.text(`Social Reach: ${data.socialData.total_reach.toLocaleString()}`);
      doc.moveDown(2);

      // Highlights
      doc.fontSize(16).fillColor('#000').text('Key Highlights');
      doc.moveDown(0.5);
      doc.fontSize(10).fillColor('#333');
      doc.list([
        `Strong price performance with ${data.weeklyTrends.priceChange.toFixed(1)}% weekly gain`,
        `Added ${data.weeklyTrends.holderGrowth} new token holders`,
        `Social media growth across all platforms`,
        `Trading volume increased by ${data.weeklyTrends.volumeChange.toFixed(1)}%`,
      ]);

      // Footer
      doc.moveDown(2);
      doc.fontSize(8).fillColor('#999').text(
        'Generated by HypeAI Analytics System',
        { align: 'center' }
      );

      doc.end();

      stream.on('finish', () => resolve(outputPath));
      stream.on('error', reject);
    });
  }

  async sendReport(report) {
    if (!report || !report.html) {
      console.error('Invalid report data');
      return false;
    }

    const recipients = this.config.hypeai.notifications.email.recipients;

    try {
      const mailOptions = {
        from: `"HypeAI Analytics" <${process.env.SMTP_USER}>`,
        to: recipients.join(', '),
        subject: `HypeAI Weekly Report - Week of ${format(subDays(new Date(), 7), 'MMM dd')}`,
        html: report.html,
      };

      // Attach PDF if generated
      if (report.pdf) {
        mailOptions.attachments = [
          {
            filename: `hypeai-weekly-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`,
            path: report.pdf,
          },
        ];
      }

      await this.transporter.sendMail(mailOptions);

      console.log('Weekly report sent successfully');
      return true;
    } catch (error) {
      console.error('Error sending weekly report:', error.message);
      return false;
    }
  }
}

// Main execution
async function main() {
  const config = require('../../metrics-config.json');
  const generator = new WeeklyReportGenerator(config);

  const report = await generator.generateReport();
  await generator.sendReport(report);

  console.log('Weekly report generation complete!');
  if (report.pdf) {
    console.log(`PDF saved to: ${report.pdf}`);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = WeeklyReportGenerator;
