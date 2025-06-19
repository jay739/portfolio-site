export interface Project {
  title: string;
  description: string;
  tags: string[];
  link?: string;
  github?: string;
  demo?: string;
  year?: string | number;
  images?: string[]; // Array of image URLs for gallery/carousel
  techStack?: string[];
  challenges?: string[];
  learnings?: string[];
  featured?: boolean;
} 