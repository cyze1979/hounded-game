import { useState } from 'react';
import { playerColors } from '../data/dogData';

export default function Setup({ onStartGame, hasSave, onLoadGame }) {
  const [playerName, setPlayerName] = useState('');

  const handleStart = () => {
    const finalName = playerName.trim() || 'Spieler 1';
    onStartGame(finalName);
  };
  
  return (
    <div className="setup-screen">
      <div className="setup-overlay">
        <div className="setup-container">
          
          {/* Title */}
          <div className="setup-title">
            <h1 className="setup-logo">HOUNDED</h1>
            <p className="setup-subtitle">A MYSTICAL DOG RACING SIMULATION</p>
          </div>
          
          {/* Load Game Button */}
          {hasSave && (
            <button className="btn-cta setup-load-btn" onClick={onLoadGame}>
              Gespeichertes Spiel laden
            </button>
          )}
          
          {/* New Game Section */}
          <div className="setup-form">
            <h3 className="heading-md">Neues Spiel starten</h3>
            <p className="label-md" style={{color: 'var(--text-gray)', marginBottom: '20px'}}>
              Du trittst gegen 4 KI-Gegner an
            </p>

            {/* Player Name Input */}
            <div className="player-names-form">
              <h3 className="setup-section-title">Dein Name</h3>
              <div className="player-name-input">
                <div className="player-input-label">
                  <span
                    className="player-color-badge"
                    style={{background: playerColors[0]}}
                  ></span>
                  <span className="player-label-text">SPIELER 1</span>
                </div>
                <input
                  type="text"
                  className="setup-input"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Name eingeben..."
                  onKeyDown={(e) => e.key === 'Enter' && handleStart()}
                />
              </div>

              <button className="btn-cta setup-start-btn" onClick={handleStart}>
                Spiel starten
              </button>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
