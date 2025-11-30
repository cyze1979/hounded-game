import { useState } from 'react';
import DogDetailFull from './DogDetailFull';
import { getDogImage } from '../utils/assetLoader';

export default function Stable({ player, gameState, setGameState }) {
  const [selectedDog, setSelectedDog] = useState(null);
  
  if (player.dogs.length === 0) {
    return (
      <div className="stable-view">
        <div className="empty-state">
          <div className="empty-state-icon">🐕</div>
          <h2>Noch keine Hunde im Stall</h2>
          <p>Gehe zum Hundemarkt und kaufe deinen ersten Rennhund!</p>
        </div>
      </div>
    );
  }
  
  return (
    <>
      {!selectedDog && (
        <div className="stable-view">
          <h2>Mein Rennstall</h2>
          <p>Deine Hunde ({player.dogs.length}/{gameState.stableLimit})</p>
          
          <div className="dog-grid">
            {player.dogs.map(dog => (
              <div 
                key={dog.id} 
                className="dog-card dog-card-clickable"
                onClick={() => setSelectedDog(dog)}
              >
                <div className="dog-icon">
                  <img 
                    src={getDogImage(dog.imageNumber)} 
                    alt={dog.name}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
                
                {/* Header with Name & Rating */}
                <div className="dog-card-header">
                  <div className="dog-card-title">
                    <h3>{dog.name}</h3>
                    <p className="dog-breed">{dog.breed} • {dog.age} Jahre</p>
                  </div>
                  <div className="dog-card-rating">
                    <span className="rating-number">{dog.getOverallRating()}</span>
                  </div>
                </div>
                
                {/* Stats - 5 Attributes (with Fitness) */}
                <div className="dog-card-stats">
                  <div className="card-stat-row">
                    <span className="card-stat-label">Geschwindigkeit</span>
                    <span className="card-stat-value">{dog.speed}</span>
                  </div>
                  <div className="card-stat-row">
                    <span className="card-stat-label">Ausdauer</span>
                    <span className="card-stat-value">{dog.stamina}</span>
                  </div>
                  <div className="card-stat-row">
                    <span className="card-stat-label">Beschleunigung</span>
                    <span className="card-stat-value">{dog.acceleration}</span>
                  </div>
                  <div className="card-stat-row">
                    <span className="card-stat-label">Fokus</span>
                    <span className="card-stat-value">{dog.focus}</span>
                  </div>
                  <div className="card-stat-row">
                    <span className="card-stat-label">Fitness</span>
                    <span className="card-stat-value card-stat-fitness">{dog.fitness}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {selectedDog && (
        <DogDetailFull 
          dog={selectedDog} 
          player={player}
          allDogs={player.dogs}
          gameState={gameState}
          setGameState={setGameState}
          onClose={() => setSelectedDog(null)} 
        />
      )}
    </>
  );
}
