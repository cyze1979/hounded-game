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
  const ageCategory = dog.getAgeCategoryName();
  
  return (
    <div className="dog-detail-view">
      
      {/* Top Section: Name + Age + Rating */}
      <div className="detail-hero">
        <div className="detail-name-section">
          <h1 className="display-lg">{dog.name}</h1>
          <div className="label-md">
            {dog.breed}, {dog.getAgeInYears()} Jahre
          </div>
        </div>
        <div className="detail-rating-badge">
          <div className="display-lg">{dog.getOverallRating()}</div>
          <div className="label-md">{ageCategory}</div>
        </div>
      </div>
      
      {/* Main Content Grid */}
      <div className="detail-content-grid">
        
        {/* Left Column: Dog Image */}
        <div className="detail-image-column">
          <div className="dog-portrait">
            <img src={getDogImage(dog.imageNumber)} alt={dog.name} />
          </div>
        </div>
        
        {/* Middle Column: Attributes */}
        <div className="detail-attributes-column">
          <h3 className="heading-sm">ATTRIBUTE</h3>
          <div className="attributes-list">
            {[
              { key: 'speed', label: 'GESCHWINDIGKEIT', value: dog.speed },
              { key: 'stamina', label: 'AUSDAUER', value: dog.stamina },
              { key: 'acceleration', label: 'BESCHLEUNIGUNG', value: dog.acceleration },
              { key: 'focus', label: 'FOKUS', value: dog.focus },
              { key: 'fitness', label: 'FITNESS', value: dog.fitness, isFitness: true }
            ].map(attr => (
              <div key={attr.key} className="stat-bar-row">
                <div className="label-sm">{attr.label}</div>
                <div className="stat-bar-group">
                  <div className="stat-bar-container-new">
                    <div 
                      className={`stat-bar-fill-new ${attr.isFitness && attr.value < 50 ? 'bar-red' : 'bar-cyan'}`}
                      style={{ width: `${attr.value}%` }}
                    />
                  </div>
                  <div className="text-lg">{attr.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Right Column: Statistics with Scrollbar */}
        <div className="detail-stats-column">
          <h3 className="heading-sm">STATISTIKEN</h3>
          <div className="stats-scrollable">
            <div className="stat-item-row">
              <div className="label-sm">RENNEN</div>
              <div className="text-lg">{dog.races}</div>
            </div>
            <div className="stat-item-row">
              <div className="label-sm">SIEGE</div>
              <div className="text-lg">{dog.wins}</div>
            </div>
            <div className="stat-item-row">
              <div className="label-sm">PREISGELDER</div>
              <div className="text-lg">{dog.totalEarnings.toLocaleString('de-DE')} €</div>
            </div>
            <div className="stat-item-row">
              <div className="label-sm">EINKAUFSPREIS</div>
              <div className="text-lg">{purchasePrice.toLocaleString('de-DE')} €</div>
            </div>
            <div className="stat-item-row">
              <div className="label-sm">AKTUELLER WERT</div>
              <div className="text-lg">{currentValue.toLocaleString('de-DE')} €</div>
            </div>
          </div>
        </div>
        
      </div>
      
      {/* Bottom Actions */}
      {isPlayerDog && !isRaceView && (
        <div className="detail-bottom-actions">
          <button className="btn-tab btn-tab-large" onClick={handleTrain}>
            <span>TRAINIEREN</span>
          </button>
          <button className="btn-tab btn-tab-large" onClick={handleSell}>
            <span>VERKAUFEN</span>
          </button>
        </div>
      )}
      
    </div>
  );
}
