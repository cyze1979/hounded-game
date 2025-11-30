import { getDogImage } from '../utils/assetLoader';

export default function Market({ player, marketDogs, stableLimit, gameState, setGameState }) {
  
  const handleBuy = (dog) => {
    if (player.dogs.length >= stableLimit) {
      alert(`Dein Stall ist voll! Maximal ${stableLimit} Hunde erlaubt.`);
      return;
    }
    
    if (player.money < dog.price) {
      alert('Nicht genug Geld!');
      return;
    }
    
    player.money -= dog.price;
    player.dogs.push(dog);
    gameState.marketDogs = gameState.marketDogs.filter(d => d.id !== dog.id);
    setGameState({...gameState});
  };
  
  return (
    <div className="market-view">
      <h2>Hundemarkt</h2>
      <p>Verfügbare Hunde zum Kauf</p>
      
      <div className="dog-grid">
        {marketDogs.map(dog => {
          const canAfford = player.money >= dog.price;
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
                  <p className="dog-breed">{dog.breed}</p>
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
                <div className="dog-price">{dog.price.toLocaleString('de-DE')} €</div>
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
