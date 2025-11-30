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
              
              <h3>{dog.name}</h3>
              <p className="dog-breed">{dog.breed}</p>
              <p className="dog-trait">{dog.specialTrait}</p>
              
              <div className="dog-rating">
                <span className="rating-number">{dog.getOverallRating()}</span>
                <span className="rating-label">Wertung</span>
              </div>
              
              <div className="dog-fitness">
                <div className="fitness-bar">
                  <div 
                    className="fitness-fill" 
                    style={{
                      width: `${dog.fitness}%`,
                      background: dog.fitness > 70 ? '#00D9FF' : dog.fitness > 40 ? '#ed8936' : '#f56565'
                    }}
                  />
                </div>
                <span className="fitness-label">Fitness: {dog.fitness}%</span>
              </div>
              
              {dog.races > 0 && (
                <div className="dog-stats-mini">
                  🏁 {dog.races} Rennen | 🏆 {dog.wins} Siege
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
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
