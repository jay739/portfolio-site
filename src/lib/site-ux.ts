export interface RecentViewItem {
  id: string;
  title: string;
  href: string;
  kind: 'project' | 'blog' | 'gallery' | 'tool' | 'page';
  description?: string;
  timestamp: number;
}

export const RECENT_VIEWS_KEY = 'site_recent_views_v1';
export const BLOG_BOOKMARKS_KEY = 'blog_post_bookmarks_v1';
export const BLOG_HISTORY_KEY = 'blog_post_history_v1';
export const LAST_UPDATES_SEEN_KEY = 'site_updates_seen_at_v1';
export const AMBIENT_MODE_KEY = 'site_ambient_mode_v1';
export const UX_FEEDBACK_EVENT = 'site-ux:feedback';
export const BLOG_BOOKMARKS_EVENT = 'site-ux:blog-bookmarks';
export const BLOG_HISTORY_EVENT = 'site-ux:blog-history';

function safeJsonParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function getRecentViews(): RecentViewItem[] {
  if (typeof window === 'undefined') return [];
  return safeJsonParse<RecentViewItem[]>(window.localStorage.getItem(RECENT_VIEWS_KEY), []);
}

export function recordRecentView(item: Omit<RecentViewItem, 'timestamp'>) {
  if (typeof window === 'undefined') return;
  const existing = getRecentViews();
  const next: RecentViewItem[] = [
    { ...item, timestamp: Date.now() },
    ...existing.filter((entry) => entry.id !== item.id),
  ].slice(0, 8);
  window.localStorage.setItem(RECENT_VIEWS_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent('site-ux:recent-views'));
}

export function getAmbientMode(): boolean {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(AMBIENT_MODE_KEY) === '1';
}

export function setAmbientMode(enabled: boolean) {
  if (typeof window === 'undefined') return;
  if (enabled) {
    window.localStorage.setItem(AMBIENT_MODE_KEY, '1');
  } else {
    window.localStorage.removeItem(AMBIENT_MODE_KEY);
  }
  document.documentElement.dataset.ambient = enabled ? 'true' : 'false';
  window.dispatchEvent(new CustomEvent('site-ux:ambient-mode'));
}

export function getSeenUpdatesTimestamp(): number {
  if (typeof window === 'undefined') return 0;
  return Number(window.localStorage.getItem(LAST_UPDATES_SEEN_KEY) || '0');
}

export function markUpdatesSeen(timestamp: number) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LAST_UPDATES_SEEN_KEY, String(timestamp));
  window.dispatchEvent(new CustomEvent('site-ux:updates-seen'));
}

export function getBlogBookmarks(): string[] {
  if (typeof window === 'undefined') return [];
  return safeJsonParse<string[]>(window.localStorage.getItem(BLOG_BOOKMARKS_KEY), []);
}

export function setBlogBookmarks(bookmarks: string[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(BLOG_BOOKMARKS_KEY, JSON.stringify(bookmarks.slice(0, 20)));
  window.dispatchEvent(new CustomEvent(BLOG_BOOKMARKS_EVENT, { detail: bookmarks.slice(0, 20) }));
}

export interface BlogHistoryEntry {
  slug: string;
  title: string;
  visitedAt: number;
}

export function getBlogHistory(): BlogHistoryEntry[] {
  if (typeof window === 'undefined') return [];
  return safeJsonParse<BlogHistoryEntry[]>(window.localStorage.getItem(BLOG_HISTORY_KEY), []);
}

export function recordBlogHistory(entry: BlogHistoryEntry) {
  if (typeof window === 'undefined') return;
  const existing = getBlogHistory();
  const next = [entry, ...existing.filter((item) => item.slug !== entry.slug)].slice(0, 8);
  window.localStorage.setItem(BLOG_HISTORY_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(BLOG_HISTORY_EVENT, { detail: next }));
}

export type SiteFeedbackType = 'success' | 'info' | 'error';

export function pushSiteFeedback(message: string, type: SiteFeedbackType = 'info') {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent(UX_FEEDBACK_EVENT, {
      detail: {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        message,
        type,
      },
    })
  );
}
