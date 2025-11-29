export default function Navigation({ currentView, onViewChange }) {
  const views = [
    { id: 'stable', label: 'Mein Rennstall' },
    { id: 'market', label: 'Hundemarkt' },
    { id: 'race', label: 'Rennen' },
    { id: 'leaderboard', label: 'Rangliste' }
  ];
  
  return (
    <nav className="main-nav">
      {views.map(view => (
        <button
          key={view.id}
          className={`nav-btn ${currentView === view.id ? 'active' : ''}`}
          onClick={() => onViewChange(view.id)}
        >
          {view.label}
        </button>
      ))}
    </nav>
  );
}
