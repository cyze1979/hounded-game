import { useState } from 'react';
import { getDogImage } from '../utils/assetLoader';

export default function Header({ currentPlayer, gameDay, players, onPlayerSwitch, currentView, onViewChange, marketNotifications = 0 }) {
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
  
  return (
    <header className="game-header-new">
      {/* Left: Player Info */}
      <div className="header-player" onClick={() => players.length > 1 && setShowSwitcher(!showSwitcher)}>
        <div className="player-avatar">
          {playerAvatar ? (
            <img src={playerAvatar} alt={currentPlayer.name} />
          ) : (
            <div className="avatar-placeholder">🐕</div>
          )}
        </div>
        <div className="player-name">
          <div className="label">SPIELER {currentPlayer.index + 1}</div>
          <div className="name">{currentPlayer.name}</div>
        </div>
        {players.length > 1 && <div className="switch-icon">▼</div>}
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
      
      {/* Right: Week Info */}
      <div className="header-week">
        WOCHE {gameDay}
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
                    💰 {player.money}€ | 🏆 {player.totalWins} Siege
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
