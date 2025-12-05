export default function Navigation({ currentView, onViewChange }) {
  const views = [
    { id: 'stable', label: 'Mein Rennstall' },
    { id: 'market', label: 'Hundemarkt' },
    { id: 'race', label: 'Rennen' },
    { id: 'leaderboard', label: 'Rangliste' },
    { id: 'stats', label: 'Statistiken' }
  ];

  const handleViewChange = (viewId) => {
    if (viewId === 'stable') {
      window.dispatchEvent(new CustomEvent('stableViewClick'));
    }
    onViewChange(viewId);
  };

  return (
    <nav className="main-nav">
      {views.map(view => (
        <button
          key={view.id}
          className={`nav-btn ${currentView === view.id ? 'active' : ''}`}
          onClick={() => handleViewChange(view.id)}
        >
          {view.label}
        </button>
      ))}
    </nav>
  );
}
