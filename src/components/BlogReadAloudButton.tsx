'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Play, Pause, SkipBack, SkipForward } from 'lucide-react';

interface BlogReadAloudButtonProps {
  title: string;
  excerpt: string;
}

// Utility to remove emojis
function removeEmojis(str: string) {
  // Regex covers most emojis
  return str.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '');
}

// Utility to extract text, skipping code blocks and tables
function extractReadableText(element: Element): string {
  let result = '';
  for (const child of Array.from(element.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE) {
      result += child.textContent;
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      const el = child as HTMLElement;
      if (el.tagName === 'PRE' || el.tagName === 'CODE') {
        result += ' Refer to the code block. ';
      } else if (el.tagName === 'TABLE') {
        result += ' Refer to the table. ';
      } else {
        result += extractReadableText(el);
      }
    }
  }
  return result;
}

export default function BlogReadAloudButton({ title, excerpt }: BlogReadAloudButtonProps) {
  const [isReading, setIsReading] = useState(false);
  const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesis | null>(null);
  const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSpeechSynthesis(window.speechSynthesis);
    }
  }, []);

  // Cleanup: Stop speech when component unmounts or page changes
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (speechSynthesis && isReading) {
        speechSynthesis.cancel();
      }
    };

    const handleVisibilityChange = () => {
      if (speechSynthesis && isReading && document.hidden) {
        speechSynthesis.cancel();
        setIsReading(false);
        setProgress(0);
        setCurrentUtterance(null);
      }
    };

    // Stop speech when navigating away
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup function
    return () => {
      if (speechSynthesis && isReading) {
        speechSynthesis.cancel();
      }
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [speechSynthesis, isReading]);

  const startProgressTracking = (utterance: SpeechSynthesisUtterance) => {
    const startTime = Date.now();
    const estimatedDuration = utterance.text.length * 50; // Rough estimate: 50ms per character
    setDuration(estimatedDuration);

    progressInterval.current = setInterval(() => {
      if (isReading) {
        const elapsed = Date.now() - startTime;
        const newProgress = Math.min((elapsed / estimatedDuration) * 100, 100);
        setProgress(newProgress);
      }
    }, 100);
  };

  const stopProgressTracking = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
    setProgress(0);
    setDuration(0);
  };

  const readAloud = () => {
    if (!speechSynthesis) return;
    
    if (isReading) {
      speechSynthesis.cancel();
      setIsReading(false);
      setCurrentUtterance(null);
      stopProgressTracking();
      return;
    }

    // Extract text content from the article, skipping code blocks/tables and removing emojis
    const articleElement = document.querySelector('.prose');
    if (!articleElement) return;

    let text = `${title}. ${excerpt}. ${extractReadableText(articleElement)}`;
    text = removeEmojis(text);
    const utterance = new SpeechSynthesisUtterance(text);
    
    utterance.onstart = () => {
      setIsReading(true);
      setCurrentUtterance(utterance);
      startProgressTracking(utterance);
    };
    
    utterance.onend = () => {
      setIsReading(false);
      setCurrentUtterance(null);
      stopProgressTracking();
    };
    
    utterance.onerror = () => {
      setIsReading(false);
      setCurrentUtterance(null);
      stopProgressTracking();
    };
    
    speechSynthesis.speak(utterance);
  };

  const skipForward = () => {
    if (speechSynthesis && isReading) {
      speechSynthesis.cancel();
      // Restart with a shorter text (skip first 10 seconds worth)
      const articleElement = document.querySelector('.prose');
      if (articleElement) {
        const text = `${title}. ${excerpt}. ${extractReadableText(articleElement)}`;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.2; // Slightly faster to simulate skipping
        utterance.onstart = () => {
          setIsReading(true);
          setCurrentUtterance(utterance);
          startProgressTracking(utterance);
        };
        utterance.onend = () => {
          setIsReading(false);
          setCurrentUtterance(null);
          stopProgressTracking();
        };
        utterance.onerror = () => {
          setIsReading(false);
          setCurrentUtterance(null);
          stopProgressTracking();
        };
        speechSynthesis.speak(utterance);
      }
    }
  };

  const skipBackward = () => {
    if (speechSynthesis && isReading) {
      speechSynthesis.cancel();
      // Restart with a longer text (go back 10 seconds worth)
      const articleElement = document.querySelector('.prose');
      if (articleElement) {
        const text = `${title}. ${excerpt}. ${extractReadableText(articleElement)}`;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.8; // Slightly slower to simulate going back
        utterance.onstart = () => {
          setIsReading(true);
          setCurrentUtterance(utterance);
          startProgressTracking(utterance);
        };
        utterance.onend = () => {
          setIsReading(false);
          setCurrentUtterance(null);
          stopProgressTracking();
        };
        utterance.onerror = () => {
          setIsReading(false);
          setCurrentUtterance(null);
          stopProgressTracking();
        };
        speechSynthesis.speak(utterance);
      }
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Main control button removed from above, now always in the media player row */}
        <div className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <button
            onClick={skipBackward}
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Skip backward 10 seconds"
          >
          <SkipBack className="w-4 h-4 inline-block mr-1" />
          <span className="text-xs">-10 sec</span>
        </button>
        <button
          onClick={readAloud}
          disabled={!speechSynthesis}
          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={`${isReading ? 'Pause' : 'Play'} reading article aloud`}
        >
          {isReading ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          <span className="text-xs">{isReading ? 'Pause' : 'Play'}</span>
        </button>
        <button
          onClick={skipForward}
          className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label="Skip forward 10 seconds"
        >
          <span className="text-xs">+10 sec</span>
          <SkipForward className="w-4 h-4 inline-block ml-1" />
          </button>
        {/* Animated SVG Wave */}
        <div className="flex items-center h-8 w-16 mx-2">
          <svg viewBox="0 0 60 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={isReading ? 'animate-wave' : 'opacity-40'} style={{ width: '100%', height: '100%' }}>
            <path d="M0 8 Q 7 0, 15 8 T 30 8 T 45 8 T 60 8" stroke="#2563eb" strokeWidth="2" fill="none">
              <animate attributeName="d" dur="1s" repeatCount="indefinite"
                values="M0 8 Q 7 0, 15 8 T 30 8 T 45 8 T 60 8;
                        M0 8 Q 7 16, 15 8 T 30 8 T 45 8 T 60 8;
                        M0 8 Q 7 0, 15 8 T 30 8 T 45 8 T 60 8" />
            </path>
          </svg>
        </div>
          <div className="flex-1 mx-2">
            <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
    </div>
  );
} 