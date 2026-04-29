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
    title: 'Data Scientist — GenAI & ML',
    subtitle: 'Enigma Technologies',
    date: 'Jun 2025 - Present',
    icon: 'robot',
    description: 'Design and deploy production RAG pipelines and LLM fine-tuning workflows to automate large-scale document classification and entity extraction.',
    details: [
      'Reduced analyst review time by 30%+ through GenAI & RAG automation',
      'Built multi-step LLM-based document intelligence pipelines using LangChain and LangGraph',
      'Improved scoring precision by 20% through regression, classification, and clustering models on 10M+ records',
      'Applied cross-validation, hyperparameter tuning (Optuna), and SHAP-based feature importance analysis',
      'Delivered cloud-native ML platforms on AWS using Docker, Kubernetes, GitHub Actions CI/CD, and MLflow',
      'Presented SHAP-based model explanations to non-technical stakeholders for informed decision-making'
    ]
  },
  {
    title: 'AI/ML Programming Intern',
    subtitle: 'R/SEEK — UMBC',
    date: 'Jan 2025 - Jun 2025',
    icon: 'laptop-code',
    description: 'Developed real-time object recognition and motion tracking for autonomous RC car navigation.',
    details: [
      'Achieved 95% detection accuracy using YOLOv8 across dynamic test environments',
      'Optimized and deployed TensorFlow Lite models on ESP32 microcontrollers',
      'Implemented Aruco marker-based positioning for real-time autonomous navigation',
      'Delivered edge AI solution with no cloud dependency'
    ]
  },
  {
    title: 'M.S. Data Science — Graduate',
    subtitle: 'University of Maryland, Baltimore County (UMBC)',
    date: 'Aug 2023 - Jun 2025',
    icon: 'graduation-cap',
    description: 'Master of Professional Studies in Data Science (GPA 3.91/4.0). Focused on machine learning, NLP, GenAI, and cloud-native AI systems.',
    details: [
      'Capstone: RAG-powered Podcast Generator — PDF → LLM → TTS pipeline achieving 98% OCR accuracy',
      'Wildfire Detection project: AllCNN on Sentinel-2 satellite imagery, 91% accuracy and 88% F1-score',
      'Financial Risk Suite: FinBERT classifier (87% accuracy) + 1,000+ Monte Carlo simulations for VaR',
      'AI/ML Programming Intern at R/SEEK: YOLOv8 object detection (95% accuracy) on autonomous RC car',
      'Coursework: Machine Learning, Practical Deep Learning, Big Data Processing, Ethical Issues in Data Science'
    ]
  },
  {
    title: 'Machine Learning Engineer',
    subtitle: 'Cognizant',
    date: 'Jun 2019 - Jul 2023',
    icon: 'wrench',
    description: 'Delivered production NLP pipelines for contract and document intelligence — context extraction, semantic search, and text classification across 10M+ records.',
    details: [
      'Reduced manual legal and compliance review effort by 35% while meeting SLA targets',
      'Designed end-to-end ML pipelines with Python, SQL, Scikit-learn, PySpark, TensorFlow, and PyTorch',
      'Reduced inference latency from 450ms to under 90ms through batching and model optimization',
      'Implemented enterprise MLOps with Jenkins CI/CD, cutting model release cycles by 30%',
      'Engineered low-latency inference services on AWS Lambda and SageMaker, reducing p99 latency by 40%',
      'Optimized fault-tolerant PySpark workflows processing 1M+ text records/day'
    ]
  },
  {
    title: 'Software Engineering Intern',
    subtitle: 'Infosys',
    date: 'Jan 2019 - May 2019',
    icon: 'briefcase',
    description: 'Built full-stack applications and applied data analysis to evaluate user interaction patterns.',
    details: [
      'Developed real-time movie database application using Node.js and MongoDB',
      'Applied data analysis to evaluate user interaction patterns and rating trends',
      'Surfaced actionable engagement insights for product improvements'
    ]
  },
]; 