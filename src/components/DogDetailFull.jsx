import { getDogImage } from '../utils/assetLoader';

export default function DogDetailFull({ dog, player, allDogs, gameState, setGameState, onClose, isRaceView = false, isPlayerDog = true }) {
  
  const currentDogIndex = allDogs.findIndex(d => d.id === dog.id);
  
  const goToPrevious = () => {
    if (currentDogIndex > 0) {
      const prevDog = allDogs[currentDogIndex - 1];
      onClose();
      setTimeout(() => {
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
    onClose();
    const event = new CustomEvent('changeView', { detail: 'training' });
    window.dispatchEvent(event);
  };
  
  // Calculate stats
  const currentValue = dog.getValue();
  const purchasePrice = dog.purchasePrice || currentValue;
  const winRate = dog.races > 0 ? Math.round((dog.wins / dog.races) * 100) : 0;
  const ageCategory = dog.getAgeCategoryName();
  
  return (
    <div className="detail-overlay-mockup" onClick={onClose}>
      <div className="detail-container-mockup" onClick={(e) => e.stopPropagation()}>
        
        {/* Close button */}
        <button className="detail-close-btn" onClick={onClose}>✕</button>
        
        {/* Top Section: Name + Age + Rating */}
        <div className="detail-header-mockup">
          <div className="detail-name-section">
            <h1 className="detail-name-mockup">{dog.name}</h1>
            <div className="detail-subtitle-mockup">
              {dog.breed}, {dog.getAgeInYears()} Jahre
            </div>
          </div>
          <div className="detail-rating-mockup">
            <div className="rating-number-mockup">{dog.getOverallRating()}</div>
            <div className="rating-label-mockup">{ageCategory}</div>
          </div>
        </div>
        
        {/* Main Content Grid */}
        <div className="detail-grid-mockup">
          
          {/* Left Column: Dog Image */}
          <div className="detail-left-mockup">
            <div className="dog-image-large">
              <img src={getDogImage(dog.imageNumber)} alt={dog.name} />
            </div>
          </div>
          
          {/* Middle Column: Attributes */}
          <div className="detail-middle-mockup">
            <h3 className="detail-section-title">ATTRIBUTE</h3>
            <div className="attributes-mockup">
              {[
                { key: 'speed', label: 'GESCHWINDIGKEIT', value: dog.speed },
                { key: 'stamina', label: 'AUSDAUER', value: dog.stamina },
                { key: 'acceleration', label: 'BESCHLEUNIGUNG', value: dog.acceleration },
                { key: 'focus', label: 'FOKUS', value: dog.focus },
                { key: 'fitness', label: 'FITNESS', value: dog.fitness, isFitness: true }
              ].map(attr => (
                <div key={attr.key} className="attribute-row-mockup">
                  <div className="attribute-label-mockup">{attr.label}</div>
                  <div className="attribute-bar-wrapper">
                    <div className="attribute-bar-bg-mockup">
                      <div 
                        className={`attribute-bar-fill-mockup ${attr.isFitness && attr.value < 50 ? 'low-fitness' : ''}`}
                        style={{ width: `${attr.value}%` }}
                      />
                    </div>
                    <div className="attribute-value-mockup">{attr.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Right Column: Statistics */}
          <div className="detail-right-mockup">
            <h3 className="detail-section-title">STATISTIKEN</h3>
            <div className="stats-list-mockup">
              <div className="stat-row-mockup">
                <div className="stat-label-mockup">RENNEN</div>
                <div className="stat-value-mockup">{dog.races}</div>
              </div>
              <div className="stat-row-mockup">
                <div className="stat-label-mockup">SIEGE</div>
                <div className="stat-value-mockup">{dog.wins}</div>
              </div>
              <div className="stat-row-mockup">
                <div className="stat-label-mockup">PREISGELDER</div>
                <div className="stat-value-mockup highlight">{dog.totalEarnings.toLocaleString('de-DE')} €</div>
              </div>
              <div className="stat-row-mockup">
                <div className="stat-label-mockup">EINKAUFSPREIS</div>
                <div className="stat-value-mockup">{purchasePrice.toLocaleString('de-DE')} €</div>
              </div>
              <div className="stat-row-mockup">
                <div className="stat-label-mockup">AKTUELLER WERT</div>
                <div className="stat-value-mockup highlight">{currentValue.toLocaleString('de-DE')} €</div>
              </div>
            </div>
          </div>
          
        </div>
        
        {/* Bottom Actions */}
        {isPlayerDog && !isRaceView && (
          <div className="detail-actions-mockup">
            <button className="btn-tab btn-tab-large" onClick={handleTrain}>
              <span>TRAINIEREN</span>
            </button>
            <button className="btn-tab btn-tab-large" onClick={handleSell}>
              <span>VERKAUFEN</span>
            </button>
          </div>
        )}
        
        {/* Navigation arrows (optional - keeping from original) */}
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
