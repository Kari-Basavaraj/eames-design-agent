import { phases } from '@/app/page';

type PhaseExecutionProps = {
  currentPhase: string | null;
  phaseProgress: Array<{ phase: string; status: string; timestamp: string }>;
  isProcessing: boolean;
};

export function PhaseExecution({ currentPhase, phaseProgress, isProcessing }: PhaseExecutionProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Building Your Application</h2>

        <div className="space-y-4">
          {phases.map((phase) => {
            const progress = phaseProgress.find(p => p.phase === phase.id);
            const isActive = currentPhase === phase.id;
            const isCompleted = progress?.status === 'completed';

            return (
              <div
                key={phase.id}
                className={`border-2 rounded-lg p-6 transition-all ${
                  isActive ? 'border-purple-500 bg-purple-50' :
                  isCompleted ? 'border-green-500 bg-green-50' :
                  'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className={`text-3xl ${isActive ? 'pulse-animation' : ''}`}>
                      {phase.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-bold">{phase.name}</h3>
                        {isActive && (
                          <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded">
                            In Progress
                          </span>
                        )}
                        {isCompleted && (
                          <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">
                            ✓ Completed
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mt-1">{phase.description}</p>

                      {isActive && (
                        <div className="mt-3 space-y-2">
                          <div className="text-xs text-gray-500">
                            Using: {phase.tools.join(', ')}
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-purple-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                          </div>
                        </div>
                      )}

                      {isCompleted && (
                        <div className="mt-2 text-sm text-green-700">
                          ✓ {phase.output}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right text-sm text-gray-500">
                    {progress?.timestamp}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {!isProcessing && phaseProgress.length === 5 && (
          <div className="mt-8 p-6 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg">
            <h3 className="text-2xl font-bold mb-2">🎉 Deployment Complete!</h3>
            <p className="mb-4">Your application has been built and deployed successfully.</p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="font-medium">Live URL:</span>
                <a href="#" className="underline hover:text-green-100">
                  https://your-app-xyz123.vercel.app
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-medium">GitHub:</span>
                <a href="#" className="underline hover:text-green-100">
                  github.com/username/your-app
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-medium">Total Time:</span>
                <span>12.5 minutes</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-medium">Total Cost:</span>
                <span>$0.28 (with caching)</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
