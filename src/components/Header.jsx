import { useState } from 'react';
import { getDogImage } from '../utils/assetLoader';

export default function Header({ currentPlayer, gameDay, players, onPlayerSwitch, currentView, onViewChange, marketNotifications = 0, onMenuClick, onNextDay }) {
  const [showSwitcher, setShowSwitcher] = useState(false);
  
  // Get player's first dog for avatar, or use placeholder
  const playerAvatar = currentPlayer.dogs.length > 0 
    ? getDogImage(currentPlayer.dogs[0].imageNumber)
    : null;
  
  const navItems = [
    { id: 'stable', label: 'MEIN RENNSTALL' },
    { id: 'market', label: 'HUNDEMARKT', badge: marketNotifications },
    { id: 'race', label: 'RENNEN' },
    { id: 'leaderboard', label: 'STATISTIKEN' }
  ];
  
  // Format money with thousands separator
  const formatMoney = (amount) => {
    return amount.toLocaleString('de-DE');
  };
  
  return (
    <header className="game-header-new">
      {/* Left: Burger Menu & Player Info */}
      <div className="header-left">
        <button className="burger-menu-btn burger-menu-simple" onClick={onMenuClick}>
          ☰
        </button>
        
        <div className="header-player" onClick={() => players.length > 1 && setShowSwitcher(!showSwitcher)}>
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
          {players.length > 1 && <div className="switch-icon">▼</div>}
        </div>
      </div>
      
      {/* Center: Navigation */}
      <nav className="header-nav">
        {navItems.map(item => (
          <button
            key={item.id}
            className={`nav-item ${currentView === item.id ? 'active' : ''}`}
            onClick={() => onViewChange(item.id)}
          >
            {item.label}
            {item.badge > 0 && <span className="nav-badge">{item.badge}</span>}
          </button>
        ))}
      </nav>
      
      {/* Right: Week Info & WEITER Button */}
      <div className="header-right">
        <div className="header-week">WOCHE {gameDay}</div>
        <button className="btn-cta btn-next-day" onClick={onNextDay}>
          WEITER
        </button>
      </div>
      
      {/* Player Switcher Modal */}
      {showSwitcher && (
        <div className="player-switcher-overlay" onClick={() => setShowSwitcher(false)}>
          <div className="player-switcher-menu" onClick={(e) => e.stopPropagation()}>
            <h3>Spieler wechseln</h3>
            <div className="player-list">
              {players.map((player, index) => (
                <div 
                  key={index}
                  className="player-option"
                  style={{borderLeft: `4px solid ${player.color}`}}
                  onClick={() => {
                    onPlayerSwitch(index);
                    setShowSwitcher(false);
                  }}
                >
                  <strong>{player.name}</strong>
                  <div className="player-stats-small">
                    💰 {formatMoney(player.money)}€ | 🏆 {player.totalWins} Siege
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
