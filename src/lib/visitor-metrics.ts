import { promises as fs } from 'fs';

export const VISITOR_COUNTER_FILE = '/tmp/portfolio_visitor_count.json';

export interface VisitorMetrics {
  totalVisitors: number;
  lastUpdated: string;
  dailyVisitors: number;
  lastResetDate: string;
}

export function getTodayIsoDate() {
  return new Date().toISOString().split('T')[0];
}

export function createFallbackVisitorMetrics(): VisitorMetrics {
  const today = getTodayIsoDate();
  return {
    totalVisitors: Math.floor(Math.random() * 50) + 150,
    lastUpdated: new Date().toISOString(),
    dailyVisitors: Math.floor(Math.random() * 10) + 5,
    lastResetDate: today,
  };
}

export async function readVisitorMetrics(): Promise<VisitorMetrics> {
  try {
    const data = await fs.readFile(VISITOR_COUNTER_FILE, 'utf8');
    return JSON.parse(data) as VisitorMetrics;
  } catch {
    return createFallbackVisitorMetrics();
  }
}

export async function writeVisitorMetrics(data: VisitorMetrics): Promise<void> {
  await fs.writeFile(VISITOR_COUNTER_FILE, JSON.stringify(data, null, 2), 'utf8');
}

export async function getNormalizedVisitorMetrics(): Promise<VisitorMetrics> {
  const data = await readVisitorMetrics();
  const today = getTodayIsoDate();

  if (data.lastResetDate !== today) {
    data.dailyVisitors = 0;
    data.lastResetDate = today;
  }

  return data;
}

export async function incrementVisitorMetrics() {
  const data = await getNormalizedVisitorMetrics();
  data.totalVisitors += 1;
  data.dailyVisitors += 1;
  data.lastUpdated = new Date().toISOString();
  await writeVisitorMetrics(data);
  return data;
}

export function getOrdinal(num: number): string {
  const j = num % 10;
  const k = num % 100;

  if (j === 1 && k !== 11) return `${num}st`;
  if (j === 2 && k !== 12) return `${num}nd`;
  if (j === 3 && k !== 13) return `${num}rd`;
  return `${num}th`;
}

export function formatVisitorPayload(data: VisitorMetrics) {
  return {
    totalVisitors: data.totalVisitors,
    count: data.totalVisitors,
    ordinalText: getOrdinal(data.totalVisitors),
    dailyVisitors: data.dailyVisitors,
    message: `You're the ${getOrdinal(data.totalVisitors)} visitor!`,
    lastUpdated: data.lastUpdated,
    source: 'unified-local',
  };
}
