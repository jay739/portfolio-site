import type { Project } from '@/types/project';

export const projects: Project[] = [
  {
    title: 'YouTube Data Analytics',
    description: 'Created a GUI-based tool for CSV ingestion and visualization using Python and Tkinter. Automated report generation from Kaggle YouTube dataset with just one click.',
    tags: ['Python', 'Tkinter', 'Data Visualization', 'Automation'],
    github: 'https://github.com/jay739/youtube-analytics',
  },
  {
    title: 'Financial Crisis Analysis Tool',
    description: 'Used FinBERT to analyze sentiment in financial news. Ran Monte Carlo simulations using yfinance to assess investment performance and sector risk.',
    tags: ['FinBERT', 'Monte Carlo', 'Financial Analysis', 'Python'],
    github: 'https://github.com/jay739/financial-analysis',
  },
  {
    title: 'Forest Fire Detection Using SEN2 Imagery',
    description: 'Developed a CNN-based wildfire detection model achieving 91% accuracy and 88% F1-score on unseen satellite imagery (Sentinel-2 + MODIS labels). Processed over 2,400+ multispectral image patches using NDVI and NBR indices.',
    tags: ['CNN', 'Computer Vision', 'Satellite Imagery', 'Deep Learning'],
    github: 'https://github.com/jay739/forest-fire-detection',
  },
  {
    title: 'CAPM-Based Stock Analysis',
    description: 'Conducted multi-metric financial analysis using the Capital Asset Pricing Model (CAPM) for Apple, Microsoft and other stocks. Calculated alpha, beta, and performance ratios like Sharpe and Treynor.',
    tags: ['Financial Analysis', 'CAPM', 'Python', 'Data Analysis'],
    github: 'https://github.com/jay739/capm-analysis',
  },
  {
    title: 'RAG-powered Podcast Generator',
    description: 'Designing an AI-generated podcast engine that converts book PDFs into character-voiced audio. Uses OCR, NLP, character identification, and TTS models for multi-voice narration.',
    tags: ['RAG', 'NLP', 'OCR', 'TTS', 'LangChain', 'Ollama'],
    github: 'https://github.com/jay739/podcast-generator',
  },
  {
    title: 'Home Server Dashboard',
    description: 'A modern, responsive dashboard for managing my home server services. Features include service status monitoring, resource usage tracking, and easy service management.',
    tags: ['Next.js', 'Docker', 'TypeScript', 'Tailwind CSS'],
    demo: 'https://homarr.jay739.dev',
  },
]; 