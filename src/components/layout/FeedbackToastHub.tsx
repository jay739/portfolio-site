'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { UX_FEEDBACK_EVENT, type SiteFeedbackType } from '@/lib/site-ux';

type ToastItem = {
  id: string;
  message: string;
  type: SiteFeedbackType;
};

const iconMap = {
  success: CheckCircle2,
  info: Info,
  error: AlertCircle,
} satisfies Record<SiteFeedbackType, typeof Info>;

const toneMap = {
  success: 'border-emerald-400/35 bg-emerald-500/10 text-emerald-100',
  info: 'border-sky-400/35 bg-sky-500/10 text-sky-100',
  error: 'border-rose-400/35 bg-rose-500/10 text-rose-100',
} satisfies Record<SiteFeedbackType, string>;

export default function FeedbackToastHub() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    const onFeedback = (event: Event) => {
      const detail = (event as CustomEvent<ToastItem>).detail;
      if (!detail?.message) return;
      setItems((current) => [...current, detail].slice(-4));
      window.setTimeout(() => {
        setItems((current) => current.filter((item) => item.id !== detail.id));
      }, 2600);
    };

    window.addEventListener(UX_FEEDBACK_EVENT, onFeedback as EventListener);
    return () => window.removeEventListener(UX_FEEDBACK_EVENT, onFeedback as EventListener);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-24 z-[420] flex justify-center px-3 sm:justify-end sm:px-6">
      <div className="w-full max-w-sm space-y-2">
        <AnimatePresence>
          {items.map((item) => {
            const Icon = iconMap[item.type];
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className={`pointer-events-auto rounded-2xl border px-4 py-3 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md ${toneMap[item.type]}`}
              >
                <div className="flex items-start gap-3">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0" />
                  <p className="text-sm font-medium">{item.message}</p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
