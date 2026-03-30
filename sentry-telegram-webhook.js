const express = require('express');
const axios = require('axios');
const app = express();
const port = 3007;

// Telegram Bot Configuration - Using existing bot on backup VPS
const BACKUP_VPS_IP = '100.84.119.98';
const TELEGRAM_WEBHOOK_URL = `http://${BACKUP_VPS_IP}:3000/api/telegram`; // Adjust port as needed

app.use(express.json());

// Sentry Webhook endpoint
app.post('/sentry-webhook', async (req, res) => {
  try {
    const { action, data } = req.body;
    
    // Only send notifications for new issues and resolved issues
    if (action === 'issue.created' || action === 'issue.resolved') {
      const issue = data.issue;
      const project = data.project;
      
      let message = '';
      let emoji = '';
      
      if (action === 'issue.created') {
        emoji = '🚨';
        message = `${emoji} *NEW ERROR DETECTED*\n\n`;
        message += `*Project:* ${project.name}\n`;
        message += `*Error:* ${issue.title}\n`;
        message += `*Level:* ${issue.level}\n`;
        message += `*Count:* ${issue.count} events\n`;
        message += `*First Seen:* ${new Date(issue.firstSeen).toLocaleString()}\n`;
        message += `*Last Seen:* ${new Date(issue.lastSeen).toLocaleString()}\n`;
        message += `*Environment:* ${issue.tags?.environment || 'production'}\n\n`;
        message += `[View in Sentry](${issue.permalink})`;
      } else if (action === 'issue.resolved') {
        emoji = '✅';
        message = `${emoji} *ISSUE RESOLVED*\n\n`;
        message += `*Project:* ${project.name}\n`;
        message += `*Error:* ${issue.title}\n`;
        message += `*Resolved by:* Auto-resolved\n\n`;
        message += `[View in Sentry](${issue.permalink})`;
      }
      
      // Send to your existing Telegram bot on backup VPS
      await sendToExistingBot(message);
      
      console.log(`Sent Sentry ${action} notification to Telegram bot on backup VPS`);
    }
    
    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Error processing Sentry webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

async function sendToExistingBot(message) {
  try {
    console.log('Sending alert to existing Telegram bot on backup VPS...');
    
    // Send alert to your existing bot on the backup VPS
    const response = await axios.post(TELEGRAM_WEBHOOK_URL, {
      type: 'sentry_alert',
      message: message,
      source: 'portfolio_sentry',
      timestamp: new Date().toISOString()
    }, {
      timeout: 10000, // 10 second timeout
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Portfolio-Sentry-Webhook'
      }
    });
    
    console.log('Successfully sent to Telegram bot:', response.status);
  } catch (error) {
    console.error('Error sending to existing Telegram bot:', {
      message: error.message,
      code: error.code,
      response: error.response?.data,
      status: error.response?.status
    });
    
    // Fallback: Log the message locally if the backup VPS is unreachable
    console.log('SENTRY ALERT (FALLBACK):', message);
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`Sentry-Telegram webhook server running on port ${port}`);
  console.log(`Webhook URL: http://localhost:${port}/sentry-webhook`);
});

module.exports = app;
