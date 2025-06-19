'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Play, Pause, SkipBack, SkipForward } from 'lucide-react';

interface BlogReadAloudButtonProps {
  title: string;
  excerpt: string;
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

    // Extract text content from the article
    const articleElement = document.querySelector('.prose');
    if (!articleElement) return;

    const text = `${title}. ${excerpt}. ${articleElement.textContent}`;
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
        const text = `${title}. ${excerpt}. ${articleElement.textContent}`;
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
        const text = `${title}. ${excerpt}. ${articleElement.textContent}`;
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
      {/* Main control button */}
      <button
        onClick={readAloud}
        disabled={!speechSynthesis}
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label={`${isReading ? 'Stop' : 'Start'} reading article aloud`}
      >
        {isReading ? (
          <>
            <Pause className="w-4 h-4" />
            <span>Pause</span>
          </>
        ) : (
          <>
            <Play className="w-4 h-4" />
            <span>Read Aloud</span>
          </>
        )}
      </button>

      {/* Media player controls */}
      {isReading && (
        <div className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <button
            onClick={skipBackward}
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Skip backward 10 seconds"
          >
            <SkipBack className="w-4 h-4" />
          </button>
          
          <div className="flex-1 mx-2">
            <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          
          <button
            onClick={skipForward}
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Skip forward 10 seconds"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
} 