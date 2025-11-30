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
              
              <h3>{dog.name}</h3>
              <p className="dog-breed">{dog.breed}</p>
              <p className="dog-trait">{dog.specialTrait}</p>
              
              <div className="dog-rating">
                <span className="rating-number">{dog.getOverallRating()}</span>
                <span className="rating-label">Wertung</span>
              </div>
              
              <div className="dog-price">{dog.price}€</div>
              
              <div className="dog-fitness">
                <div className="fitness-bar">
                  <div 
                    className="fitness-fill" 
                    style={{width: `${dog.fitness}%`}}
                  />
                </div>
                <span className="fitness-label">Fitness: {dog.fitness}%</span>
              </div>
              
              <button 
                className="btn btn-primary"
                onClick={() => handleBuy(dog)}
                disabled={!canBuy}
              >
                {!hasSpace ? 'Stall voll' : !canAfford ? 'Zu teuer' : 'Kaufen'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
