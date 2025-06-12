import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

const GA4_PROPERTY_ID = process.env.GA4_PROPERTY_ID;
const SERVICE_ACCOUNT_KEY_PATH = process.env.GA_SERVICE_ACCOUNT_KEY_PATH || './service-account.json';

export async function GET() {
  if (!GA4_PROPERTY_ID) {
    return NextResponse.json({ error: 'GA4 property ID not set' }, { status: 500 });
  }

  let credentials;
  try {
    const keyPath = path.resolve(process.cwd(), SERVICE_ACCOUNT_KEY_PATH);
    credentials = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
  } catch (e) {
    return NextResponse.json({ error: 'Service account key not found or invalid' }, { status: 500 });
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
    });
    const analyticsData = google.analyticsdata({ version: 'v1beta', auth });
    const response = await analyticsData.properties.runRealtimeReport({
      property: `properties/${GA4_PROPERTY_ID}`,
      requestBody: {
        dimensions: [{ name: 'unifiedScreenName' }],
        metrics: [{ name: 'activeUsers' }],
      },
    });
    const activeUsers = response.data.rows?.[0]?.metricValues?.[0]?.value || '0';
    return NextResponse.json({ activeUsers: Number(activeUsers) });
  } catch (e) {
    console.error('GA4 API error:', e);
    return NextResponse.json({ error: 'Failed to fetch active users' }, { status: 500 });
  }
} 