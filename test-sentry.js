// Simple Sentry test script
const https = require('https');

const data = JSON.stringify({
  exception: {
    values: [{
      type: 'Error',
      value: 'Manual test from portfolio site - Sentry is working!',
      stacktrace: {
        frames: [{
          filename: 'test.js',
          function: 'testFunction',
          lineno: 1
        }]
      }
    }]
  },
  platform: 'javascript',
  timestamp: new Date().toISOString()
});

const options = {
  hostname: 'o4509485147095040.ingest.us.sentry.io',
  port: 443,
  path: '/api/4509485148667904/store/',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length,
    'X-Sentry-Auth': 'Sentry sentry_version=7, sentry_key=370d53d93a12d50d6a5f175d00081379, sentry_client=test/1.0'
  }
};

console.log('Sending test event to Sentry...');
const req = https.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log('✅ Test event sent to Sentry! Check your dashboard in 1-2 minutes.');
});

req.on('error', (e) => {
  console.error('❌ Error sending to Sentry:', e.message);
});

req.write(data);
req.end();
