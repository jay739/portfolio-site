import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';
import { handleAPIError, Errors } from '@/lib/error-handling';
import { env } from '@/lib/env';
import { validateToken } from '@/lib/csrf';

const NETDATA_URL = process.env.NETDATA_URL || 'https://metrics.jay739.dev';
const CACHE_DURATION = 30000; // 30 seconds
const MAX_POINTS = 100;

// Cache for available charts
let chartsCache: { data: any; timestamp: number } | null = null;

// Helper to filter and transform chart data
function filterChartData(data: any, dimensions?: string[]) {
  if (!data?.data?.result) return { data: { result: [] } };
  
  const filteredResult = data.data.result.filter((item: any) => {
    if (!dimensions) return true;
    return dimensions.includes(item.dimension);
  });

  return {
    data: {
      ...data.data,
      result: filteredResult
    }
  };
}

// Get available charts with optimized caching
async function getAvailableCharts() {
  // Skip chart validation since the /charts endpoint is not reliable
    return { charts: {} };
}

// Map of service names to their corresponding Netdata charts
const SERVICE_CHARTS: Record<string, { chart: string; dimensions?: string[] }> = {
  'system': {
    chart: 'system.cpu',
    dimensions: ['user', 'system', 'idle']
  },
  'memory': {
    chart: 'system.ram',
    dimensions: ['used', 'free', 'cached', 'buffers']
  },
  'storage': {
    chart: 'disk_space./',
    dimensions: ['used', 'avail']
  },
  'network': {
    chart: 'netdata.statsd_packets',
    dimensions: ['tcp', 'udp']
  },
  'docker': {
    chart: 'docker_local.containers_state',
    dimensions: ['running', 'paused', 'exited']
  },
  'portainer': {
    chart: 'app.portainer_cpu_utilization',
    dimensions: ['user', 'system']
  },
  'signal-api': {
    chart: 'app.signal-cli-rest-api_cpu_utilization',
    dimensions: ['user', 'system']
  },
  'netdata': {
    chart: 'docker_local.container_netdata_state',
    dimensions: ['running', 'paused', 'exited']
  },
  'watchtower': {
    chart: 'docker_local.container_watchtower_state',
    dimensions: ['running', 'paused', 'exited']
  },
  'nginx-proxy-manager': {
    chart: 'docker_local.container_nginx-proxy-manager_state',
    dimensions: ['running', 'paused', 'exited']
  },
  'homeassistant': {
    chart: 'docker_local.container_homeassistant_state',
    dimensions: ['running', 'paused', 'exited']
  },
  'vaultwarden': {
    chart: 'docker_local.container_vaultwarden_state',
    dimensions: ['running', 'paused', 'exited']
  },
  'vscode': {
    chart: 'docker_local.container_vscode_state',
    dimensions: ['running', 'paused', 'exited']
  },
  'radarr': {
    chart: 'docker_local.container_radarr_state',
    dimensions: ['running', 'paused', 'exited']
  },
  'sonarr': {
    chart: 'docker_local.container_sonarr_state',
    dimensions: ['running', 'paused', 'exited']
  },
  'pihole': {
    chart: 'docker_local.container_pihole_state',
    dimensions: ['running', 'paused', 'exited']
  },
  'homarr': {
    chart: 'docker_local.container_homarr_state',
    dimensions: ['running', 'paused', 'exited']
  },
  'open-webui': {
    chart: 'docker_local.container_open-webui_state',
    dimensions: ['running', 'paused', 'exited']
  },
  'wg-easy': {
    chart: 'docker_local.container_wg-easy_state',
    dimensions: ['running', 'paused', 'exited']
  },
  'duckdns': {
    chart: 'docker_local.container_duckdns_state',
    dimensions: ['running', 'paused', 'exited']
  },
  'kuma-bot': {
    chart: 'docker_local.container_kuma-bot_state',
    dimensions: ['running', 'paused', 'exited']
  }
};

// Helper function to create Basic Auth header
function createBasicAuthHeader(username: string, password: string): string {
  const credentials = Buffer.from(`${username}:${password}`).toString('base64');
  return `Basic ${credentials}`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { service: string } }
) {
  try {
    // Rate limiting
    const limiter = rateLimit({
      interval: 60 * 1000, // 1 minute
      uniqueTokenPerInterval: 500
    });
    
    try {
      await limiter.check(5, 'NETDATA_API'); // 5 requests per minute
    } catch {
      throw Errors.TooManyRequests();
    }

    const service = params.service;
    const searchParams = request.nextUrl.searchParams;
    
    // Validate and sanitize input
    let points = parseInt(searchParams.get('points') || '1', 10);
    if (isNaN(points) || points < 1) {
      throw Errors.BadRequest('Invalid points parameter');
    }
    points = Math.min(points, MAX_POINTS); // Clamp to max
    
    const after = searchParams.get('after') || '-600';
    if (!/^-?\d+$/.test(after)) {
      throw Errors.BadRequest('Invalid after parameter');
    }

    // Validate service
    if (!SERVICE_CHARTS[service as keyof typeof SERVICE_CHARTS]) {
      throw Errors.NotFound(`Service not found: ${service}`);
    }

    const { chart, dimensions } = SERVICE_CHARTS[service as keyof typeof SERVICE_CHARTS];

    // Construct URL with minimal parameters
    const url = new URL(`${env.NETDATA_URL}/api/v1/data`);
    url.searchParams.set('chart', chart);
    url.searchParams.set('points', points.toString());
    url.searchParams.set('after', after);
    url.searchParams.set('format', 'json');

    // Prepare headers for Netdata request
    const headers: HeadersInit = {
      'Accept': 'application/json',
    };

    // Add Basic Auth if API key is configured
    if (env.NETDATA_API_KEY) {
      // For now, we'll use the API key as both username and password
      // This can be changed later to use different credentials
      headers['Authorization'] = createBasicAuthHeader('netdata', env.NETDATA_API_KEY);
    }

    const response = await fetch(url.toString(), {
      headers,
      next: { revalidate: 5 } // Cache for 5 seconds
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw Errors.Unauthorized('Failed to authenticate with Netdata server');
      }
      throw Errors.Internal(`Netdata API responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform the data to match the expected format
    if (!data.labels || !data.data) {
      return NextResponse.json({ data: { result: [] } });
    }

    // Convert the data format to match what the frontend expects
    const result = data.labels.slice(1).map((dimension: string, index: number) => {
      // Skip the first label (time) and map the rest to dimensions
      const values = data.data.map((row: any[]) => ({
        timestamp: row[0],
        value: row[index + 1] // +1 because first column is timestamp
      }));

      return {
        dimension,
        values
      };
    });

    // Filter by dimensions if specified
    const filteredResult = dimensions 
      ? result.filter((item: any) => dimensions.includes(item.dimension))
      : result;

    // Flatten the result for the frontend
    const flatResult = [];
    for (const entry of filteredResult) {
      for (const v of entry.values) {
        flatResult.push({
          dimension: entry.dimension,
          timestamp: v.timestamp,
          value: v.value,
        });
      }
    }

    return NextResponse.json({ data: { result: flatResult } });
  } catch (error) {
    return handleAPIError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    // CSRF validation for POST requests
    const token = request.headers.get('x-csrf-token');
    if (!token) {
      throw Errors.Forbidden('CSRF token missing');
    }
    if (!validateToken(token)) {
      throw Errors.Forbidden('Invalid CSRF token');
    }

    // Rate limiting
    const limiter = rateLimit({
      interval: 60 * 1000,
      uniqueTokenPerInterval: 500
    });
    
    try {
      await limiter.check(5, 'NETDATA_POST');
    } catch {
      throw Errors.TooManyRequests();
    }

    // Handle POST-specific logic here
    const data = await request.json();
    
    return NextResponse.json({ 
      success: true,
      message: 'Netdata configuration updated'
    });
  } catch (error) {
    return handleAPIError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    // CSRF validation for PUT requests
    const token = request.headers.get('x-csrf-token');
    if (!token) {
      throw Errors.Forbidden('CSRF token missing');
    }
    if (!validateToken(token)) {
      throw Errors.Forbidden('Invalid CSRF token');
    }

    // Rate limiting
    const limiter = rateLimit({
      interval: 60 * 1000,
      uniqueTokenPerInterval: 500
    });
    
    try {
      await limiter.check(5, 'NETDATA_PUT');
    } catch {
      throw Errors.TooManyRequests();
    }

    // Handle PUT-specific logic here
    const data = await request.json();
    
    return NextResponse.json({ 
      success: true,
      message: 'Netdata settings updated'
    });
  } catch (error) {
    return handleAPIError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // CSRF validation for DELETE requests
    const token = request.headers.get('x-csrf-token');
    if (!token) {
      throw Errors.Forbidden('CSRF token missing');
    }
    if (!validateToken(token)) {
      throw Errors.Forbidden('Invalid CSRF token');
    }

    // Rate limiting
    const limiter = rateLimit({
      interval: 60 * 1000,
      uniqueTokenPerInterval: 500
    });
    
    try {
      await limiter.check(5, 'NETDATA_DELETE');
    } catch {
      throw Errors.TooManyRequests();
    }

    // Handle DELETE-specific logic here
    
    return NextResponse.json({ 
      success: true,
      message: 'Netdata configuration deleted'
    });
  } catch (error) {
    return handleAPIError(error);
  }
} 