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
      <div className="setup-container">
        <h1>🐕 HOUNDED</h1>
        <h2>Hunderennen-Manager</h2>
        
        {hasSave && (
          <button className="btn btn-success" onClick={onLoadGame} style={{marginBottom: '30px'}}>
            📁 Gespeichertes Spiel laden
          </button>
        )}
        
        <div className="setup-form">
          <h3>Neues Spiel starten</h3>
          <p style={{color: '#718096', marginBottom: '20px'}}>
            Wie viele Spieler nehmen teil?
          </p>
          
          <div className="player-count-selector">
            {[1, 2, 3, 4].map(count => (
              <button 
                key={count}
                className={`count-btn ${playerCount === count ? 'selected' : ''}`}
                onClick={() => handlePlayerCount(count)}
              >
                {count} Spieler
              </button>
            ))}
          </div>
          
          {playerCount && (
            <div className="player-names-form">
              <h3>Spieler-Namen</h3>
              {playerNames.map((name, index) => (
                <div key={index} className="player-name-input">
                  <label>
                    <span className="player-color-badge" style={{background: playerColors[index]}}></span>
                    Spieler {index + 1}:
                  </label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => handleNameChange(index, e.target.value)}
                    placeholder="Name eingeben"
                  />
                </div>
              ))}
              <button className="btn btn-primary" onClick={handleStart} style={{marginTop: '20px'}}>
                🎮 Spiel starten
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
