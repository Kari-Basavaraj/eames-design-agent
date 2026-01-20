type NavigationProps = {
  activeTab: 'demo' | 'architecture' | 'capabilities';
  setActiveTab: (tab: 'demo' | 'architecture' | 'capabilities') => void;
};

export function Navigation({ activeTab, setActiveTab }: NavigationProps) {
  const tabs = ['demo', 'architecture', 'capabilities'] as const;

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-6">
        <div className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
