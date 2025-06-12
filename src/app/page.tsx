'use client';

import Hero from '@/components/sections/Hero';
import ImpactStats from '@/components/sections/ImpactStats';
import Timeline from '@/components/sections/Timeline';
import SkillsChart from '@/components/sections/SkillsChart';
import Projects from '@/components/sections/Projects';
import AiToolsLab from '@/components/sections/AiToolsLab';
import HomeServerGallery from '@/components/sections/HomeServerGallery';
import AINewsSection from '@/components/sections/AINewsSection';
import ContactSection from '@/components/sections/ContactSection';
import TimeInSecondsBar from '@/components/TimeInSecondsBar';
import { projects } from '@/data/projects';
import { timelineItems } from '@/data/timeline';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between w-full max-w-[1800px] px-2 sm:px-6 mx-auto">
      <TimeInSecondsBar />
      <section id="welcome"><Hero /></section>
      <section id="impact"><ImpactStats /></section>
      <section id="timeline"><Timeline items={timelineItems} /></section>
      <section id="skills"><SkillsChart /></section>
      <section id="projects"><Projects projects={projects} /></section>
      <section id="ai-tools"><AiToolsLab /></section>
      <section id="home-server"><HomeServerGallery /></section>
      <section id="ai-news"><AINewsSection /></section>
      <section id="contact"><ContactSection /></section>
    </main>
  );
} 