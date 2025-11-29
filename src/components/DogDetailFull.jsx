import { useState, useEffect } from 'react';
import { getDogImage, getBackground } from '../utils/assetLoader';

export default function DogDetailFull({ dog, player, allDogs, gameState, setGameState, onClose }) {
  const [currentDogIndex, setCurrentDogIndex] = useState(0);
  const [currentDog, setCurrentDog] = useState(dog);
  
  useEffect(() => {
    const index = allDogs.findIndex(d => d.id === dog.id);
    setCurrentDogIndex(index);
    setCurrentDog(allDogs[index]);
  }, [dog, allDogs]);
  
  const goToPrevious = () => {
    const newIndex = currentDogIndex > 0 ? currentDogIndex - 1 : allDogs.length - 1;
    setCurrentDogIndex(newIndex);
    setCurrentDog(allDogs[newIndex]);
  };
  
  const goToNext = () => {
    const newIndex = currentDogIndex < allDogs.length - 1 ? currentDogIndex + 1 : 0;
    setCurrentDogIndex(newIndex);
    setCurrentDog(allDogs[newIndex]);
  };
  
  const handleSell = () => {
    if (window.confirm(`Möchtest du ${currentDog.name} wirklich verkaufen?`)) {
      const sellPrice = Math.floor(currentDog.price * 0.7);
      player.money += sellPrice;
      player.dogs = player.dogs.filter(d => d.id !== currentDog.id);
      setGameState({...gameState});
      alert(`${currentDog.name} für ${sellPrice}€ verkauft!`);
      
      if (player.dogs.length === 0) {
        onClose();
      } else {
        const newIndex = currentDogIndex > 0 ? currentDogIndex - 1 : 0;
        setCurrentDogIndex(newIndex);
        setCurrentDog(player.dogs[newIndex]);
      }
    }
  };
  
  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);
  
  const genderIcon = currentDog.gender === 'männlich' ? '♂️' : '♀️';
  const overallRating = currentDog.getOverallRating();
  
  return (
    <div 
      className="dog-detail-full"
      style={{
        backgroundImage: `url(${getBackground('stable')})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="dog-detail-overlay">
        
        {/* Close Button */}
        <button className="detail-close-btn" onClick={onClose}>
          ✕
        </button>
        
        {/* Navigation Arrows */}
        {allDogs.length > 1 && (
          <>
            <button className="arrow-btn arrow-left" onClick={goToPrevious}>
              ❮
            </button>
            <button className="arrow-btn arrow-right" onClick={goToNext}>
              ❯
            </button>
          </>
        )}
        
        <div className="dog-detail-container">
          
          {/* Left Side - Stats */}
          <div className="dog-stats-section">
            
            {/* Header */}
            <div className="dog-header">
              <div className="dog-title">
                <h1 className="dog-name-xl">{currentDog.name.toUpperCase()}</h1>
                <p className="dog-breed-info">
                  {currentDog.breed.toUpperCase()}, {currentDog.age} JAHRE
                </p>
              </div>
              <div className="dog-rating-badge">
                <div className="rating-number-xl">{overallRating}</div>
                <div className="rating-trait">{currentDog.specialTrait.toUpperCase()}</div>
              </div>
            </div>
            
            <div className="divider"></div>
            
            {/* Stats */}
            <div className="dog-stats-bars">
              <div className="stat-bar-new">
                <div className="stat-label-new">GESCHWINDIGKEIT</div>
                <div className="stat-bar-container">
                  <div 
                    className="stat-bar-fill-new" 
                    style={{width: `${currentDog.speed}%`}}
                  />
                </div>
                <div className="stat-value-new">{currentDog.speed}</div>
              </div>
              
              <div className="stat-bar-new">
                <div className="stat-label-new">AUSDAUER</div>
                <div className="stat-bar-container">
                  <div 
                    className="stat-bar-fill-new" 
                    style={{width: `${currentDog.stamina}%`}}
                  />
                </div>
                <div className="stat-value-new">{currentDog.stamina}</div>
              </div>
              
              <div className="stat-bar-new">
                <div className="stat-label-new">BESCHLEUNIGUNG</div>
                <div className="stat-bar-container">
                  <div 
                    className="stat-bar-fill-new" 
                    style={{width: `${currentDog.acceleration}%`}}
                  />
                </div>
                <div className="stat-value-new">{currentDog.acceleration}</div>
              </div>
              
              <div className="stat-bar-new">
                <div className="stat-label-new">FOKUS</div>
                <div className="stat-bar-container">
                  <div 
                    className="stat-bar-fill-new" 
                    style={{width: `${currentDog.focus}%`}}
                  />
                </div>
                <div className="stat-value-new">{currentDog.focus}</div>
              </div>
              
              <div className="stat-bar-new">
                <div className="stat-label-new">FITNESS</div>
                <div className="stat-bar-container">
                  <div 
                    className="stat-bar-fill-new" 
                    style={{
                      width: `${currentDog.fitness}%`,
                      background: currentDog.fitness > 70 ? 'var(--cyan-primary)' : 
                                 currentDog.fitness > 40 ? '#ed8936' : '#f56565'
                    }}
                  />
                </div>
                <div className="stat-value-new">{currentDog.fitness}</div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="dog-actions">
              <button className="btn-tab" onClick={handleSell}>
                <span>VERKAUFEN</span>
              </button>
            </div>
            
          </div>
          
          {/* Vertical Divider */}
          <div className="vertical-divider"></div>
          
          {/* Right Side - Dog Image */}
          <div className="dog-image-section">
            <div className="dog-image-container">
              <img 
                src={getDogImage(currentDog.imageNumber)} 
                alt={currentDog.name}
                className="dog-image-large"
              />
            </div>
          </div>
          
        </div>
        
      </div>
    </div>
  );
}
