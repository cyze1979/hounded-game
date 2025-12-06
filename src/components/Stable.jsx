import { useState, useEffect } from 'react';
import DogDetailFull from './DogDetailFull';
import { getDogImage } from '../utils/assetLoader';

export default function Stable({ player, gameState, setGameState }) {
  const [selectedDog, setSelectedDog] = useState(null);

  const getPerformancePercent = (fitness) => {
    if (fitness >= 80) {
      return 100;
    } else if (fitness >= 50) {
      const factor = 0.85 + ((fitness - 50) / 30) * 0.15;
      return Math.round(factor * 100);
    } else {
      const factor = 0.70 + (fitness / 50) * 0.15;
      return Math.round(factor * 100);
    }
  };

  useEffect(() => {
    const handleShowDetail = (e) => {
      setSelectedDog(e.detail);
    };

    const handleStableClick = () => {
      if (selectedDog) {
        setSelectedDog(null);
      }
    };

    window.addEventListener('showDogDetail', handleShowDetail);
    window.addEventListener('stableViewClick', handleStableClick);

    return () => {
      window.removeEventListener('showDogDetail', handleShowDetail);
      window.removeEventListener('stableViewClick', handleStableClick);
    };
  }, [selectedDog]);
  
  // If a dog is selected, show detail view instead of grid
  if (selectedDog) {
    return (
      <DogDetailFull 
        dog={selectedDog} 
        player={player}
        allDogs={player.dogs}
        gameState={gameState}
        setGameState={setGameState}
        onClose={() => setSelectedDog(null)} 
      />
    );
  }
  
  if (player.dogs.length === 0) {
    return (
      <div className="stable-view">
        <div className="empty-state">
          <div className="empty-state-icon">🐕</div>
          <h2 className="heading-lg">Noch keine Hunde im Stall</h2>
          <p className="body-md">Gehe zum Hundemarkt und kaufe deinen ersten Rennhund!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="stable-view">
      <h1 className="display-lg" style={{marginBottom: '8px'}}>RENNSTALL</h1>
      <div className="label-md" style={{color: '#9d9d9d'}}>
        ORKOS HUNDE ({player.dogs.length}/{gameState.stableLimit})
      </div>

      <div className="dog-grid-stable">
        {player.dogs.map((dog, index) => (
          <div
            key={dog.id}
            className="stable-dog-card"
            onClick={() => setSelectedDog(dog)}
          >
            {dog.availablePoints > 0 && (
              <div className="level-up-badge">LEVEL UP</div>
            )}

            <div className="stable-dog-image">
              <img
                src={getDogImage(dog.imageNumber)}
                alt={dog.name}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>

            <div className="stable-dog-name-row">
              <h3 className="stable-dog-name">{dog.name}</h3>
              <span className="stable-dog-rating">{dog.getOverallRating()}</span>
            </div>

            <div className="stable-dog-breed">
              LEVEL {dog.level || 1}, {dog.getAgeInYears()} JAHRE
            </div>

            <div className="stable-dog-stats">
              <div className="stable-stat-row">
                <span className="stable-stat-label">GESCHWINDIGKEIT</span>
                <span className="stable-stat-value">{dog.speed}</span>
              </div>
              <div className="stable-stat-row">
                <span className="stable-stat-label">AUSDAUER</span>
                <span className="stable-stat-value">{dog.stamina}</span>
              </div>
              <div className="stable-stat-row">
                <span className="stable-stat-label">BESCHLEUNIGUNG</span>
                <span className="stable-stat-value">{dog.acceleration}</span>
              </div>
              <div className="stable-stat-row">
                <span className="stable-stat-label">FOKUS</span>
                <span className="stable-stat-value">{dog.focus}</span>
              </div>
              <div
                className="stable-stat-row"
                title={`Fitness: ${dog.fitness} - Performance ca. ${getPerformancePercent(dog.fitness)}%`}
                style={{ cursor: 'help' }}
              >
                <span className="stable-stat-label">FITNESS</span>
                <span className="stable-stat-value">{dog.fitness}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="stable-expand-section">
        <button className="btn-tab btn-tab-large">
          <span>AUSBAUEN</span>
        </button>
      </div>
    </div>
  );
}
