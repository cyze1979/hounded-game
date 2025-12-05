import { useState } from 'react';
import { playerColors } from '../data/dogData';

export default function Setup({ onStartGame, hasSave, onLoadGame }) {
  const [playerCount, setPlayerCount] = useState(null);
  const [playerNames, setPlayerNames] = useState([]);
  
  const handlePlayerCount = (count) => {
    setPlayerCount(count);
    setPlayerNames(Array(count).fill(''));
  };
  
  const handleNameChange = (index, value) => {
    const newNames = [...playerNames];
    newNames[index] = value;
    setPlayerNames(newNames);
  };
  
  const handleStart = () => {
    const finalNames = playerNames.map((name, i) => 
      name.trim() || `Spieler ${i + 1}`
    );
    onStartGame(finalNames);
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
            <p className="label-md" style={{color: 'var(--text-gray)'}}>Wie viele Spieler nehmen teil?</p>
            
            {/* Player Count Selector */}
            <div className="player-count-selector">
              {[1, 2, 3, 4].map(count => (
                <button 
                  key={count}
                  className={`btn-tab player-count-btn ${playerCount === count ? 'selected' : ''}`}
                  onClick={() => handlePlayerCount(count)}
                >
                  <span>{count}</span>
                </button>
              ))}
            </div>
            
            {/* Player Names Form */}
            {playerCount && (
              <div className="player-names-form">
                <h3 className="setup-section-title">Spieler-Namen</h3>
                {playerNames.map((name, index) => (
                  <div key={index} className="player-name-input">
                    <div className="player-input-label">
                      <span 
                        className="player-color-badge" 
                        style={{background: playerColors[index]}}
                      ></span>
                      <span className="player-label-text">SPIELER {index + 1}</span>
                    </div>
                    <input 
                      type="text" 
                      className="setup-input"
                      value={name}
                      onChange={(e) => handleNameChange(index, e.target.value)}
                      placeholder="Name eingeben..."
                    />
                  </div>
                ))}
                
                <button className="btn-cta setup-start-btn" onClick={handleStart}>
                  Spiel starten
                </button>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
