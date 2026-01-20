'use client';

import { useState } from 'react';
import { phases } from '@/app/page';
import { PhaseExecution } from './PhaseExecution';

type ClarificationQuestion = {
  id: string;
  text: string;
  options?: string[];
  placeholder?: string;
};

const clarificationQuestions: ClarificationQuestion[] = [
  {
    id: 'target_user',
    text: 'Who is the primary user?',
    options: ['Developers', 'Designers', 'Teams', 'Individuals', 'Business users']
  },
  {
    id: 'differentiator',
    text: 'What makes this different from existing solutions?',
    placeholder: 'e.g., AI-powered, real-time collaboration, mobile-first...'
  },
  {
    id: 'integrations',
    text: 'Any specific integrations needed?',
    options: ['GitHub', 'Slack', 'Notion', 'Linear', 'None', 'Other']
  }
];

export function DemoTab() {
  const [projectInput, setProjectInput] = useState('');
  const [showClarification, setShowClarification] = useState(false);
  const [clarificationAnswers, setClarificationAnswers] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [phaseProgress, setPhaseProgress] = useState<Array<{ phase: string; status: string; timestamp: string }>>([]);
  const [currentPhase, setCurrentPhase] = useState<string | null>(null);

  const handleStartProject = () => {
    if (!projectInput.trim()) return;

    // Simulate clarity assessment
    const isVague = projectInput.split(' ').length < 8;

    if (isVague) {
      setShowClarification(true);
    } else {
      startPhaseExecution();
    }
  };

  const handleClarificationSubmit = () => {
    setShowClarification(false);
    startPhaseExecution();
  };

  const startPhaseExecution = () => {
    setIsProcessing(true);
    setPhaseProgress([]);

    // Simulate phase execution
    phases.forEach((phase, index) => {
      setTimeout(() => {
        setCurrentPhase(phase.id);
        setPhaseProgress(prev => [...prev, {
          phase: phase.id,
          status: 'in_progress',
          timestamp: new Date().toLocaleTimeString()
        }]);

        setTimeout(() => {
          setPhaseProgress(prev => prev.map(p =>
            p.phase === phase.id
              ? { ...p, status: 'completed' }
              : p
          ));

          if (index === phases.length - 1) {
            setIsProcessing(false);
            setCurrentPhase(null);
          }
        }, 2000);
      }, index * 2500);
    });
  };

  const examplePrompts = [
    'Build a productivity app',
    'Create a modern dashboard for analytics',
    'Build a todo app inspired by Linear with keyboard shortcuts',
    'Make an expense tracker for freelancers with invoice generation'
  ];

  return (
    <div className="space-y-8">
      {/* Input Section */}
      {!isProcessing && phaseProgress.length === 0 && (
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Start a New Project</h2>
          <p className="text-gray-600 mb-6">
            Describe your app idea. Be as specific or as vague as you like - Eames will ask clarifying questions if needed.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Description
              </label>
              <textarea
                value={projectInput}
                onChange={(e) => setProjectInput(e.target.value)}
                placeholder="e.g., 'Build a modern expense tracker for freelancers' or simply 'Build a todo app'"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                rows={4}
              />
            </div>

            <button
              onClick={handleStartProject}
              disabled={!projectInput.trim()}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium py-3 px-6 rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Start Building with Eames →
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Example Prompts:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {examplePrompts.map((example, i) => (
                <button
                  key={i}
                  onClick={() => setProjectInput(example)}
                  className="text-left text-sm text-gray-600 hover:text-purple-600 hover:bg-purple-50 p-2 rounded transition-colors"
                >
                  &quot;{example}&quot;
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Clarification Loop */}
      {showClarification && (
        <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-purple-500">
          <div className="flex items-start space-x-3 mb-6">
            <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-xl">🤔</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Clarification Needed</h3>
              <p className="text-gray-600 mt-1">
                To build the best product, I need a bit more information:
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {clarificationQuestions.map((q, index) => (
              <div key={q.id} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {index + 1}. {q.text}
                </label>
                {q.options ? (
                  <div className="flex flex-wrap gap-2">
                    {q.options.map((option) => (
                      <button
                        key={option}
                        onClick={() => setClarificationAnswers({
                          ...clarificationAnswers,
                          [q.id]: option
                        })}
                        className={`px-4 py-2 rounded-lg border-2 transition-all ${
                          clarificationAnswers[q.id] === option
                            ? 'border-purple-500 bg-purple-50 text-purple-700'
                            : 'border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                ) : (
                  <input
                    type="text"
                    placeholder={q.placeholder}
                    value={clarificationAnswers[q.id] || ''}
                    onChange={(e) => setClarificationAnswers({
                      ...clarificationAnswers,
                      [q.id]: e.target.value
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                )}
              </div>
            ))}

            <button
              onClick={handleClarificationSubmit}
              className="w-full bg-purple-600 text-white font-medium py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Continue with These Answers →
            </button>
          </div>
        </div>
      )}

      {/* Phase Execution */}
      {(isProcessing || phaseProgress.length > 0) && (
        <PhaseExecution
          currentPhase={currentPhase}
          phaseProgress={phaseProgress}
          isProcessing={isProcessing}
        />
      )}
    </div>
  );
}
