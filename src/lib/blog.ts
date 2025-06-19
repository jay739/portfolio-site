import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import readingTime from 'reading-time';

const contentDirectory = path.join(process.cwd(), 'content/blog');

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  tags: string[];
  featured?: boolean;
  content: string;
  readingTime: string;
}

export interface BlogPostMeta {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  tags: string[];
  featured?: boolean;
  readingTime: string;
}

export function getBlogPosts(): BlogPost[] {
  const fileNames = fs.readdirSync(contentDirectory);
  const allPostsData = fileNames
    .filter((fileName) => fileName.endsWith('.mdx'))
    .map((fileName) => {
      const slug = fileName.replace(/\.mdx$/, '');
      const fullPath = path.join(contentDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data, content } = matter(fileContents);
      const stats = readingTime(content);

      return {
        slug,
        title: data.title,
        excerpt: data.excerpt,
        date: data.date,
        category: data.category,
        tags: data.tags || [],
        featured: data.featured || false,
        content,
        readingTime: stats.text,
      };
    });

  // Sort posts by date (newest first)
  return allPostsData.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getBlogPostMeta(): BlogPostMeta[] {
  const fileNames = fs.readdirSync(contentDirectory);
  const allPostsData = fileNames
    .filter((fileName) => fileName.endsWith('.mdx'))
    .map((fileName) => {
      const slug = fileName.replace(/\.mdx$/, '');
      const fullPath = path.join(contentDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data, content } = matter(fileContents);
      const stats = readingTime(content);

      return {
        slug,
        title: data.title,
        excerpt: data.excerpt,
        date: data.date,
        category: data.category,
        tags: data.tags || [],
        featured: data.featured || false,
        readingTime: stats.text,
      };
    });

  // Sort posts by date (newest first)
  return allPostsData.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getBlogPostBySlug(slug: string): BlogPost | null {
  try {
    const fullPath = path.join(contentDirectory, `${slug}.mdx`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);
    const stats = readingTime(content);

    return {
      slug,
      title: data.title,
      excerpt: data.excerpt,
      date: data.date,
      category: data.category,
      tags: data.tags || [],
      featured: data.featured || false,
      content,
      readingTime: stats.text,
    };
  } catch (error) {
    return null;
  }
}

export function getAllSlugs(): string[] {
  const fileNames = fs.readdirSync(contentDirectory);
  return fileNames
    .filter((fileName) => fileName.endsWith('.mdx'))
    .map((fileName) => fileName.replace(/\.mdx$/, ''));
}

export function getPostsByCategory(category: string): BlogPostMeta[] {
  return getBlogPostMeta().filter(post => post.category === category);
}

export function getPostsByTag(tag: string): BlogPostMeta[] {
  return getBlogPostMeta().filter(post => post.tags.includes(tag));
}

export function getFeaturedPosts(): BlogPostMeta[] {
  return getBlogPostMeta().filter(post => post.featured);
} 