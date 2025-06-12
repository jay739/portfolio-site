export interface TimelineItem {
  title: string;
  subtitle?: string;
  date: string;
  icon?: string;
  description: string;
  details?: string[];
}

export const timelineItems: TimelineItem[] = [
  {
    title: 'Graduate Student',
    subtitle: 'University of Maryland, Baltimore County',
    date: 'Aug 2023 - May 2025',
    icon: '🎓',
    description: 'Working on AI/ML research projects focusing on natural language processing and computer vision.',
    details: [
      'Developing and implementing state-of-the-art NLP models',
      'Collaborating with faculty on research papers',
      'Mentoring undergraduate students in AI/ML projects',
      'Contributing to open-source AI projects'
    ]
  },
  {
    title: 'AI/ML Programming Intern',
    subtitle: 'R/SEEK',
    date: 'Jan 2025 - May 2025',
    icon: '💻',
    description: 'Built machine learning models for RC car navigation and automation.',
    details: [
      'Developed computer vision models for autonomous navigation',
      'Integrated ML models with hardware for real-time inference',
      'Optimized model performance for embedded systems',
      'Documented and presented results to stakeholders'
    ]
  },
  {
    title: 'Data Analyst',
    subtitle: 'Tata Consultancy Services (TCS)',
    date: '2021 - 2022',
    icon: '📊',
    description: 'Worked on data analysis, reporting, and automation for enterprise clients.',
    details: [
      'Automated data pipelines and reporting workflows',
      'Built dashboards and visualizations for business insights',
      'Collaborated with cross-functional teams on analytics projects',
      'Maintained data quality and integrity'
    ]
  },
]; 