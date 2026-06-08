import { renderOgImage, ogSize, ogContentType } from "@/lib/og-template";
import { projects } from "@/data/projects";
import { projectSlug } from "@/lib/project-utils";

// Per-project social card: project title + description + tags.
export const runtime = "nodejs";
export const size = ogSize;
export const contentType = ogContentType;
export const alt = "Project brief preview — Jayakrishna Konda";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = projects.find((entry) => projectSlug(entry.title) === slug);

  if (!project) {
    return renderOgImage({
      eyebrow: "Projects",
      title: "Jayakrishna Konda",
      subtitle: "jay739.dev/projects",
    });
  }

  const subtitle =
    project.description.length > 140
      ? `${project.description.slice(0, 137).trimEnd()}…`
      : project.description;

  return renderOgImage({
    eyebrow: "Project",
    title: project.title,
    subtitle,
    tags: project.tags,
  });
}
