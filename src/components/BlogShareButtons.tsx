'use client';

import React, { useState } from 'react';
import { Twitter, Linkedin, Link as LinkIcon, Check } from 'lucide-react';

interface BlogShareButtonsProps {
  title: string;
  url: string;
}

export default function BlogShareButtons({ title, url }: BlogShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const shareText = encodeURIComponent(`${title} - ${url}`);
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
  const linkedinUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
      <a
        href={twitterUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white transition font-medium text-sm"
        aria-label="Share on Twitter"
      >
        <Twitter className="w-4 h-4" />
        Twitter
      </a>
      <a
        href={linkedinUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white transition font-medium text-sm"
        aria-label="Share on LinkedIn"
      >
        <Linkedin className="w-4 h-4" />
        LinkedIn
      </a>
      <button
        onClick={handleCopy}
        className={`flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white transition font-medium text-sm ${copied ? 'bg-green-200 text-green-800' : ''}`}
        aria-label="Copy link"
      >
        {copied ? <Check className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
        {copied ? 'Copied!' : 'Copy Link'}
      </button>
    </div>
  );
} 