'use client';

import Link from 'next/link';
import { FaHome, FaTachometerAlt, FaRobot } from 'react-icons/fa';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-slate-100 to-cyan-200 dark:from-slate-900 dark:via-slate-800 dark:to-blue-900 p-6">
      <div className="text-7xl mb-4 animate-bounce">🚧</div>
      <h1 className="text-4xl font-bold text-blue-700 dark:text-blue-300 mb-2">404: Page Not Found</h1>
      <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 text-center max-w-xl">
        Oops! The page you&apos;re looking for doesn&apos;t exist or has wandered off into the digital abyss.<br />
        But don&apos;t worry, you can get back on track below!
      </p>
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <Link href="/">
          <span className="inline-flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition">
            <FaHome /> Home
          </span>
        </Link>
        <Link href="/#dashboard">
          <span className="inline-flex items-center gap-2 px-5 py-3 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition">
            <FaTachometerAlt /> Dashboard
          </span>
        </Link>
        <Link href="/#ai-news">
          <span className="inline-flex items-center gap-2 px-5 py-3 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700 transition">
            <FaRobot /> AI News
          </span>
        </Link>
      </div>
      <button
        onClick={() => window.history.back()}
        className="mt-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition"
      >
        ← Go Back
      </button>
      <div className="mt-10 text-sm text-gray-400">If you think this is a mistake, please contact the site admin.</div>
    </div>
  );
} 