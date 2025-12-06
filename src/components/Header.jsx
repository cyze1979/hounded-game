import { getDogImage } from '../utils/assetLoader';

export default function Header({ currentPlayer, currentMonth, currentYear, currentView, onViewChange, marketNotifications = 0, onMenuClick, onNextDay, raceCompleted }) {

  // Month names
  const monthNames = ['JANUAR', 'FEBRUAR', 'MÄRZ', 'APRIL', 'MAI', 'JUNI', 'JULI', 'AUGUST', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DEZEMBER'];
  const currentMonthName = monthNames[(currentMonth - 1) % 12];
  
  // Get player's first dog for avatar, or use placeholder
  const playerAvatar = currentPlayer.dogs.length > 0 
    ? getDogImage(currentPlayer.dogs[0].imageNumber)
    : null;
  
  const navItems = [
    { id: 'stable', label: 'RENNSTALL' },
    { id: 'market', label: 'HUNDEMARKT', badge: marketNotifications },
    { id: 'race', label: 'RENNEN' },
    { id: 'leaderboard', label: 'STATISTIKEN' }
  ];
  
  // Format money with thousands separator
  const formatMoney = (amount) => {
    return amount.toLocaleString('de-DE');
  };

  const handleNavClick = (viewId) => {
    if (viewId === 'stable') {
      window.dispatchEvent(new CustomEvent('stableViewClick'));
    }
    onViewChange(viewId);
  };

  return (
    <header className="game-header-new">
      {/* Left: Burger Menu & Player Info */}
      <div className="header-left">
        <button className="burger-menu-btn burger-menu-simple" onClick={onMenuClick}>
          ☰
        </button>

        <div className="header-player">
          <div className="player-avatar">
            {playerAvatar ? (
              <img src={playerAvatar} alt={currentPlayer.name} />
            ) : (
              <div className="avatar-placeholder">🐕</div>
            )}
          </div>
          <div className="player-info-text">
            <div className="player-name">{currentPlayer.name.toUpperCase()}</div>
            <div className="player-money">{formatMoney(currentPlayer.money)} €</div>
          </div>
        </div>
      </div>

      {/* Center: Navigation */}
      <nav className="header-nav">
        {navItems.map(item => (
          <button
            key={item.id}
            className={`nav-item ${currentView === item.id ? 'active' : ''}`}
            onClick={() => handleNavClick(item.id)}
          >
            {item.label}
            {item.badge > 0 && <span className="nav-badge">{item.badge}</span>}
          </button>
        ))}
      </nav>
      
      {/* Right: Date & Next Button */}
      <div className="header-right">
        <div className="header-week">{currentMonthName} {currentYear}</div>
        <button
          className="btn-cta btn-next-day"
          onClick={onNextDay}
        >
          WEITER
        </button>
      </div>
    </header>
  );
}
