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
      <h1 className="display-lg" style={{marginBottom: '8px'}}>HUNDEMARKT</h1>
      <div className="label-md" style={{color: '#9d9d9d'}}>
        Verfügbare Hunde zum Kauf
      </div>

      <div className="dog-grid-stable">
        {marketDogs.map(dog => {
          const price = dog.getValue();
          const canAfford = player.money >= price;
          const hasSpace = player.dogs.length < stableLimit;
          const canBuy = canAfford && hasSpace;

          return (
            <div key={dog.id} className="stable-dog-card">
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
              </div>

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
