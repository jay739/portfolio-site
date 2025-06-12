'use client';

// Date formatting
export const formatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC',
});

export const getFormattedDate = (date: Date): string => (date ? formatter.format(date) : '');

// String manipulation
export const trim = (str = '', ch?: string) => {
  let start = 0,
    end = str.length || 0;
  while (start < end && str[start] === ch) ++start;
  while (end > start && str[end - 1] === ch) --end;
  return start > 0 || end < str.length ? str.substring(start, end) : str;
};

// Number formatting
export const toUiAmount = (amount: number) => {
  if (!amount) return '0';

  let value: string;

  if (amount >= 1000000000) {
    const formattedNumber = (amount / 1000000000).toFixed(1);
    value = Number(formattedNumber) === parseInt(formattedNumber) 
      ? `${parseInt(formattedNumber)}B` 
      : `${formattedNumber}B`;
  } else if (amount >= 1000000) {
    const formattedNumber = (amount / 1000000).toFixed(1);
    value = Number(formattedNumber) === parseInt(formattedNumber)
      ? `${parseInt(formattedNumber)}M`
      : `${formattedNumber}M`;
  } else if (amount >= 1000) {
    const formattedNumber = (amount / 1000).toFixed(1);
    value = Number(formattedNumber) === parseInt(formattedNumber)
      ? `${parseInt(formattedNumber)}K`
      : `${formattedNumber}K`;
  } else {
    value = Number(amount).toFixed(0);
  }

  return value;
};

// Time formatting
export const formatTime = (timestamp: number) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Greeting based on time of day
export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "☀️ Good Morning!";
  if (hour < 18) return "🌤️ Good Afternoon!";
  return "🌙 Good Evening!";
};

// Chart utilities
export const getChartColors = (theme: 'light' | 'dark') => {
  if (theme === 'dark') {
    return {
      background: [
        'rgba(59,130,246,0.7)', // blue
        'rgba(34,197,94,0.7)',  // green
        'rgba(251,191,36,0.7)', // yellow
        'rgba(139,92,246,0.7)', // purple
        'rgba(244,63,94,0.7)'   // red
      ],
      border: [
        'rgba(59,130,246,1)',
        'rgba(34,197,94,1)',
        'rgba(251,191,36,1)',
        'rgba(139,92,246,1)',
        'rgba(244,63,94,1)'
      ],
      text: '#e5e7eb',
      grid: 'rgba(255,255,255,0.08)'
    };
  }
  
  return {
    background: [
      'rgba(37,99,235,0.7)',
      'rgba(22,163,74,0.7)',
      'rgba(202,138,4,0.7)',
      'rgba(168,85,247,0.7)',
      'rgba(239,68,68,0.7)'
    ],
    border: [
      'rgba(37,99,235,1)',
      'rgba(22,163,74,1)',
      'rgba(202,138,4,1)',
      'rgba(168,85,247,1)',
      'rgba(239,68,68,1)'
    ],
    text: '#1e293b',
    grid: 'rgba(0,0,0,0.08)'
  };
};

// Class name utilities
export const cn = (...classes: (string | undefined | null | false)[]) => {
  return classes.filter(Boolean).join(' ');
};

// Theme utilities
export const isDarkMode = () => {
  if (typeof window === 'undefined') return false;
  return document.documentElement.classList.contains('dark');
};

// Animation utilities
export const getAnimationDelay = (index: number, baseDelay = 100) => {
  return `${index * baseDelay}ms`;
}; 