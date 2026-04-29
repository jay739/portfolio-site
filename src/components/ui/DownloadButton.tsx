import React from 'react';

interface DownloadButtonProps {
  href: string;
  filename?: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  className?: string;
}

export default function DownloadButton({ 
  href, 
  filename, 
  children, 
  variant = 'primary',
  size = 'md',
  icon,
  className = ''
}: DownloadButtonProps) {
  const baseClasses = "inline-flex items-center font-semibold rounded-lg transition-all duration-200 hover:shadow-lg hover:scale-105";
  
  const variantClasses = {
    primary: "bg-amber-500 hover:bg-amber-400 text-amber-950 shadow-lg shadow-amber-900/30",
    secondary: "bg-slate-700 hover:bg-slate-600 text-slate-100 shadow-lg",
    outline: "bg-transparent border-2 border-amber-500 text-amber-400 hover:bg-amber-500 hover:text-amber-950"
  };
  
  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg"
  };

  const iconSizeClasses = {
    sm: "w-4 h-4 mr-2",
    md: "w-5 h-5 mr-2", 
    lg: "w-6 h-6 mr-2"
  };

  const defaultIcon = (
    <svg className={iconSizeClasses[size]} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );

  return (
    <a 
      href={href}
      download={filename}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      {icon || defaultIcon}
      {children}
    </a>
  );
} 