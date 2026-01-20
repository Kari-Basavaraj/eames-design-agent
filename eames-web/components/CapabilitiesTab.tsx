type MetricCardProps = {
  value: string;
  label: string;
  sublabel: string;
};

function MetricCard({ value, label, sublabel }: MetricCardProps) {
  return (
    <div className="text-center">
      <div className="text-4xl font-bold mb-2">{value}</div>
      <div className="text-sm font-medium opacity-90">{label}</div>
      <div className="text-xs opacity-75 mt-1">{sublabel}</div>
    </div>
  );
}

export function CapabilitiesTab() {
  const capabilities = [
    {
      category: 'Design Excellence',
      icon: '🎨',
      color: 'bg-pink-500',
      items: [
        'Stripe/Linear/Notion-level visual quality',
        'Systematic design tokens (8pt grid, Inter typography)',
        'WCAG 2.1 AA compliance (4.5:1 contrast minimum)',
        'Dark mode support by default',
        'Responsive design (mobile-first)'
      ]
    },
    {
      category: 'Engineering Mastery',
      icon: '⚡',
      color: 'bg-blue-500',
      items: [
        'React + TypeScript production patterns',
        'Next.js 14+ App Router',
        'Tailwind CSS with custom config',
        'Server Actions & API routes',
        'Comprehensive testing (unit + integration)'
      ]
    },
    {
      category: 'AI Features',
      icon: '🤖',
      color: 'bg-purple-500',
      items: [
        'OpenAI/Anthropic SDK integration',
        'Streaming responses',
        'Vector search (Pinecone/Weaviate)',
        'RAG pipelines',
        'Embeddings & semantic search'
      ]
    },
    {
      category: 'Autonomous Execution',
      icon: '🚀',
      color: 'bg-green-500',
      items: [
        'End-to-end automation (no manual steps)',
        'GitHub repo creation & push',
        'Vercel/Netlify deployment',
        'Resume capability (checkpoints)',
        'Error recovery with retry logic'
      ]
    },
    {
      category: 'Clarification Loop',
      icon: '🤔',
      color: 'bg-orange-500',
      items: [
        'Asks strategic questions for vague requests',
        'Validates understanding before building',
        'Surfaces contradictions proactively',
        'Design partner, not just code generator',
        'Ensures alignment with user goals'
      ]
    },
    {
      category: 'Multi-Project Support',
      icon: '📁',
      color: 'bg-indigo-500',
      items: [
        'Context isolation per project',
        'Seamless project switching',
        'Session history per project',
        'Eames Brain versioning',
        'Cross-project learnings (opt-in)'
      ]
    }
  ];

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold mb-4">What Makes Eames Unique</h2>
        <p className="text-gray-600 mb-8">
          Unlike other AI coding assistants, Eames is a complete design-to-deployment agent that combines strategic thinking, world-class design, and full-stack engineering.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {capabilities.map((cap, index) => (
            <div key={index} className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-purple-300 transition-colors">
              <div className={`w-12 h-12 ${cap.color} rounded-lg flex items-center justify-center text-2xl mb-4`}>
                {cap.icon}
              </div>
              <h3 className="text-lg font-bold mb-3">{cap.category}</h3>
              <ul className="space-y-2">
                {cap.items.map((item, i) => (
                  <li key={i} className="text-sm text-gray-600 flex items-start">
                    <span className="text-green-500 mr-2 flex-shrink-0">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-6">Performance Targets</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <MetricCard
            value="<15 min"
            label="Total Execution Time"
            sublabel="Target: <10 min stretch"
          />
          <MetricCard
            value="<$1"
            label="Cost Per App"
            sublabel="$0.30 with caching"
          />
          <MetricCard
            value=">90%"
            label="Success Rate"
            sublabel="Deployable apps"
          />
          <MetricCard
            value="100%"
            label="Quality Gates"
            sublabel="Lint + Types + Tests"
          />
        </div>
      </div>
    </div>
  );
}
