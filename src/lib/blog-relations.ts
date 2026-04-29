import { projects } from '@/data/projects';
import { projectSlug } from '@/lib/project-utils';
import type { BlogPost, BlogPostMeta } from '@/lib/blog';

export interface RelatedProjectLink {
  title: string;
  href: string;
  reason: string;
}

export interface RelatedSkillLink {
  label: string;
  href: string;
  reason: string;
}

const SKILL_DOMAIN_MATCHERS: Array<{
  label: string;
  href: string;
  reason: string;
  keywords: string[];
}> = [
  {
    label: 'AI/ML Domain',
    href: '/skills?mode=map&domain=AI%2FML',
    reason: 'Jump into the machine learning, RAG, and model delivery stack.',
    keywords: ['ai', 'ml', 'rag', 'langchain', 'llm', 'nlp', 'tensorflow', 'pytorch', 'finbert', 'yolo', 'ocr'],
  },
  {
    label: 'DevOps Domain',
    href: '/skills?mode=map&domain=DevOps',
    reason: 'See the infrastructure, Docker, monitoring, and deployment stack.',
    keywords: ['docker', 'kubernetes', 'monitoring', 'infrastructure', 'homelab', 'devops', 'ci/cd', 'tailscale', 'authentik', 'netdata'],
  },
  {
    label: 'Cloud Domain',
    href: '/skills?mode=map&domain=Cloud',
    reason: 'Open the cloud platforms, automation, and deployment capabilities.',
    keywords: ['aws', 'oci', 'oracle cloud', 'cloud', 'deployment', 'hosting', 'migration'],
  },
  {
    label: 'Frontend Domain',
    href: '/skills?mode=map&domain=Frontend',
    reason: 'Inspect the UI stack behind portfolio and app experiences.',
    keywords: ['next.js', 'react', 'frontend', 'portfolio', 'ux', 'interface', 'tailwind'],
  },
];

function textForPost(post: BlogPost | BlogPostMeta) {
  return [post.title, post.excerpt, post.category, ...(post.tags ?? [])].join(' ').toLowerCase();
}

export function getRelatedProjectsForPost(post: BlogPost | BlogPostMeta): RelatedProjectLink[] {
  const postText = textForPost(post);

  const scored = projects
    .map((project) => {
      const projectText = [project.title, project.description, ...(project.tags ?? []), ...(project.techStack ?? [])]
        .join(' ')
        .toLowerCase();

      const overlap = (post.tags ?? []).filter((tag) => projectText.includes(tag.toLowerCase())).length;
      const titleBoost = project.title
        .toLowerCase()
        .split(/\W+/)
        .filter(Boolean)
        .some((word) => postText.includes(word))
        ? 1
        : 0;
      const score = overlap * 2 + titleBoost;

      return {
        project,
        score,
      };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return scored.map(({ project }) => ({
    title: project.title,
    href: `/projects?project=${projectSlug(project.title)}`,
    reason: `Related through ${project.tags.slice(0, 2).join(', ') || 'shared stack'}.`,
  }));
}

export function getRelatedSkillsForPost(post: BlogPost | BlogPostMeta): RelatedSkillLink[] {
  const postText = textForPost(post);

  return SKILL_DOMAIN_MATCHERS.filter((domain) =>
    domain.keywords.some((keyword) => postText.includes(keyword))
  ).slice(0, 2).map((domain) => ({
    label: domain.label,
    href: domain.href,
    reason: domain.reason,
  }));
}
