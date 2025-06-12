// Unified Netdata fetch helper
// This ensures all Netdata fetches go through our API routes and maintains consistent error handling

import { Errors } from '@/lib/error-handling';

interface NetdataDataPoint {
  dimension: string;
  value: number;
  timestamp: number;
}

interface NetdataResponse {
  result: NetdataDataPoint[];
  labels: string[];
  view_update_every: number;
  latest_values: number[];
  view_latest_values: number[];
  dimensions: string[];
  latest_values_sum: number;
  view_latest_values_sum: number;
  min: number;
  max: number;
}

interface NetdataFetchOptions {
  service: string;
  after?: string;
  dimension?: string;
  points?: number;
}

// Helper function to create Basic Auth header
function createBasicAuthHeader(username: string, password: string): string {
  const credentials = Buffer.from(`${username}:${password}`).toString('base64');
  return `Basic ${credentials}`;
}

// Add a function to handle authentication
export async function authenticateNetdata(username: string, password: string): Promise<boolean> {
  try {
    const response = await fetch('/api/netdata/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Authentication failed');
    }

    return true;
  } catch (error) {
    console.error('Authentication error:', error);
    return false;
  }
}

/**
 * Unified helper to fetch Netdata metrics through our API routes
 * @param service The service to fetch metrics for
 * @param dimension Optional dimension to filter by
 * @param after Optional start time in seconds
 * @param before Optional end time in seconds
 * @param points Optional number of points to fetch
 * @returns Promise with the fetched data or empty array on error
 */
export async function fetchNetdataMetrics(
  service: string,
  dimension?: string,
  after = 0,
  before = 0,
  points = 1
): Promise<NetdataDataPoint[]> {
  try {
    // Use the API route on the client side
    if (typeof window !== 'undefined') {
      const url = new URL('/api/netdata/' + encodeURIComponent(service), window.location.origin);
      url.searchParams.append('points', points.toString());
      if (dimension) url.searchParams.append('dimension', encodeURIComponent(dimension));
      if (after > 0) url.searchParams.append('after', after.toString());
      if (before > 0) url.searchParams.append('before', before.toString());

      const response = await fetch(url.toString(), {
        credentials: 'include',
        headers: {
          'Accept': '*/*',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        console.error('Netdata API Error:', {
          status: response.status,
          statusText: response.statusText,
          url: url.toString()
        });

        // If unauthorized, try to re-authenticate
        if (response.status === 401) {
          // You might want to trigger a re-authentication here
          // For now, we'll just throw the error
          throw new Error('Authentication required');
        }

        throw new Error(`HTTP error! status: ${response.status}`);
      }

      try {
        const rawData = await response.json();
        // Handle v3 API response format
        const data: NetdataResponse = {
          result: rawData.data.map((point: any) => ({
            dimension: point.dimension || dimension || 'value',
            value: point.value,
            timestamp: point.timestamp
          })),
          labels: rawData.labels || [],
          dimensions: rawData.dimensions || [],
          latest_values: rawData.latest_values || [],
          view_latest_values: rawData.view_latest_values || [],
          view_update_every: rawData.view_update_every || 1,
          latest_values_sum: rawData.latest_values_sum || 0,
          view_latest_values_sum: rawData.view_latest_values_sum || 0,
          min: rawData.min || 0,
          max: rawData.max || 0
        };
        
        return dimension 
          ? data.result.filter((entry: NetdataDataPoint) => entry.dimension === dimension)
          : data.result;
      } catch (error) {
        console.error('Failed to parse Netdata response:', error);
        throw new Error('Invalid response format from Netdata API');
      }
    }
    
    // Direct Netdata API access on the server side
    const netdataUrl = process.env.NETDATA_URL || 'https://metrics.jay739.dev';
    const url = new URL(`${netdataUrl}/api/v3/data`);
    url.searchParams.append('format', 'json2');
    url.searchParams.append('points', points.toString());
    url.searchParams.append('time_group', 'average');
    url.searchParams.append('time_resampling', '0');
    url.searchParams.append('options', 'jsonwrap|nonzero|ms');
    url.searchParams.append('contexts', '*');
    url.searchParams.append('nodes', '*');
    url.searchParams.append('instances', '*');
    url.searchParams.append('scope_contexts', service);
    
    if (dimension) {
      url.searchParams.append('dimensions', dimension);
    }
    
    if (after > 0) {
      url.searchParams.append('after', after.toString());
    }
    
    if (before > 0) {
      url.searchParams.append('before', before.toString());
    }

    // Split NETDATA_API_KEY into username:password
    const netdataApiKey = process.env.NETDATA_API_KEY;
    if (!netdataApiKey) {
      throw Errors.Internal('NETDATA_API_KEY not set');
    }
    const [username, password] = netdataApiKey.split(':');
    if (!username || !password) {
      throw Errors.Internal('Invalid NETDATA_API_KEY format. Expected "username:password"');
    }

    // Create Basic Auth header exactly as seen in the browser
    const basicAuth = Buffer.from(`${username}:${password}`).toString('base64');

    const response = await fetch(url.toString(), {
      headers: {
        'Accept': '*/*',
        'Authorization': `Basic ${basicAuth}`,
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'User-Agent': 'Netdata/v3',
        'Accept-Encoding': 'gzip, deflate, br'
      },
    });

    if (!response.ok) {
      throw Errors.Internal(`Failed to fetch Netdata metrics: ${response.statusText}`);
    }

    try {
      const rawData = await response.json();
      // Handle v3 API response format
      const data: NetdataResponse = {
        result: rawData.data.map((point: any) => ({
          dimension: point.dimension || dimension || 'value',
          value: point.value,
          timestamp: point.timestamp
        })),
        labels: rawData.labels || [],
        dimensions: rawData.dimensions || [],
        latest_values: rawData.latest_values || [],
        view_latest_values: rawData.view_latest_values || [],
        view_update_every: rawData.view_update_every || 1,
        latest_values_sum: rawData.latest_values_sum || 0,
        view_latest_values_sum: rawData.view_latest_values_sum || 0,
        min: rawData.min || 0,
        max: rawData.max || 0
      };

      return dimension 
        ? data.result.filter((entry: NetdataDataPoint) => entry.dimension === dimension)
        : data.result;
    } catch (error) {
      console.error('Failed to parse Netdata response:', error);
      throw Errors.Internal('Invalid response format from Netdata API');
    }

  } catch (error) {
    if (error instanceof Error) {
      throw Errors.Internal(`Error fetching Netdata metrics: ${error.message}`);
    }
    throw Errors.Internal('Unknown error fetching Netdata metrics');
  }
}

/**
 * Helper to fetch Netdata chart data with timestamps formatted for display
 */
export async function fetchNetdataChart(options: NetdataFetchOptions) {
  const data = await fetchNetdataMetrics(options.service, options.dimension);
  return data.map(entry => ({
    timestamp: new Date(entry.timestamp * 1000).toLocaleTimeString(),
    value: entry.value,
  }));
} 