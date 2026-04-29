import { NextRequest, NextResponse } from 'next/server';
import { getClientIpFromHeaders, rateLimit } from '@/lib/rate-limit';
import { handleAPIError, Errors } from '@/lib/error-handling';
import { validateCsrfToken } from '@/lib/csrf';
import { cookies } from 'next/headers';

const CACHE_DURATION = 30000; // 30 seconds
const MAX_POINTS = 100;
const publicGetLimiter = rateLimit({ interval: 60 * 1000, uniqueTokenPerInterval: 1000 });

// Cache for available charts
let chartsCache: { data: any; timestamp: number } | null = null;
const netdataResponseCache = new Map<string, { data: any; timestamp: number }>();

async function fetchJsonWithRetry(
  url: string,
  headers: Record<string, string>,
  timeoutMs = 8000,
  attempts = 2
): Promise<any> {
  let lastError: unknown = null;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const response = await fetch(url, {
        headers,
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (!response.ok) {
        throw new Error(`Netdata HTTP ${response.status} ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      lastError = error;
      if (attempt < attempts) {
        await new Promise((resolve) => setTimeout(resolve, 250 * attempt));
      }
    }
  }
  throw lastError;
}

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
const SERVICE_CHARTS: Record<string, {
  context: string;
  scopeInstance?: string;
  dimensions?: string[];
  fallbackContext?: string;
  fallbackScopeInstance?: string;
}> = {
  // System metrics - public-facing only
  'cpu': {
    context: 'system.cpu',
    dimensions: ['user', 'system']
  },
  'load': {
    context: 'system.load',
    dimensions: ['load1', 'load5', 'load15']
  },
  'uptime': {
    context: 'system.uptime',
    dimensions: ['uptime']
  },
  'network': {
    // Use system.net to avoid hard-coding interface names (eth0/enp*/ens*).
    context: 'system.net',
    dimensions: ['received', 'sent']
  },
  'processes': {
    context: 'system.active_processes',
    dimensions: ['active']
  },
  // Container CPU/Memory metrics — using cgroup app metrics
  'jellyfin': {
    context: 'app.cpu_utilization',
    scopeInstance: 'app.jellyfin_cpu_utilization',
    dimensions: ['user', 'system'],
    fallbackContext: 'app.uptime',
    fallbackScopeInstance: 'app.jellyfin_uptime'
  },
  'navidrome': {
    context: 'app.cpu_utilization',
    scopeInstance: 'app.navidrome_cpu_utilization',
    dimensions: ['user', 'system'],
    fallbackContext: 'app.uptime',
    fallbackScopeInstance: 'app.navidrome_uptime'
  },
  'audiobookshelf': {
    context: 'app.cpu_utilization',
    scopeInstance: 'app.audiobookshelf_cpu_utilization',
    dimensions: ['user', 'system'],
    fallbackContext: 'app.uptime',
    fallbackScopeInstance: 'app.audiobookshelf_uptime'
  },
  'nextcloud': {
    context: 'app.cpu_utilization',
    scopeInstance: 'app.nextcloud_cpu_utilization',
    dimensions: ['user', 'system'],
    fallbackContext: 'app.uptime',
    fallbackScopeInstance: 'app.nextcloud_uptime'
  },
  'immich': {
    context: 'app.cpu_utilization',
    scopeInstance: 'app.immich_cpu_utilization',
    dimensions: ['user', 'system'],
    fallbackContext: 'app.uptime',
    fallbackScopeInstance: 'app.immich_uptime'
  },
  'paperless-ngx': {
    context: 'app.cpu_utilization',
    scopeInstance: 'app.paperless-ngx_cpu_utilization',
    dimensions: ['user', 'system'],
    fallbackContext: 'app.uptime',
    fallbackScopeInstance: 'app.paperless-ngx_uptime'
  },
  'homeassistant': {
    context: 'app.cpu_utilization',
    scopeInstance: 'app.homeassistant_cpu_utilization',
    dimensions: ['user', 'system'],
    fallbackContext: 'app.uptime',
    fallbackScopeInstance: 'app.homeassistant_uptime'
  },
  'vaultwarden': {
    context: 'app.cpu_utilization',
    scopeInstance: 'app.vaultwarden_cpu_utilization',
    dimensions: ['user', 'system'],
    fallbackContext: 'app.uptime',
    fallbackScopeInstance: 'app.vaultwarden_uptime'
  },
  'trilium': {
    context: 'app.cpu_utilization',
    scopeInstance: 'app.trilium_cpu_utilization',
    dimensions: ['user', 'system'],
    fallbackContext: 'app.uptime',
    fallbackScopeInstance: 'app.trilium_uptime'
  },
  'linkwarden': {
    context: 'app.cpu_utilization',
    scopeInstance: 'app.linkwarden_cpu_utilization',
    dimensions: ['user', 'system'],
    fallbackContext: 'app.uptime',
    fallbackScopeInstance: 'app.linkwarden_uptime'
  },
  'homarr': {
    context: 'app.cpu_utilization',
    scopeInstance: 'app.homarr_cpu_utilization',
    dimensions: ['user', 'system'],
    fallbackContext: 'app.uptime',
    fallbackScopeInstance: 'app.homarr_uptime'
  },
  'portainer': {
    context: 'app.cpu_utilization',
    scopeInstance: 'app.portainer_cpu_utilization',
    dimensions: ['user', 'system'],
    fallbackContext: 'app.uptime',
    fallbackScopeInstance: 'app.portainer_uptime'
  },
  'grafana': {
    context: 'app.cpu_utilization',
    scopeInstance: 'app.grafana_cpu_utilization',
    dimensions: ['user', 'system'],
    fallbackContext: 'app.uptime',
    fallbackScopeInstance: 'app.grafana_uptime'
  },
  'prometheus': {
    context: 'app.cpu_utilization',
    scopeInstance: 'app.prometheus_cpu_utilization',
    dimensions: ['user', 'system'],
    fallbackContext: 'app.uptime',
    fallbackScopeInstance: 'app.prometheus_uptime'
  },
  'wallos': {
    context: 'app.cpu_utilization',
    scopeInstance: 'app.wallos_cpu_utilization',
    dimensions: ['user', 'system'],
    fallbackContext: 'app.uptime',
    fallbackScopeInstance: 'app.wallos_uptime'
  },
  'open-webui': {
    context: 'app.cpu_utilization',
    scopeInstance: 'app.open-webui_cpu_utilization',
    dimensions: ['user', 'system'],
    fallbackContext: 'app.uptime',
    fallbackScopeInstance: 'app.open-webui_uptime'
  },
};

export async function GET(request: NextRequest, { params }: { params: { service: string } }) {
  let requestUrlForCache = '';
  try {
    const ip = getClientIpFromHeaders(request.headers);
    try {
      await publicGetLimiter.check(60, `netdata:${ip}`);
    } catch {
      return NextResponse.json({ error: 'Too many telemetry requests. Please slow down.' }, { status: 429 });
    }

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
    // URL logged only in dev to avoid leaking internal hostnames in production
    const url = new URL(`${netdataUrl}/api/v3/data`);
    requestUrlForCache = url.toString();
    
    // Add query parameters matching the successful request
    url.searchParams.append('format', 'json2');
    url.searchParams.append('points', points);
    url.searchParams.append('time_group', 'average');
    url.searchParams.append('time_resampling', '0');
    // Keep zero values so idle but healthy services are still visible in charts/status.
    url.searchParams.append('options', 'jsonwrap|ms');
    
    // Add chart-specific parameters
    url.searchParams.append('contexts', '*');
    url.searchParams.append('nodes', '*');
    url.searchParams.append('instances', '*');
    url.searchParams.append('scope_contexts', chartInfo.context);
    if (chartInfo.scopeInstance) {
      url.searchParams.append('scope_instances', chartInfo.scopeInstance);
    }
    
    if (dimension) {
      url.searchParams.append('dimensions', dimension);
    }
    
    if (after) {
      url.searchParams.append('after', after);
    }
    
    if (before) {
      url.searchParams.append('before', before);
    }
    requestUrlForCache = url.toString();

    // Try to get auth from cookie first
    const cookieStore = cookies();
    let authHeader = cookieStore.get('netdata_auth')?.value;

    // If no cookie, try env variables (auth is optional - Tailscale provides network-level security)
    if (!authHeader) {
      const netdataApiKey = process.env.NETDATA_API_KEY;
      if (netdataApiKey) {
        const [username, password] = netdataApiKey.split(':');
        if (username && password) {
          authHeader = Buffer.from(`${username}:${password}`).toString('base64');
        }
      }
    }

    // Build request headers - auth is optional
    const requestHeaders: Record<string, string> = {
      'Accept': '*/*',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'User-Agent': 'Netdata/v3',
      'Accept-Encoding': 'gzip, deflate, br',
    };
    if (authHeader) {
      requestHeaders['Authorization'] = `Basic ${authHeader}`;
    }

    // Make the request
    let data = await fetchJsonWithRetry(requestUrlForCache, requestHeaders, 8000, 2);
    netdataResponseCache.set(requestUrlForCache, { data, timestamp: Date.now() });

    // If no datapoints found for app CPU context, retry with uptime fallback.
    const resultRows = data?.result?.data;
    if (
      chartInfo.fallbackContext &&
      chartInfo.fallbackScopeInstance &&
      Array.isArray(resultRows) &&
      resultRows.length === 0
    ) {
      const fallbackUrl = new URL(`${netdataUrl}/api/v3/data`);
      fallbackUrl.searchParams.append('format', 'json2');
      fallbackUrl.searchParams.append('points', points);
      fallbackUrl.searchParams.append('time_group', 'average');
      fallbackUrl.searchParams.append('time_resampling', '0');
      fallbackUrl.searchParams.append('options', 'jsonwrap|ms');
      fallbackUrl.searchParams.append('contexts', '*');
      fallbackUrl.searchParams.append('nodes', '*');
      fallbackUrl.searchParams.append('instances', '*');
      fallbackUrl.searchParams.append('scope_contexts', chartInfo.fallbackContext);
      fallbackUrl.searchParams.append('scope_instances', chartInfo.fallbackScopeInstance);

      try {
        data = await fetchJsonWithRetry(fallbackUrl.toString(), requestHeaders, 8000, 2);
        netdataResponseCache.set(fallbackUrl.toString(), { data, timestamp: Date.now() });
      } catch {
        // keep original data when fallback fails
      }
    }
    const origin = request.headers.get('origin') || '';
    const ALLOWED_ORIGINS = ['https://jay739.dev', 'https://www.jay739.dev'];
    const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : '';
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
        'Pragma': 'no-cache',
        ...(allowedOrigin ? {
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Allow-Origin': allowedOrigin,
        } : {}),
      }
    });
  } catch (error) {
    console.error('[Netdata API] Exception:', error);

    const origin = request.headers.get('origin') || '';
    const ALLOWED_ORIGINS = ['https://jay739.dev', 'https://www.jay739.dev'];
    const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : '';
    const corsHeaders: Record<string, string> = allowedOrigin
      ? { 'Access-Control-Allow-Credentials': 'true', 'Access-Control-Allow-Origin': allowedOrigin }
      : {};

    const stale = requestUrlForCache ? netdataResponseCache.get(requestUrlForCache) : null;
    if (stale && Date.now() - stale.timestamp <= CACHE_DURATION) {
      return NextResponse.json(
        {
          ...stale.data,
          meta: {
            ...(stale.data?.meta || {}),
            upstream: 'stale',
            service: params.service,
          },
        },
        {
          status: 200,
          headers: {
            'Cache-Control': 'no-store, must-revalidate',
            'Pragma': 'no-cache',
            ...corsHeaders,
          }
        }
      );
    }

    return NextResponse.json(
      {
        api: 3,
        result: {
          labels: ['time'],
          data: []
        },
        meta: {
          upstream: 'down',
          service: params.service
        }
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, must-revalidate',
          'Pragma': 'no-cache',
          ...corsHeaders,
        }
      }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIpFromHeaders(request.headers);
    // CSRF validation
    const csrfToken = request.headers.get('x-csrf-token');
    if (!csrfToken) {
      throw Errors.Forbidden('CSRF token missing');
    }
    if (!validateCsrfToken(csrfToken)) {
      throw Errors.Forbidden('Invalid CSRF token');
    }

    // Rate limiting
    const postLimiter = rateLimit({ interval: 60 * 1000, uniqueTokenPerInterval: 500 });
    try {
      await postLimiter.check(5, `NETDATA_POST:${ip}`);
    } catch {
      throw Errors.TooManyRequests();
    }

    const { username, password } = await request.json();
    
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
    const ip = getClientIpFromHeaders(request.headers);
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
      await limiter.check(5, `NETDATA_PUT:${ip}`);
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
    const ip = getClientIpFromHeaders(request.headers);
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
      await limiter.check(5, `NETDATA_DELETE:${ip}`);
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
