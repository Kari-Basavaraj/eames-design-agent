import { phases } from '@/app/page';

type FeatureCardProps = {
  title: string;
  description: string;
  items: string[];
};

function FeatureCard({ title, description, items }: FeatureCardProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-sm text-gray-600 mb-4">{description}</p>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-gray-700 flex items-start">
            <span className="text-purple-500 mr-2">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ArchitectureTab() {
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold mb-4">System Architecture</h2>
        <p className="text-gray-600 mb-8">
          Eames uses a hybrid architecture combining custom LangGraph orchestration with DeepAgents-powered phase agents.
        </p>

        {/* Architecture Diagram */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <div className="text-center mb-6">
            <div className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg font-bold">
              Eames Orchestrator (LangGraph)
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {phases.map((phase) => (
              <div key={phase.id} className="bg-white rounded-lg p-4 border-2 border-gray-200">
                <div className="text-2xl mb-2 text-center">{phase.icon}</div>
                <div className="text-sm font-bold text-center">{phase.name}</div>
                <div className={`text-xs text-center mt-2 ${phase.color} text-white px-2 py-1 rounded`}>
                  DeepAgent
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <div className="inline-block bg-gray-700 text-white px-6 py-3 rounded-lg">
              <div className="font-bold mb-2">Shared Infrastructure</div>
              <div className="text-xs space-x-4">
                <span>CompositeBackend</span>
                <span>•</span>
                <span>Eames Brain 2.0</span>
                <span>•</span>
                <span>PostgreSQL</span>
                <span>•</span>
                <span>LangSmith</span>
              </div>
            </div>
          </div>
        </div>

        {/* Key Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FeatureCard
            title="CompositeBackend"
            description="Intelligent routing between ephemeral state, persistent memory, and real filesystem"
            items={[
              '/workspace/ → StateBackend (ephemeral)',
              '/memories/ → StoreBackend (PostgreSQL)',
              '/deliverables/ → FilesystemBackend (real disk)'
            ]}
          />

          <FeatureCard
            title="Eames Brain 2.0"
            description="Domain intelligence embedded in every agent's system prompt"
            items={[
              'Core Identity (~800 tokens)',
              'Visual Design Excellence (~1200 tokens)',
              'Full-Stack Engineering (~1500 tokens)',
              'Clarification Loop (competitive moat)'
            ]}
          />

          <FeatureCard
            title="Quality Gates"
            description="Automated checks ensure production-ready code"
            items={[
              'ESLint (must pass)',
              'TypeScript (must pass)',
              'Vitest tests (must pass)',
              'Self-healing loop (max 3 retries)'
            ]}
          />

          <FeatureCard
            title="Cost Optimization"
            description="Advanced caching and routing keep costs low"
            items={[
              'Prompt caching (90% savings)',
              'Model routing (Sonnet/Haiku)',
              'Context eviction (>20k tokens)',
              'Target: <$1 per app'
            ]}
          />
        </div>
      </div>
    </div>
  );
}
