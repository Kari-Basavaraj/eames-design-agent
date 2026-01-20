export function Header() {
  return (
    <header className="gradient-bg text-white">
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Eames AI</h1>
            <p className="text-xl opacity-90">Autonomous Product Design Agent</p>
            <p className="text-sm opacity-75 mt-2">From idea to deployed app in &lt;15 minutes</p>
          </div>
          <div className="text-right">
            <div className="text-sm opacity-75 mb-1">Target Performance</div>
            <div className="text-3xl font-bold">&lt;$1</div>
            <div className="text-xs opacity-75">per app with caching</div>
          </div>
        </div>
      </div>
    </header>
  );
}
