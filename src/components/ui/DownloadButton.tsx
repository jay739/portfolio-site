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
    primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-lg",
    secondary: "bg-gray-600 hover:bg-gray-700 text-white shadow-lg",
    outline: "bg-transparent border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
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