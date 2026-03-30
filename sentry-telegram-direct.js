// Alternative: Direct Telegram integration (no backup VPS needed)
const express = require('express');
const axios = require('axios');
const app = express();
const port = 3007;

// Direct Telegram Bot Configuration
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN; // Your existing bot token
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;     // Your existing chat ID

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
        message = `${emoji} *PORTFOLIO ERROR DETECTED*\n\n`;
        message += `*Project:* ${project.name}\n`;
        message += `*Error:* ${issue.title}\n`;
        message += `*Level:* ${issue.level.toUpperCase()}\n`;
        message += `*Count:* ${issue.count} events\n`;
        message += `*First Seen:* ${new Date(issue.firstSeen).toLocaleString()}\n`;
        message += `*Environment:* ${issue.tags?.environment || 'production'}\n\n`;
        message += `[🔍 View in Sentry](${issue.permalink})`;
      } else if (action === 'issue.resolved') {
        emoji = '✅';
        message = `${emoji} *PORTFOLIO ISSUE RESOLVED*\n\n`;
        message += `*Project:* ${project.name}\n`;
        message += `*Error:* ${issue.title}\n\n`;
        message += `[View in Sentry](${issue.permalink})`;
      }
      
      // Send directly to Telegram
      await sendTelegramDirect(message);
      
      console.log(`Sent Sentry ${action} notification directly to Telegram`);
    }
    
    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Error processing Sentry webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

async function sendTelegramDirect(message) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.error('Telegram bot token or chat ID not configured');
    console.log('SENTRY ALERT (NO TELEGRAM):', message);
    return;
  }
  
  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    await axios.post(url, {
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'Markdown',
      disable_web_page_preview: true
    });
    console.log('Telegram message sent successfully');
  } catch (error) {
    console.error('Error sending Telegram message:', error.response?.data || error.message);
    // Fallback: Log locally if Telegram fails
    console.log('SENTRY ALERT (TELEGRAM FAILED):', message);
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
