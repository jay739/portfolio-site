#!/bin/bash

# Commands to run on your backup VPS (100.84.119.98)
# This will set up an endpoint to receive Sentry alerts and forward them to Telegram

echo "Setting up Sentry-Telegram endpoint on backup VPS..."

# Create the endpoint script
cat > /tmp/sentry-telegram-endpoint.js << 'EOF'
const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;

// Your existing Telegram bot configuration
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN; // Your existing bot token
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;     // Your existing chat ID

app.use(express.json());

// Endpoint to receive Sentry alerts
app.post('/api/telegram', async (req, res) => {
  try {
    const { type, message, source, timestamp } = req.body;
    
    if (type === 'sentry_alert') {
      console.log(`Received Sentry alert from ${source} at ${timestamp}`);
      
      // Send to your existing Telegram bot
      await sendTelegramMessage(message);
      
      res.json({ status: 'sent', timestamp: new Date().toISOString() });
    } else {
      res.json({ status: 'ignored', reason: 'not a sentry alert' });
    }
  } catch (error) {
    console.error('Error processing alert:', error);
    res.status(500).json({ error: 'Failed to process alert' });
  }
});

async function sendTelegramMessage(message) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.error('Telegram credentials not configured');
    return;
  }
  
  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const response = await axios.post(url, {
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'Markdown',
      disable_web_page_preview: true
    });
    console.log('Telegram message sent successfully');
  } catch (error) {
    console.error('Error sending Telegram message:', error.response?.data || error.message);
  }
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'sentry-telegram-bridge' });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Sentry-Telegram bridge listening on port ${port}`);
});
EOF

# Install dependencies if needed
echo "Installing Node.js dependencies..."
npm install express axios

# Start the service (you may want to use PM2 or systemd for production)
echo "Starting Sentry-Telegram bridge..."
node /tmp/sentry-telegram-endpoint.js

EOF
