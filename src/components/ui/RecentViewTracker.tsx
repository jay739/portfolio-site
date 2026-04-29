'use client';

import { useEffect } from 'react';
import { recordRecentView, type RecentViewItem } from '@/lib/site-ux';

export default function RecentViewTracker({ item }: { item: Omit<RecentViewItem, 'timestamp'> }) {
  useEffect(() => {
    recordRecentView(item);
  }, [item]);

  return null;
}
