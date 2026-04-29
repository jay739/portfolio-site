'use client';

import Link from 'next/link';
import { DynamicIcon } from '@/lib/icons';
import { FaExclamationTriangle } from 'react-icons/fa';

export default function NotFound() {
  return (
    <div className="min-h-screen neural-page-shell flex items-center justify-center p-6">
      <div className="w-full max-w-3xl neural-card neural-glow-border p-6 sm:p-10 text-center">
        <p className="neural-kicker mb-3">Missing Neural Node</p>
        <div className="text-6xl mb-4 neural-float flex justify-center"><FaExclamationTriangle className="text-amber-400" /></div>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-100 mb-2">404: Page Not Found</h1>
        <p className="text-base sm:text-lg text-slate-300 mb-6 max-w-xl mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or may have moved. Use one of the routes below to continue.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
          <Link href="/" className="neural-control-btn-primary inline-flex items-center gap-2 px-5 py-3">
            <DynamicIcon name="home" /> Home
          </Link>
          <Link href="/#dashboard" className="neural-control-btn inline-flex items-center gap-2 px-5 py-3">
            <DynamicIcon name="tachometer-alt" /> Dashboard
          </Link>
          <Link href="/#ai-news" className="neural-control-btn-ghost inline-flex items-center gap-2 px-5 py-3">
            <DynamicIcon name="robot" /> AI News
          </Link>
        </div>
        <button
          onClick={() => window.history.back()}
          className="neural-pill-intro text-sm"
        >
          ← Go Back
        </button>
        <div className="mt-6 text-xs text-slate-400">If this looks incorrect, please contact the site admin.</div>
      </div>
    </div>
  );
} 