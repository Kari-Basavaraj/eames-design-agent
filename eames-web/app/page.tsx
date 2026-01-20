'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { Navigation } from '@/components/Navigation';
import { DemoTab } from '@/components/DemoTab';
import { ArchitectureTab } from '@/components/ArchitectureTab';
import { CapabilitiesTab } from '@/components/CapabilitiesTab';

export type Phase = {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  tools: string[];
  output: string;
};

export const phases: Phase[] = [
  {
    id: 'discovery',
    name: 'Discovery',
    icon: '🔍',
    color: 'bg-blue-500',
    description: 'Research competitors, market trends, and user needs',
    tools: ['Tavily Search', 'Web Scraper', 'Analysis'],
    output: 'Market research synthesis with citations'
  },
  {
    id: 'define',
    name: 'Define',
    icon: '📋',
    color: 'bg-purple-500',
    description: 'Create PRD with user stories and acceptance criteria',
    tools: ['PRD Generator', 'User Stories', 'JTBD Framework'],
    output: 'Complete Product Requirements Document'
  },
  {
    id: 'design',
    name: 'Design',
    icon: '🎨',
    color: 'bg-pink-500',
    description: 'Generate design system with Stripe/Linear-level quality',
    tools: ['Design System', 'Components', 'Accessibility Check'],
    output: 'Design system + component specifications'
  },
  {
    id: 'develop',
    name: 'Develop',
    icon: '⚡',
    color: 'bg-green-500',
    description: 'Build production-ready code with quality gates',
    tools: ['React/Next.js', 'TypeScript', 'Testing'],
    output: 'Working application with tests'
  },
  {
    id: 'deliver',
    name: 'Deliver',
    icon: '🚀',
    color: 'bg-orange-500',
    description: 'Deploy to Vercel/Netlify with GitHub integration',
    tools: ['GitHub', 'Vercel', 'Deployment'],
    output: 'Live URL + GitHub repository'
  }
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<'demo' | 'architecture' | 'capabilities'>('demo');

  return (
    <div className="min-h-screen">
      <Header />
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="container mx-auto px-6 py-12">
        {activeTab === 'demo' && <DemoTab />}
        {activeTab === 'architecture' && <ArchitectureTab />}
        {activeTab === 'capabilities' && <CapabilitiesTab />}
      </div>
    </div>
  );
}
