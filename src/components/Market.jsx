import { getDogImage } from '../utils/assetLoader';

export default function Market({ player, marketDogs, stableLimit, gameState, setGameState }) {
  
  const handleBuy = (dog) => {
    if (player.dogs.length >= stableLimit) {
      alert(`Dein Stall ist voll! Maximal ${stableLimit} Hunde erlaubt.`);
      return;
    }
    
    const price = dog.getValue();
    if (player.money < price) {
      alert('Nicht genug Geld!');
      return;
    }
    
    // Set purchase price for profit tracking
    dog.purchasePrice = price;
    
    player.money -= price;
    player.dogs.push(dog);
    gameState.marketDogs = gameState.marketDogs.filter(d => d.id !== dog.id);
    setGameState({...gameState});
  };
  
  return (
    <div className="market-view">
      <h2 className="heading-xl">HUNDEMARKT</h2>
      <p className="label-md" style={{marginBottom: '30px', color: 'var(--text-gray)'}}>
        Verfügbare Hunde zum Kauf
      </p>
      
      <div className="dog-grid">
        {marketDogs.map(dog => {
          const price = dog.getValue();
          const canAfford = player.money >= price;
          const hasSpace = player.dogs.length < stableLimit;
          const canBuy = canAfford && hasSpace;
          
          return (
            <div key={dog.id} className="dog-card">
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
                  <p className="dog-breed">{dog.breed} • {dog.getAgeInYears()} Jahre • {dog.getAgeCategoryName()}</p>
                </div>
                <div className="dog-card-rating">
                  <span className="rating-number">{dog.getOverallRating()}</span>
                </div>
              </div>
              
              {/* Stats - 4 Attributes (no Fitness) */}
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
              </div>
              
              {/* Price & Buy Button */}
              <div className="market-card-footer">
                <div className="dog-price">{price.toLocaleString('de-DE')} €</div>
                <button 
                  className="btn-tab btn-tab-market"
                  onClick={() => handleBuy(dog)}
                  disabled={!canBuy}
                >
                  <span>{!hasSpace ? 'STALL VOLL' : !canAfford ? 'ZU TEUER' : 'KAUFEN'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
