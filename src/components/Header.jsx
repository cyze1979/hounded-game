import { useState } from 'react';

export default function Header({ currentPlayer, gameDay, players, onPlayerSwitch }) {
  const [showSwitcher, setShowSwitcher] = useState(false);
  
  return (
    <header className="game-header">
      <h1>🐕 HOUNDED</h1>
      <div className="player-info">
        {players.length > 1 && (
          <div className="current-player">
            <span style={{fontSize: '0.9em', color: '#a0aec0'}}>Aktiver Spieler:</span>
            <span style={{fontWeight: 'bold', fontSize: '1.2em'}}>{currentPlayer.name}</span>
          </div>
        )}
        <div className="player-stats">
          <span>💰 Geld: <span id="player-money">{currentPlayer.money}</span>€</span>
          <span>📅 Tag: <span id="current-day">{gameDay}</span></span>
        </div>
      </div>
      
      {players.length > 1 && (
        <button className="btn-switch-player" onClick={() => setShowSwitcher(!showSwitcher)}>
          🔄 Spieler wechseln
        </button>
      )}
      
      {showSwitcher && (
        <div className="player-switcher" onClick={() => setShowSwitcher(false)}>
          <div className="switcher-content" onClick={(e) => e.stopPropagation()}>
            <h2>Spieler wechseln</h2>
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
                  <div style={{fontSize: '0.9em', color: '#718096'}}>
                    💰 {player.money}€ | 🏆 {player.totalWins} Siege
                  </div>
                </div>
              ))}
            </div>
            <button className="btn btn-danger" onClick={() => setShowSwitcher(false)}>
              Abbrechen
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
