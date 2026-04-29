'use client';

import dynamic from 'next/dynamic';
import NeuralPageIntro from '@/components/ui/NeuralPageIntro';
import RecentViewTracker from '@/components/ui/RecentViewTracker';
import RouteNextSteps from '@/components/layout/RouteNextSteps';
import SectionDeepLink from '@/components/ui/SectionDeepLink';

const HomeServerStats = dynamic(() => import('@/components/sections/HomeServerStats'), {
  ssr: false,
  loading: () => <div className="w-full min-h-[520px] neural-card-soft rounded-xl animate-pulse" />,
});

const HomelabArchitecturePanel = dynamic(() => import('@/components/sections/HomelabArchitecturePanel'), {
  ssr: false,
  loading: () => <div className="w-full min-h-[520px] neural-card-soft rounded-xl animate-pulse" />,
});

export default function HomeServerPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between neural-page-shell gap-4 sm:gap-5">
      <RecentViewTracker item={{ id: 'page:homeserver', title: 'Telemetry Control Center', href: '/homeserver', kind: 'page', description: 'Live infrastructure metrics and homelab telemetry' }} />
      <NeuralPageIntro
        title="Telemetry Control Center"
        subtitle="Live infrastructure metrics presented as a neural operations dashboard for system awareness and reliability."
        chips={['Real-Time Signals', 'Ops Insight', 'Infrastructure']}
        theme="homeserver"
      />
      <section id="architecture" className="w-full">
        <div className="mb-3 flex justify-end">
          <SectionDeepLink id="architecture" title="Homelab architecture" />
        </div>
        <HomelabArchitecturePanel />
      </section>
      <section id="home-server" className="w-full">
        <div className="mb-3 flex justify-end">
          <SectionDeepLink id="home-server" title="Home server telemetry" />
        </div>
        <HomeServerStats />
      </section>
      <RouteNextSteps
        items={[
          { href: '/projects?project=ai-platform-infrastructure-batcave-personal-ml-cloud', label: 'Open the Batcave case study', note: 'See the architecture story behind the dashboard.' },
          { href: '/skills?mode=map&domain=DevOps', label: 'Map the infra skills', note: 'Follow telemetry back to the DevOps/MLOps stack.' },
          { href: '/ai-tools', label: 'Use the AI tools', note: 'Move from ops visibility into the live product surfaces.' },
        ]}
      />
    </main>
  );
} 
