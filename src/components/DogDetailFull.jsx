import { useEffect } from 'react';
import { getDogImage } from '../utils/assetLoader';

export default function DogDetailFull({ dog, player, allDogs, gameState, setGameState, onClose, isRaceView = false, isPlayerDog = true }) {

  const currentDogIndex = allDogs.findIndex(d => d.id === dog.id);

  const handleRest = () => {
    const result = dog.rest();
    if (result.success) {
      setGameState({...gameState});
    }
    alert(result.message);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const goToPrevious = () => {
    const prevIndex = currentDogIndex > 0 ? currentDogIndex - 1 : allDogs.length - 1;
    const prevDog = allDogs[prevIndex];
    onClose();
    setTimeout(() => {
      const event = new CustomEvent('showDogDetail', { detail: prevDog });
      window.dispatchEvent(event);
    }, 10);
  };

  const goToNext = () => {
    const nextIndex = currentDogIndex < allDogs.length - 1 ? currentDogIndex + 1 : 0;
    const nextDog = allDogs[nextIndex];
    onClose();
    setTimeout(() => {
      const event = new CustomEvent('showDogDetail', { detail: nextDog });
      window.dispatchEvent(event);
    }, 10);
  };
  
  const handleSell = () => {
    if (window.confirm(`${dog.name} für ${dog.getValue().toLocaleString('de-DE')}€ verkaufen?`)) {
      player.money += dog.getValue();
      player.dogs = player.dogs.filter(d => d.id !== dog.id);
      setGameState({...gameState});
      onClose();
    }
  };

  const handleSpendPoint = (attribute) => {
    if (!dog.spendAttributePoint) return;

    const result = dog.spendAttributePoint(attribute);
    if (result.success) {
      setGameState({...gameState});
    }
  };
  
  // Calculate stats
  const currentValue = dog.getValue();
  const purchasePrice = dog.purchasePrice || currentValue;
  const ageCategory = dog.getAgeCategoryName();
  
  const showNavigation = allDogs && allDogs.length > 1;

  return (
    <div className="dog-detail-view">

      {/* Navigation Arrows */}
      {showNavigation && (
        <>
          <button
            className="detail-nav-arrow detail-nav-left"
            onClick={goToPrevious}
          >
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <path d="M25 10L15 20L25 30" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button
            className="detail-nav-arrow detail-nav-right"
            onClick={goToNext}
          >
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <path d="M15 10L25 20L15 30" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </>
      )}

      {/* Top Section: Name + Level + Age + XP Bar + Rating */}
      <div className="detail-hero">
        <div className="detail-name-section">
          <h1 className="display-lg">{dog.name}</h1>
          <div className="detail-level-age">
            <div className="label-md">
              {dog.getAgeInYears()} JAHRE • LEVEL {dog.level || 1}
            </div>
            <div className="detail-xp-bar">
              <div className="xp-bar-container">
                <div
                  className="xp-bar-fill"
                  style={{
                    width: `${((dog.xp || 0) / (dog.getXpForNextLevel ? dog.getXpForNextLevel() : 100)) * 100}%`
                  }}
                />
              </div>
            </div>
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
          <h3 className="heading-sm">
            ATTRIBUTE
            {dog.availablePoints > 0 && ` (${dog.availablePoints} ${dog.availablePoints === 1 ? 'PUNKT' : 'PUNKTE'} VERFÜGBAR)`}
          </h3>
          <div className="attributes-list">
            {[
              { key: 'speed', label: 'GESCHWINDIGKEIT', value: dog.speed, upgradable: true },
              { key: 'stamina', label: 'AUSDAUER', value: dog.stamina, upgradable: true },
              { key: 'acceleration', label: 'BESCHLEUNIGUNG', value: dog.acceleration, upgradable: true },
              { key: 'focus', label: 'FOKUS', value: dog.focus, upgradable: true },
              { key: 'fitness', label: 'FITNESS', value: dog.fitness, isFitness: true, upgradable: false }
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
                  {attr.upgradable && isPlayerDog && (
                    <button
                      className={`btn-attribute-plus ${dog.availablePoints > 0 && attr.value < 100 ? '' : 'disabled'}`}
                      onClick={() => handleSpendPoint(attr.key)}
                      disabled={dog.availablePoints <= 0 || attr.value >= 100}
                    >
                      +
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Fitness Warnings */}
          {isPlayerDog && (
            <div style={{ marginTop: '20px' }}>
              {dog.fitness < 50 && (
                <div style={{ color: '#ef4444', fontSize: '0.9em', padding: '10px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '4px' }}>
                  ⚠️ Dein Hund ist erschöpft! Performance stark reduziert (-20% bis -30%)
                </div>
              )}
              {dog.fitness >= 50 && dog.fitness < 80 && (
                <div style={{ color: '#f59e0b', fontSize: '0.9em', padding: '10px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '4px' }}>
                  ⚠️ Dein Hund könnte fitter sein. Performance leicht reduziert (-5% bis -15%)
                </div>
              )}
              {dog.fitness >= 80 && (
                <div style={{ color: '#10b981', fontSize: '0.9em', padding: '10px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '4px' }}>
                  ✓ Dein Hund ist in Topform! Volle Performance!
                </div>
              )}
            </div>
          )}
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
          <button className="btn-tab btn-tab-large" onClick={handleRest}>
            <span>AUSRUHEN (+30 FITNESS)</span>
          </button>
          <button className="btn-tab btn-tab-large" onClick={handleSell}>
            <span>VERKAUFEN</span>
          </button>
        </div>
      )}
      
    </div>
  );
}
