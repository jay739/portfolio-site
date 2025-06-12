// Unified Netdata fetch helper
// This ensures all Netdata fetches go through our API routes and maintains consistent error handling

interface NetdataFetchOptions {
  service: string;
  points?: number;
  after?: string;
  dimension?: string;
}

interface NetdataResponse {
  data: {
    result: Array<{
      dimension: string;
      timestamp: number;
      value: number;
    }>;
  };
}

/**
 * Unified helper to fetch Netdata metrics through our API routes
 * @param options Fetch options including service name and optional parameters
 * @returns Promise with the fetched data or empty array on error
 */
export async function fetchNetdata({ 
  service, 
  points = 1, 
  after = '-600',
  dimension 
}: NetdataFetchOptions): Promise<NetdataResponse['data']['result']> {
  try {
    const url = new URL('/api/netdata/' + service, window.location.origin);
    url.searchParams.set('points', points.toString());
    url.searchParams.set('after', after);

    const res = await fetch(url.toString(), {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 5 } // Cache for 5 seconds
    });

    if (!res.ok) {
      console.error(`Netdata API error for service ${service}:`, res.status, res.statusText);
      return [];
    }

    const json = await res.json();
    const { data } = json;
    
    if (!data?.result) return [];

    // Filter by dimension if specified
    return dimension 
      ? data.result.filter(entry => entry.dimension === dimension)
      : data.result;

  } catch (error) {
    console.error('Failed to fetch Netdata metrics:', service, error);
    return [];
  }
}

/**
 * Helper to fetch Netdata chart data with timestamps formatted for display
 */
export async function fetchNetdataChart(options: NetdataFetchOptions) {
  const data = await fetchNetdata(options);
  return data.map(entry => ({
    timestamp: new Date(entry.timestamp * 1000).toLocaleTimeString(),
    value: entry.value,
  }));
} 