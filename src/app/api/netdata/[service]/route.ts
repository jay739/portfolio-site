import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';
import { handleAPIError, Errors } from '@/lib/error-handling';
import { validateCsrfToken } from '@/lib/csrf';
import { cookies } from 'next/headers';

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

// Helper function to create basic auth header
function createBasicAuthHeader(username: string, password: string) {
  return 'Basic ' + Buffer.from(username + ':' + password).toString('base64');
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

export async function GET(request: NextRequest, { params }: { params: { service: string } }) {
  try {
    const { service } = params;
    const { searchParams } = new URL(request.url);
    const points = searchParams.get('points') || '1';
    const dimension = searchParams.get('dimension');
    const after = searchParams.get('after');
    const before = searchParams.get('before');

    // Get chart info for the requested service
    const chartInfo = SERVICE_CHARTS[service];
    if (!chartInfo) {
      return NextResponse.json({ error: `Invalid service: ${service}` }, { status: 400 });
    }

    // Build Netdata API URL using v3
    const netdataUrl = process.env.NETDATA_URL || 'https://metrics.jay739.dev';
    const url = new URL(`${netdataUrl}/api/v3/data`);
    
    // Add query parameters matching the successful request
    url.searchParams.append('format', 'json2');
    url.searchParams.append('points', points);
    url.searchParams.append('time_group', 'average');
    url.searchParams.append('time_resampling', '0');
    url.searchParams.append('options', 'jsonwrap|nonzero|ms');
    
    // Add chart-specific parameters
    url.searchParams.append('contexts', '*');
    url.searchParams.append('nodes', '*');
    url.searchParams.append('instances', '*');
    url.searchParams.append('scope_contexts', chartInfo.chart);
    
    if (dimension) {
      url.searchParams.append('dimensions', dimension);
    }
    
    if (after) {
      url.searchParams.append('after', after);
    }
    
    if (before) {
      url.searchParams.append('before', before);
    }

    // Try to get auth from cookie first
    const cookieStore = cookies();
    let authHeader = cookieStore.get('netdata_auth')?.value;

    // If no cookie, try env variables
    if (!authHeader) {
      const netdataApiKey = process.env.NETDATA_API_KEY;
      if (!netdataApiKey) {
        throw Errors.Internal('NETDATA_API_KEY not set');
      }
      const [username, password] = netdataApiKey.split(':');
      if (!username || !password) {
        throw Errors.Internal('Invalid NETDATA_API_KEY format. Expected "username:password"');
      }
      authHeader = Buffer.from(`${username}:${password}`).toString('base64');
    }

    // Log request details (without sensitive info)
    console.log('Netdata Request:', {
      url: url.toString(),
      service,
      chart: chartInfo.chart,
      points,
      dimension,
      hasAuth: !!authHeader,
      cookies: request.cookies.getAll().map(c => c.name)
    });

    // Make the request with exact headers from browser
    const response = await fetch(url.toString(), {
      headers: {
        'Accept': '*/*',
        'Authorization': `Basic ${authHeader}`,
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'User-Agent': 'Netdata/v3',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cookie': request.headers.get('cookie') || ''
      },
      credentials: 'include'
    });

    // Log response details
    console.log('Netdata Response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Authentication failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });

      // If auth failed and we were using cookie, try env variables
      if (response.status === 401 && cookieStore.get('netdata_auth')) {
        cookieStore.delete('netdata_auth');
        const netdataApiKey = process.env.NETDATA_API_KEY;
        if (netdataApiKey) {
          const [username, password] = netdataApiKey.split(':');
          if (username && password) {
            const retryAuth = Buffer.from(`${username}:${password}`).toString('base64');
            const retryResponse = await fetch(url.toString(), {
            headers: {
              'Accept': '*/*',
              'Authorization': `Basic ${retryAuth}`,
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache',
              'User-Agent': 'Netdata/v3',
              'Accept-Encoding': 'gzip, deflate, br'
            }
          });

          if (retryResponse.ok) {
            const data = await retryResponse.json();
            return NextResponse.json(data, {
              headers: {
                'Cache-Control': 'no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Access-Control-Allow-Credentials': 'true',
                'Access-Control-Allow-Origin': '*'
              }
            });
          }
        }
      }
    }

      throw Errors.Internal(`Failed to authenticate with Netdata: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    return handleAPIError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get credentials from request body
    const { username, password } = await request.json();
    
    // Create auth header
    const basicAuth = Buffer.from(`${username}:${password}`).toString('base64');
    
    // Test credentials against Netdata
    const netdataUrl = process.env.NETDATA_URL || 'https://metrics.jay739.dev';
    const testUrl = new URL(`${netdataUrl}/api/v3/info`);
    const response = await fetch(testUrl.toString(), {
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Accept': '*/*'
      }
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // If successful, set a session cookie
    const cookieStore = cookies();
    cookieStore.set('netdata_auth', basicAuth, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 // 24 hours
    });

    return NextResponse.json({ success: true });
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
    if (!validateCsrfToken(token)) {
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
    if (!validateCsrfToken(token)) {
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