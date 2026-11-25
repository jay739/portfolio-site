import AiToolsLab from "@/components/sections/AiToolsLab";
import BatcaveTools from "@/components/sections/BatcaveTools";
import NeuralPageIntro from "@/components/ui/NeuralPageIntro";
import RecentViewTracker from "@/components/ui/RecentViewTracker";
import RouteNextSteps from "@/components/layout/RouteNextSteps";
import { getBatcaveContainers } from "@/lib/homelab-stats-live";

/**
 * Rendered per request, so the container count below always reflects the
 * published homelab figures rather than whatever was true at build time.
 *
 * This costs a re-render, not a network call: getBatcaveContainers caches the
 * published fetch for five minutes and shares that cache with the badge route,
 * which is what keeps this page and the badge from printing different numbers.
 */
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AiToolsPage() {
  // Read server-side rather than from the browser: a client fetch would ship the
  // stale compiled-in constant in the initial HTML and only correct it after
  // hydration, which is visible in view-source and to crawlers.
  const { value: containerCount } = await getBatcaveContainers();

  return (
    <main className="flex min-h-screen flex-col items-center justify-between neural-page-shell gap-4 sm:gap-5">
      <RecentViewTracker
        item={{
          id: "page:ai-tools",
          title: "AI Tools Lab",
          href: "/ai-tools",
          kind: "tool",
          description: "Self-hosted tools, presets, and batcave utilities",
        }}
      />
      <NeuralPageIntro
        title="AI Tools Lab"
        subtitle="Hands-on AI workflows with tactile interactions. Launch tools, inspect behavior, and iterate quickly."
        chips={["Lab Console", "RAG Demo", "Batcave Toolbox", "Interactive UX"]}
        theme="ai-tools"
      />
      <section id="ai-tools" className="w-full">
        <AiToolsLab />
      </section>
      <section id="batcave-tools" className="w-full">
        <BatcaveTools containerCount={containerCount} />
      </section>
      <RouteNextSteps
        items={[
          {
            href: "/gallery",
            label: "Browse generated outputs",
            note: "See what the image workflows produce in the gallery.",
          },
          {
            href: "/homeserver?lite=1",
            label: "Inspect supporting telemetry",
            note: "Follow the public-safe infrastructure view behind the lab.",
          },
          {
            href: "/contact?intent=consulting",
            label: "Ask about the architecture",
            note: "Open a conversation about the tool stack and infra choices.",
          },
        ]}
      />
    </main>
  );
}
