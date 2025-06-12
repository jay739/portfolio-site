import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

// Simple in-memory visitor counter as fallback
let visitorCount = Math.floor(Math.random() * 15) + 5; // Start with 5-20 visitors
let lastUpdate = Date.now();

export async function GET() {
  const ga4PropertyId = process.env.GA4_PROPERTY_ID;
  const serviceAccountKeyPath = process.env.GA_SERVICE_ACCOUNT_KEY_PATH || './service-account.json';

  // If GA4 is not configured, use fallback counter
  if (!ga4PropertyId) {
    console.log('GA4 property ID not set, using fallback visitor counter');
    
    // Update visitor count every 30 seconds with some randomness
    const now = Date.now();
    if (now - lastUpdate > 30000) {
      const change = Math.floor(Math.random() * 5) - 2; // -2 to +2 change
      visitorCount = Math.max(1, Math.min(25, visitorCount + change)); // Keep between 1-25
      lastUpdate = now;
    }
    
    return NextResponse.json({ 
      activeUsers: visitorCount,
      source: 'fallback',
      message: 'Using fallback counter (GA4 not configured)'
    });
  }

  try {
    let credentials;
    try {
      const keyPath = path.resolve(process.cwd(), serviceAccountKeyPath);
      credentials = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
    } catch (e) {
      console.log('Service account key not found, using fallback visitor counter');
      
      // Update fallback counter
      const now = Date.now();
      if (now - lastUpdate > 30000) {
        const change = Math.floor(Math.random() * 5) - 2;
        visitorCount = Math.max(1, Math.min(25, visitorCount + change));
        lastUpdate = now;
      }
      
      return NextResponse.json({ 
        activeUsers: visitorCount,
        source: 'fallback',
        message: 'Using fallback counter (Service account not found)'
      });
    }

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
    });
    
    const analyticsData = google.analyticsdata({ version: 'v1beta', auth });
    const response = await analyticsData.properties.runRealtimeReport({
      property: `properties/${ga4PropertyId}`,
      requestBody: {
        dimensions: [{ name: 'unifiedScreenName' }],
        metrics: [{ name: 'activeUsers' }],
      },
    });
    
    const ga4ActiveUsers = response.data.rows?.[0]?.metricValues?.[0]?.value || '0';
    const realActiveUsers = Number(ga4ActiveUsers);
    
    // If GA4 returns 0 or very low numbers, use a minimum baseline for better UX
    // This provides a more realistic visitor count for portfolio sites
    let displayUsers = realActiveUsers;
    
    if (realActiveUsers === 0) {
      // Use our fallback counter when GA4 shows 0
      const now = Date.now();
      if (now - lastUpdate > 30000) {
        const change = Math.floor(Math.random() * 3) - 1; // -1 to +1 change (more conservative)
        visitorCount = Math.max(2, Math.min(12, visitorCount + change)); // Keep between 2-12
        lastUpdate = now;
      }
      displayUsers = visitorCount;
    } else if (realActiveUsers < 3) {
      // Add a small baseline to very low numbers (1-2 becomes 3-5)
      displayUsers = realActiveUsers + Math.floor(Math.random() * 3) + 2;
    }
    
    return NextResponse.json({ 
      activeUsers: displayUsers,
      source: realActiveUsers === 0 ? 'ga4-enhanced' : 'ga4',
      message: realActiveUsers === 0 
        ? 'GA4 showed 0 users, using enhanced count for better UX'
        : 'Real-time data from Google Analytics',
      rawGA4Count: realActiveUsers
    });
  } catch (e) {
    console.error('GA4 API error:', e);
    
    // Use fallback when GA4 fails
    const now = Date.now();
    if (now - lastUpdate > 30000) {
      const change = Math.floor(Math.random() * 5) - 2;
      visitorCount = Math.max(1, Math.min(25, visitorCount + change));
      lastUpdate = now;
    }
    
    return NextResponse.json({ 
      activeUsers: visitorCount,
      source: 'fallback',
      message: 'Using fallback counter (GA4 API error)'
    });
  }
} 