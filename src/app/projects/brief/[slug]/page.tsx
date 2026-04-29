import { notFound } from 'next/navigation';
import { projects } from '@/data/projects';
import { projectSlug } from '@/lib/project-utils';

export default function ProjectBriefPage({ params }: { params: { slug: string } }) {
  const project = projects.find((entry) => projectSlug(entry.title) === params.slug);

  if (!project) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-10 text-slate-100">
      <div className="rounded-3xl border border-slate-700/60 bg-slate-950/80 p-8 shadow-2xl">
        <p className="text-[11px] uppercase tracking-widest text-amber-300">One-page case study</p>
        <h1 className="mt-3 text-3xl font-bold text-white">{project.title}</h1>
        <p className="mt-4 text-base leading-relaxed text-slate-300">{project.description}</p>

        {project.proofPoints && project.proofPoints.length > 0 && (
          <section className="mt-8">
            <h2 className="text-lg font-semibold text-amber-200">Proof Points</h2>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {project.proofPoints.map((point) => (
                <div key={point} className="rounded-xl border border-slate-700/60 bg-slate-900/45 px-4 py-3 text-sm text-slate-200">
                  {point}
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mt-8 grid gap-6 md:grid-cols-2">
          <div>
            <h2 className="text-lg font-semibold text-amber-200">Challenges</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              {(project.challenges || []).map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-amber-200">Learnings</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              {(project.learnings || []).map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-semibold text-amber-200">Stack</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {(project.techStack || project.tags).map((entry) => (
              <span key={entry} className="rounded-full border border-slate-700/60 px-3 py-1 text-xs text-slate-300">
                {entry}
              </span>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
