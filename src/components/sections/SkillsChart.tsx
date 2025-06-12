'use client';

import { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import Chart from 'chart.js/auto';
import { SkillsCard } from './SkillsCard';
import { FaCloud, FaChartBar } from 'react-icons/fa';

const skillCategories = [
  {
    title: 'Frontend Development',
    skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'HTML/CSS', 'Astro', 'Tkinter'],
  },
  {
    title: 'Backend & APIs',
    skills: ['Node.js', 'Python', 'Django', 'Express', 'REST APIs', 'FastAPI'],
  },
  {
    title: 'DevOps & Home Server',
    skills: ['Docker', 'Kubernetes', 'Linux', 'CI/CD', 'Portainer', 'Nginx', 'Uptime Kuma'],
  },
  {
    title: 'AI/ML & Data Science',
    skills: ['TensorFlow', 'PyTorch', 'NLP', 'Computer Vision', 'MLOps', 'Pandas', 'Scikit-learn', 'LangChain'],
  },
  {
    title: 'Cloud & Automation',
    skills: ['AWS', 'GCP', 'GitHub Actions', 'Watchtower', 'Vaultwarden'],
  },
];

const chartData = {
  labels: ['Frontend', 'Backend', 'DevOps', 'AI/ML', 'Cloud', 'Home Server'],
  datasets: [
    {
      label: 'Proficiency',
      data: [90, 85, 90, 80, 80, 95],
      fill: true,
      backgroundColor: 'rgba(59,130,246,0.3)',
      borderColor: 'rgba(59,130,246,1)',
      pointBackgroundColor: 'rgba(59,130,246,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(59,130,246,1)',
    },
  ],
};

export default function SkillsChart() {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !chartRef.current) return;

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // Destroy existing chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Create new chart with theme-aware colors
    const accentColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--accent')
      .trim();
    const accentRGB = accentColor.split(' ').join(',');
    
    const newChartData = {
      ...chartData,
      datasets: [{
        ...chartData.datasets[0],
        backgroundColor: `rgba(${accentRGB}, 0.2)`,
        borderColor: `rgb(${accentRGB})`,
        pointBackgroundColor: `rgb(${accentRGB})`,
        pointHoverBorderColor: `rgb(${accentRGB})`,
      }],
    };

    chartInstance.current = new Chart(ctx, {
      type: 'radar',
      data: newChartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            angleLines: {
              color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            },
            grid: {
              color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            },
            pointLabels: {
              color: theme === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
              font: {
                size: 12,
              },
            },
            ticks: {
              color: theme === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
              backdropColor: 'transparent',
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: true,
            callbacks: {
              label: function(context) {
                const labels = context.chart.data.labels as string[] | undefined;
                const label = labels ? labels[context.dataIndex] : '';
                return `${label}: ${context.formattedValue}`;
              }
            }
          },
        },
        hover: {
          mode: 'nearest',
          intersect: true,
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [mounted, theme]);

  if (!mounted) return null;

  return (
    <section className="relative py-16 bg-background">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-background to-background" />
      </div>
      
      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Technical Skills
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A comprehensive overview of my technical expertise across various domains
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {skillCategories.map((category, index) => (
              <SkillsCard
                key={category.title}
                title={category.title}
                skills={category.skills}
                delay={index * 100}
              />
            ))}
          </div>
          
          <div className="h-[400px] w-full bg-card rounded-lg p-4 shadow-lg">
            <canvas ref={chartRef} />
          </div>
        </div>
      </div>
    </section>
  );
} 