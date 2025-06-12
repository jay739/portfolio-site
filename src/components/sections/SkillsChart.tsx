'use client';

import { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import Chart from 'chart.js/auto';
import { SkillsCard } from './SkillsCard';

const skillCategories = [
  {
    title: 'Frontend Development',
    skills: [
      { name: 'React', url: 'https://reactjs.org/' },
      { name: 'Next.js', url: 'https://nextjs.org/' },
      { name: 'TypeScript', url: 'https://www.typescriptlang.org/' },
      { name: 'Tailwind CSS', url: 'https://tailwindcss.com/' },
      { name: 'HTML/CSS', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML' },
      { name: 'Astro', url: 'https://astro.build/' },
      { name: 'Tkinter', url: 'https://docs.python.org/3/library/tkinter.html' }
    ],
  },
  {
    title: 'Backend & APIs',
    skills: [
      { name: 'Node.js', url: 'https://nodejs.org/' },
      { name: 'Python', url: 'https://www.python.org/' },
      { name: 'Django', url: 'https://www.djangoproject.com/' },
      { name: 'Express', url: 'https://expressjs.com/' },
      { name: 'REST APIs', url: 'https://en.wikipedia.org/wiki/Representational_state_transfer' },
      { name: 'FastAPI', url: 'https://fastapi.tiangolo.com/' }
    ],
  },
  {
    title: 'DevOps & Home Server',
    skills: [
      { name: 'Docker', url: 'https://www.docker.com/' },
      { name: 'Kubernetes', url: 'https://kubernetes.io/' },
      { name: 'Linux', url: 'https://www.linux.org/' },
      { name: 'CI/CD', url: 'https://en.wikipedia.org/wiki/CI/CD' },
      { name: 'Portainer', url: 'https://www.portainer.io/' },
      { name: 'Nginx', url: 'https://nginx.org/' },
      { name: 'Uptime Kuma', url: 'https://github.com/louislam/uptime-kuma' }
    ],
  },
  {
    title: 'AI/ML & Data Science',
    skills: [
      { name: 'TensorFlow', url: 'https://www.tensorflow.org/' },
      { name: 'PyTorch', url: 'https://pytorch.org/' },
      { name: 'NLP', url: 'https://en.wikipedia.org/wiki/Natural_language_processing' },
      { name: 'Computer Vision', url: 'https://en.wikipedia.org/wiki/Computer_vision' },
      { name: 'MLOps', url: 'https://en.wikipedia.org/wiki/MLOps' },
      { name: 'Pandas', url: 'https://pandas.pydata.org/' },
      { name: 'Scikit-learn', url: 'https://scikit-learn.org/' },
      { name: 'LangChain', url: 'https://www.langchain.com/' }
    ],
  },
  {
    title: 'Cloud & Automation',
    skills: [
      { name: 'AWS', url: 'https://aws.amazon.com/' },
      { name: 'GCP', url: 'https://cloud.google.com/' },
      { name: 'GitHub Actions', url: 'https://github.com/features/actions' },
      { name: 'Watchtower', url: 'https://containrrr.dev/watchtower/' },
      { name: 'Vaultwarden', url: 'https://github.com/dani-garcia/vaultwarden' }
    ],
  },
  {
    title: 'Android & Embedded',
    skills: [
      { name: 'Android ROM', url: 'https://source.android.com/' },
      { name: 'Custom Kernels', url: 'https://kernel.org/' },
      { name: 'LineageOS', url: 'https://lineageos.org/' },
      { name: 'AOSP', url: 'https://source.android.com/' },
      { name: 'Embedded Systems', url: 'https://en.wikipedia.org/wiki/Embedded_system' },
      { name: 'Device Trees', url: 'https://www.devicetree.org/' }
    ],
  },
];

const chartData = {
  labels: ['Frontend', 'Backend', 'DevOps', 'AI/ML', 'Cloud', 'Android/Embedded'],
  datasets: [
    {
      label: 'Proficiency',
      data: [90, 85, 90, 80, 80, 85],
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
    <section className="relative py-16 px-2 sm:px-6 w-full overflow-hidden">
      <div className="w-full relative">
        {/* Animated background behind the container, like Projects */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-background to-background" />
        </div>
        <div className="relative w-full bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-4 sm:p-8">
          <div className="flex items-center gap-2 mb-8">
            <span className="text-2xl">⚡</span>
            <h2 className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              Technical Skills
            </h2>
          </div>
          <p className="text-gray-700 dark:text-gray-300 max-w-2xl mb-8">
            A comprehensive overview of my technical expertise across various domains
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center min-h-[420px]">
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
            <div className="flex items-center justify-center min-h-[320px] min-w-[220px] w-full">
              <div className="w-full max-w-[400px] min-w-[220px] min-h-[320px] h-[400px] bg-white dark:bg-slate-700 rounded-2xl p-4 shadow-lg border border-blue-600/30 hover:shadow-2xl hover:border-blue-600 transition-all duration-300 flex items-center justify-center">
                {mounted ? (
                  <canvas ref={chartRef} className="w-full h-full cursor-pointer" />
                ) : (
                  <span className="text-gray-400 text-center w-full">Loading chart...</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 