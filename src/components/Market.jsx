import { getDogImage } from '../utils/assetLoader';
import { Dog } from '../models/Dog';
import { dogNames, dogBreeds } from '../data/dogData';

export default function Market({ player, marketDogs, stableLimit, gameState, setGameState }) {
  
  const buyDog = (dog) => {
    if (player.dogs.length >= stableLimit) {
      alert(`Rennstall voll! Maximal ${stableLimit} Hunde erlaubt.`);
      return;
    }
    
    if (player.money < dog.price) {
      alert('Nicht genug Geld!');
      return;
    }
    
    // Update player money and add dog
    player.money -= dog.price;
    dog.owner = player;
    player.dogs.push(dog);
    
    // Remove from market and add new dog
    const newMarketDogs = gameState.marketDogs.filter(d => d.id !== dog.id);
    
    // Generate replacement dog
    const name = dogNames[Math.floor(Math.random() * dogNames.length)];
    const breed = dogBreeds[Math.floor(Math.random() * dogBreeds.length)];
    newMarketDogs.push(new Dog(name, breed));
    
    setGameState({
      ...gameState,
      marketDogs: newMarketDogs
    });
  };
  
  const slotColor = player.dogs.length >= stableLimit ? '#f56565' : '#48bb78';
  
  return (
    <div className="market-view">
      <h2>Hundemarkt</h2>
      <p style={{marginBottom: '20px', color: '#718096'}}>
        Kaufe neue Rennhunde für deinen Stall{' '}
        <span style={{fontWeight: 'bold', color: slotColor}}>
          ({player.dogs.length}/{stableLimit} Plätze belegt)
        </span>
      </p>
      
      <div className="dog-grid">
        {marketDogs.map(dog => (
          <div key={dog.id} className="dog-card">
            <div className="dog-icon">
              <img 
                src={getDogImage(dog.imageNumber)} 
                alt={dog.name}
                style={{width: '100%', height: 'auto', maxWidth: '200px'}}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <div style={{fontSize: '4em', display: 'none'}}>🐕</div>
            </div>
            <h3>{dog.name}</h3>
            <p className="dog-breed">{dog.breed}</p>
            <p className="dog-gender">{dog.gender === 'männlich' ? '♂️' : '♀️'} {dog.age} Jahre</p>
            <p className="dog-trait">{dog.specialTrait}</p>
            
            <div className="dog-attributes">
              <div className="attr-row">
                <span>Geschwindigkeit:</span>
                <span className="attr-value">{dog.speed}</span>
              </div>
              <div className="attr-row">
                <span>Ausdauer:</span>
                <span className="attr-value">{dog.stamina}</span>
              </div>
              <div className="attr-row">
                <span>Beschleunigung:</span>
                <span className="attr-value">{dog.acceleration}</span>
              </div>
              <div className="attr-row">
                <span>Fokus:</span>
                <span className="attr-value">{dog.focus}</span>
              </div>
            </div>
            
            <div className="dog-rating" style={{marginTop: '15px'}}>
              <span className="rating-number">{dog.getOverallRating()}</span>
              <span className="rating-label">Wertung</span>
            </div>
            
            <div className="dog-price">
              <span className="price-label">Preis:</span>
              <span className="price-amount">{dog.price}€</span>
            </div>
            
            <button 
              className="btn btn-success"
              onClick={() => buyDog(dog)}
              disabled={player.money < dog.price || player.dogs.length >= stableLimit}
            >
              {player.money < dog.price ? 'Zu teuer' : 'Kaufen'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
