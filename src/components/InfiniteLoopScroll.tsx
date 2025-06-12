'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';

const InfiniteLoopScroll: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const topCanvasRef = useRef<HTMLCanvasElement>(null);
  const bottomCanvasRef = useRef<HTMLCanvasElement>(null);
  const leftCanvasRef = useRef<HTMLCanvasElement>(null);
  const rightCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle scroll progress
  useEffect(() => {
    if (!mounted) return;

    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollTop / docHeight;
      setScrollProgress(Math.max(0, Math.min(1, progress)));
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial call

    return () => window.removeEventListener('scroll', handleScroll);
  }, [mounted]);

  // Animation loop
  useEffect(() => {
    if (!mounted) return;

    let time = 0;
    const animate = () => {
      time += 0.02;
      
      // Draw all loops
      if (topCanvasRef.current) {
        drawInfiniteLoop(topCanvasRef.current, time, 'top');
      }
      
      if (bottomCanvasRef.current) {
        drawInfiniteLoop(bottomCanvasRef.current, time, 'bottom');
      }

      if (leftCanvasRef.current) {
        drawInfiniteLoop(leftCanvasRef.current, time, 'left');
      }

      if (rightCanvasRef.current) {
        drawInfiniteLoop(rightCanvasRef.current, time, 'right');
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [mounted, resolvedTheme]);

  const drawInfiniteLoop = (canvas: HTMLCanvasElement, time: number, position: 'top' | 'bottom' | 'left' | 'right') => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Set colors based on theme
    const isDark = resolvedTheme === 'dark';
    const primaryColor = isDark ? 'rgba(59, 130, 246, 0.6)' : 'rgba(37, 99, 235, 0.6)';
    const secondaryColor = isDark ? 'rgba(147, 51, 234, 0.4)' : 'rgba(124, 58, 237, 0.4)';

    // Calculate loop parameters based on position
    const isVertical = position === 'left' || position === 'right';
    const mainDimension = isVertical ? height : width;
    const crossDimension = isVertical ? width : height;
    
    const center = crossDimension / 2;
    const amplitude = crossDimension * 0.3;
    const frequency = 0.02;
    const speed = (position === 'top' || position === 'left') ? time : -time;

    // Draw infinite loop effect
    ctx.beginPath();
    
    // Create the infinity symbol path
    for (let i = 0; i < mainDimension; i += 2) {
      const t = (i * frequency) + speed;
      
      // Infinity symbol equation: y = amplitude * sin(2t) / (1 + cos(t)^2)
      const cosT = Math.cos(t);
      const denominator = 1 + (cosT * cosT);
      
      let cross1 = center + (amplitude * Math.sin(2 * t)) / denominator;
      let cross2 = center - (amplitude * Math.sin(2 * t)) / denominator;
      
      // Add some wave effect
      cross1 += Math.sin(i * 0.01 + time * 2) * 10;
      
      let x, y;
      if (isVertical) {
        // For left and right sides
        x = cross1;
        y = i;
      } else {
        // For top and bottom
        x = i;
        y = cross1;
      }

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    // Style the path
    ctx.strokeStyle = primaryColor;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Add glow effect
    ctx.shadowColor = primaryColor;
    ctx.shadowBlur = 15;
    ctx.stroke();

    // Draw second loop with offset
    ctx.beginPath();
    for (let i = 0; i < mainDimension; i += 2) {
      const t = (i * frequency) + speed + Math.PI;
      const cosT = Math.cos(t);
      const denominator = 1 + (cosT * cosT);
      
      let cross = center + (amplitude * 0.7 * Math.sin(2 * t)) / denominator;
      cross += Math.sin(i * 0.008 + time * 1.5) * 8;

      let x, y;
      if (isVertical) {
        x = cross;
        y = i;
      } else {
        x = i;
        y = cross;
      }

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.strokeStyle = secondaryColor;
    ctx.lineWidth = 2;
    ctx.shadowColor = secondaryColor;
    ctx.shadowBlur = 10;
    ctx.stroke();

    // Reset shadow
    ctx.shadowBlur = 0;
  };

  // Handle canvas resize
  const handleCanvasResize = (canvas: HTMLCanvasElement | null) => {
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
  };

  useEffect(() => {
    if (!mounted) return;

    const handleResize = () => {
      handleCanvasResize(topCanvasRef.current);
      handleCanvasResize(bottomCanvasRef.current);
      handleCanvasResize(leftCanvasRef.current);
      handleCanvasResize(rightCanvasRef.current);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, [mounted]);

  if (!mounted) return null;

  // Calculate opacity based on scroll position
  const topOpacity = scrollProgress < 0.1 ? 1 - (scrollProgress * 10) : 0;
  const bottomOpacity = scrollProgress > 0.9 ? (scrollProgress - 0.9) * 10 : 0;
  
  // For side animations, make them always visible with full opacity
  const sideOpacity = 1;

  return (
    <>
      {/* Top infinite loop */}
      <div 
        className="fixed top-0 left-0 w-full pointer-events-none z-30"
        style={{ 
          opacity: topOpacity,
          transition: 'opacity 0.3s ease'
        }}
      >
        <canvas
          ref={topCanvasRef}
          className="w-full h-24"
          style={{
            background: 'transparent',
            mixBlendMode: 'screen'
          }}
        />
      </div>

      {/* Bottom infinite loop */}
      <div 
        className="fixed bottom-0 left-0 w-full pointer-events-none z-30"
        style={{ 
          opacity: bottomOpacity,
          transition: 'opacity 0.3s ease'
        }}
      >
        <canvas
          ref={bottomCanvasRef}
          className="w-full h-24"
          style={{
            background: 'transparent',
            mixBlendMode: 'screen'
          }}
        />
      </div>

      {/* Left infinite loop */}
      <div 
        className="fixed top-0 left-0 h-full pointer-events-none z-30"
        style={{ 
          opacity: sideOpacity,
          transition: 'opacity 0.3s ease'
        }}
      >
        <canvas
          ref={leftCanvasRef}
          className="w-24 h-full"
          style={{
            background: 'transparent',
            mixBlendMode: 'screen'
          }}
        />
      </div>

      {/* Right infinite loop */}
      <div 
        className="fixed top-0 right-0 h-full pointer-events-none z-30"
        style={{ 
          opacity: sideOpacity,
          transition: 'opacity 0.3s ease'
        }}
      >
        <canvas
          ref={rightCanvasRef}
          className="w-24 h-full"
          style={{
            background: 'transparent',
            mixBlendMode: 'screen'
          }}
        />
      </div>
    </>
  );
};

export default InfiniteLoopScroll; 