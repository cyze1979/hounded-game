import { getDogImage } from '../utils/assetLoader';

export default function DogDetailFull({ dog, player, allDogs, gameState, setGameState, onClose, isRaceView = false, isPlayerDog = true }) {
  
  const currentDogIndex = allDogs.findIndex(d => d.id === dog.id);
  
  const goToPrevious = () => {
    if (currentDogIndex > 0) {
      const prevDog = allDogs[currentDogIndex - 1];
      onClose();
      setTimeout(() => {
        // This is a hack - ideally we'd have a prop to change dog
        const event = new CustomEvent('showDogDetail', { detail: prevDog });
        window.dispatchEvent(event);
      }, 10);
    }
  };
  
  const goToNext = () => {
    if (currentDogIndex < allDogs.length - 1) {
      const nextDog = allDogs[currentDogIndex + 1];
      onClose();
      setTimeout(() => {
        const event = new CustomEvent('showDogDetail', { detail: nextDog });
        window.dispatchEvent(event);
      }, 10);
    }
  };
  
  const handleSell = () => {
    if (window.confirm(`${dog.name} für ${dog.getValue().toLocaleString('de-DE')}€ verkaufen?`)) {
      player.money += dog.getValue();
      player.dogs = player.dogs.filter(d => d.id !== dog.id);
      setGameState({...gameState});
      onClose();
    }
  };
  
  const handleTrain = () => {
    // Close detail and switch to training view
    onClose();
    // Dispatch event to change view to training
    const event = new CustomEvent('changeView', { detail: 'training' });
    window.dispatchEvent(event);
  };
  
  // Calculate value change
  const currentValue = dog.getValue();
  const purchasePrice = dog.purchasePrice || currentValue; // Fallback for old dogs
  const valueDelta = currentValue - purchasePrice;
  const valuePercent = purchasePrice > 0 ? Math.round((valueDelta / purchasePrice) * 100) : 0;
  
  // Calculate win rate
  const winRate = dog.races > 0 ? Math.round((dog.wins / dog.races) * 100) : 0;
  
  // Age category info
  const ageCategory = dog.getAgeCategoryName();
  const trainingEfficiency = dog.getTrainingEfficiency();
  const racingPenalty = dog.getRacingPenalty();
  
  const trainingEfficiencyText = trainingEfficiency === 1.0 ? '+0% (Normal)' :
                                  trainingEfficiency > 1.0 ? `+${Math.round((trainingEfficiency - 1) * 100)}% (Bonus!)` :
                                  `${Math.round((trainingEfficiency - 1) * 100)}% (Malus)`;
  
  const racingBonusText = racingPenalty === 1.0 ? '+0% (Peak Performance)' :
                          racingPenalty > 1.0 ? `+${Math.round((racingPenalty - 1) * 100)}% (Bonus!)` :
                          `${Math.round((racingPenalty - 1) * 100)}% (Malus)`;
  
  return (
    <div className="overlay" onClick={onClose}>
      <div className="dog-detail-full" onClick={(e) => e.stopPropagation()}>
        
        {/* Header with navigation */}
        <div className="detail-header">
          <button className="btn-nav" onClick={onClose}>←</button>
          <div className="detail-title-section">
            <h2 className="detail-name">{dog.name}</h2>
            <div className="detail-meta">
              <span>{dog.breed}</span>
              <span>•</span>
              <span>{dog.getAgeInYears()} Jahre</span>
              <span>•</span>
              <span>{ageCategory}</span>
            </div>
          </div>
          <div className="detail-rating">
            <div className="rating-label">Rating</div>
            <div className="rating-value">{dog.getOverallRating()}</div>
          </div>
        </div>
        
        {/* Main content grid */}
        <div className="detail-content">
          
          {/* Left: Image & Attributes */}
          <div className="detail-left">
            <div className="detail-image-container">
              <img src={getDogImage(dog.imageNumber)} alt={dog.name} className="detail-image" />
            </div>
            
            <div className="detail-section">
              <h3 className="section-title">ATTRIBUTE</h3>
              <div className="attribute-list">
                {[
                  { label: 'Speed', icon: '⚡', value: dog.speed },
                  { label: 'Stamina', icon: '💪', value: dog.stamina },
                  { label: 'Acceleration', icon: '🚀', value: dog.acceleration },
                  { label: 'Focus', icon: '🎯', value: dog.focus },
                  { label: 'Fitness', icon: '❤️', value: dog.fitness }
                ].map(attr => (
                  <div key={attr.label} className="attribute-row">
                    <div className="attribute-label">
                      <span className="attribute-icon">{attr.icon}</span>
                      <span>{attr.label}</span>
                    </div>
                    <div className="attribute-bar-container">
                      <div className="attribute-bar-bg">
                        <div 
                          className="attribute-bar-fill"
                          style={{ width: `${attr.value}%` }}
                        />
                      </div>
                      <span className="attribute-value">{attr.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Right: Stats & Info */}
          <div className="detail-right">
            
            {/* Value Section */}
            <div className="detail-section">
              <h3 className="section-title">WERT</h3>
              <div className="value-info">
                <div className="value-row">
                  <span className="value-label">Gekauft für:</span>
                  <span className="value-amount">{purchasePrice.toLocaleString('de-DE')}€</span>
                </div>
                <div className="value-row value-current">
                  <span className="value-label">Aktuell:</span>
                  <span className="value-amount-big">{currentValue.toLocaleString('de-DE')}€</span>
                </div>
                {valueDelta !== 0 && (
                  <div className={`value-delta ${valueDelta > 0 ? 'positive' : 'negative'}`}>
                    {valueDelta > 0 ? '↗️' : '↘️'} {valueDelta > 0 ? '+' : ''}{valueDelta.toLocaleString('de-DE')}€ ({valuePercent > 0 ? '+' : ''}{valuePercent}%)
                  </div>
                )}
              </div>
            </div>
            
            {/* Career Stats */}
            <div className="detail-section">
              <h3 className="section-title">KARRIERE STATISTIKEN</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-label">Rennen</div>
                  <div className="stat-value">{dog.races}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Win Rate</div>
                  <div className="stat-value">{winRate}%</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Siege</div>
                  <div className="stat-value">{dog.wins}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Preisgelder</div>
                  <div className="stat-value">{dog.totalEarnings.toLocaleString('de-DE')}€</div>
                </div>
              </div>
            </div>
            
            {/* Age & Training */}
            <div className="detail-section">
              <h3 className="section-title">ALTER & TRAINING</h3>
              <div className="age-info">
                <div className="age-row">
                  <span className="age-icon">🎂</span>
                  <span>{dog.getAgeInYears()} Jahre ({ageCategory})</span>
                </div>
                <div className="age-row">
                  <span className="age-icon">📈</span>
                  <span>Training Effizienz: {trainingEfficiencyText}</span>
                </div>
                <div className="age-row">
                  <span className="age-icon">🏁</span>
                  <span>Racing Bonus: {racingBonusText}</span>
                </div>
              </div>
            </div>
            
          </div>
        </div>
        
        {/* Footer Actions */}
        {isPlayerDog && !isRaceView && (
          <div className="detail-actions">
            <button className="btn-action-detail btn-train" onClick={handleTrain}>
              TRAINIEREN
            </button>
            <button className="btn-action-detail btn-sell" onClick={handleSell}>
              VERKAUFEN FÜR {currentValue.toLocaleString('de-DE')}€
            </button>
          </div>
        )}
        
        {/* Navigation arrows */}
        {allDogs.length > 1 && (
          <>
            {currentDogIndex > 0 && (
              <button className="nav-arrow nav-prev" onClick={goToPrevious}>‹</button>
            )}
            {currentDogIndex < allDogs.length - 1 && (
              <button className="nav-arrow nav-next" onClick={goToNext}>›</button>
            )}
          </>
        )}
        
      </div>
    </div>
  );
}
