import { useState } from 'react';
import { getDogImage } from '../utils/assetLoader';

const TRAINER_TYPES = {
  amateur: {
    name: 'AMATEUR TRAINER',
    basePrice: 100,
    fitnessLoss: 15,
    minGain: 1,
    maxGain: 3,
    description: '+1 bis +3 Punkte'
  },
  pro: {
    name: 'PRO TRAINER',
    basePrice: 300,
    fitnessLoss: 10,
    minGain: 2,
    maxGain: 4,
    description: '+2 bis +4 Punkte'
  },
  elite: {
    name: 'ELITE TRAINER',
    basePrice: 750,
    fitnessLoss: 5,
    minGain: 3,
    maxGain: 5,
    description: '+3 bis +5 Punkte'
  }
};

export default function Training({ gameState, setGameState, getCurrentPlayer }) {
  const [selectedDog, setSelectedDog] = useState(null);
  const [selectedAttribute, setSelectedAttribute] = useState('speed');
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [trainingResult, setTrainingResult] = useState(null);
  
  const currentPlayer = getCurrentPlayer();
  
  const calculateTrainingCost = (dog, trainerType) => {
    if (!dog) return 0;
    
    const trainer = TRAINER_TYPES[trainerType];
    const currentValue = dog[selectedAttribute];
    const multiplier = 1 + (currentValue / 100);
    
    return Math.floor(trainer.basePrice * multiplier);
  };
  
  const calculateTrainingGain = (dog, trainerType) => {
    if (!dog) return 0;
    
    const trainer = TRAINER_TYPES[trainerType];
    const baseGain = trainer.minGain + Math.floor(Math.random() * (trainer.maxGain - trainer.minGain + 1));
    
    // Apply age efficiency
    const efficiency = dog.getTrainingEfficiency();
    const actualGain = Math.floor(baseGain * efficiency);
    
    return Math.max(1, actualGain); // Minimum 1 point
  };
  
  const canTrain = () => {
    if (!selectedDog || !selectedTrainer) return false;
    if (selectedDog.fitness < 30) return false;
    
    // Check if dog was already trained this month
    if (selectedDog.lastTrainedMonth === gameState.currentMonth) return false;
    
    const cost = calculateTrainingCost(selectedDog, selectedTrainer);
    if (currentPlayer.money < cost) return false;
    
    const currentValue = selectedDog[selectedAttribute];
    if (currentValue >= 100) return false;
    
    return true;
  };
  
  const startTraining = () => {
    if (!canTrain()) return;
    
    const trainer = TRAINER_TYPES[selectedTrainer];
    const cost = calculateTrainingCost(selectedDog, selectedTrainer);
    const gain = calculateTrainingGain(selectedDog, selectedTrainer);
    
    // Get old value
    const oldValue = selectedDog[selectedAttribute];
    
    // Apply training
    const newValue = Math.min(100, oldValue + gain);
    selectedDog[selectedAttribute] = newValue;
    
    // Reduce fitness
    selectedDog.fitness = Math.max(0, selectedDog.fitness - trainer.fitnessLoss);
    
    // Mark as trained this month
    selectedDog.lastTrainedMonth = gameState.currentMonth;

    // Add to training history
    if (!selectedDog.trainingHistory) {
      selectedDog.trainingHistory = [];
    }
    selectedDog.trainingHistory.push({
      month: gameState.currentMonth,
      year: gameState.currentYear,
      attribute: selectedAttribute,
      oldValue,
      newValue,
      gain,
      cost,
      trainer: selectedTrainer
    });

    // Deduct money
    currentPlayer.money -= cost;

    // Update game state
    setGameState({...gameState});
    
    // Show result
    setTrainingResult({
      dog: selectedDog.name,
      attribute: selectedAttribute,
      oldValue,
      newValue,
      gain,
      cost,
      fitnessLoss: trainer.fitnessLoss,
      newFitness: selectedDog.fitness
    });
    
    // Reset trainer selection
    setSelectedTrainer(null);
    
    // Auto-hide result after 5 seconds
    setTimeout(() => {
      setTrainingResult(null);
    }, 5000);
  };
  
  const getAttributeIcon = (attr) => {
    const icons = {
      speed: '⚡',
      stamina: '💪',
      acceleration: '🚀',
      focus: '🎯'
    };
    return icons[attr] || '';
  };
  
  const getAttributeName = (attr) => {
    const names = {
      speed: 'Speed',
      stamina: 'Stamina',
      acceleration: 'Acceleration',
      focus: 'Focus'
    };
    return names[attr] || attr;
  };
  
  return (
    <div className="training-view">
      <div className="training-header">
        <h1 className="display-lg" style={{marginBottom: '8px'}}>TRAINING</h1>
        <div className="label-md" style={{color: '#9d9d9d'}}>Verbessere die Attribute deiner Hunde</div>
      </div>

      {/* Dog Selection */}
      <div className="training-section">
        <h3 className="heading-md">WÄHLE HUND</h3>
        <div className="dog-grid-stable">
          {currentPlayer.dogs.map(dog => (
            <div
              key={dog.id}
              className={`stable-dog-card ${selectedDog?.id === dog.id ? 'training-selected' : ''}`}
              onClick={() => {
                setSelectedDog(dog);
                setTrainingResult(null);
              }}
            >
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
                {dog.breed.toUpperCase()}, {dog.getAgeInYears()} JAHRE
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
                <div className="stable-stat-row">
                  <span className="stable-stat-label">FITNESS</span>
                  <span className="stable-stat-value">{dog.fitness}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {selectedDog && (
        <>
          {/* Attribute Selection */}
          <div className="training-section">
            <h3 className="heading-md">WÄHLE ATTRIBUT</h3>
            <div className="attribute-selector">
              {['speed', 'stamina', 'acceleration', 'focus'].map(attr => (
                <div 
                  key={attr}
                  className={`attribute-option ${selectedAttribute === attr ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedAttribute(attr);
                    setSelectedTrainer(null);
                    setTrainingResult(null);
                  }}
                >
                  <div className="attribute-header">
                    <span className="attribute-icon">{getAttributeIcon(attr)}</span>
                    <span className="attribute-name">{getAttributeName(attr)}</span>
                  </div>
                  <div className="attribute-value-bar">
                    <div className="attribute-bar-bg">
                      <div 
                        className="attribute-bar-fill"
                        style={{width: `${selectedDog[attr]}%`}}
                      />
                    </div>
                    <span className="attribute-number">{selectedDog[attr]}/100</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Trainer Selection */}
          <div className="training-section">
            <h3 className="heading-md">WÄHLE TRAINER</h3>
            <div className="trainer-cards">
              {Object.entries(TRAINER_TYPES).map(([key, trainer]) => {
                const cost = calculateTrainingCost(selectedDog, key);
                const canAfford = currentPlayer.money >= cost;
                const isMaxed = selectedDog[selectedAttribute] >= 100;
                const isTooTired = selectedDog.fitness < 30;
                const alreadyTrainedThisMonth = selectedDog.lastTrainedMonth === gameState.currentMonth;
                
                return (
                  <div 
                    key={key}
                    className={`trainer-card ${selectedTrainer === key ? 'selected' : ''} ${!canAfford || isMaxed || isTooTired || alreadyTrainedThisMonth ? 'disabled' : ''}`}
                    onClick={() => {
                      if (canAfford && !isMaxed && !isTooTired && !alreadyTrainedThisMonth) {
                        setSelectedTrainer(key);
                        setTrainingResult(null);
                      }
                    }}
                  >
                    <div className="trainer-name">{trainer.name}</div>
                    <div className="trainer-stats">
                      <div className="trainer-stat">
                        <span className="stat-label">Gewinn:</span>
                        <span className="stat-value gain">{trainer.description}</span>
                      </div>
                      <div className="trainer-stat">
                        <span className="stat-label">Fitness:</span>
                        <span className="stat-value loss">-{trainer.fitnessLoss}</span>
                      </div>
                      <div className="trainer-stat">
                        <span className="stat-label">Kosten:</span>
                        <span className="stat-value cost">{cost}€</span>
                      </div>
                    </div>
                    {!canAfford && <div className="trainer-warning">Zu wenig Geld!</div>}
                    {isMaxed && <div className="trainer-warning">Attribut bereits maximal!</div>}
                    {isTooTired && <div className="trainer-warning">Hund zu müde! (Min. 30 Fitness)</div>}
                    {alreadyTrainedThisMonth && <div className="trainer-warning">Bereits diesen Monat trainiert!</div>}
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Training Button */}
          <div className="training-action">
            <button 
              className="btn-cta training-btn"
              onClick={startTraining}
              disabled={!canTrain()}
            >
              TRAINING STARTEN
            </button>
          </div>
          
          {/* Training Result */}
          {trainingResult && (
            <div className="training-result">
              <div className="result-title">✅ TRAINING ERFOLGREICH!</div>
              <div className="result-details">
                <div className="result-dog">{trainingResult.dog}</div>
                <div className="result-stat">
                  {getAttributeIcon(trainingResult.attribute)} {getAttributeName(trainingResult.attribute)}: 
                  <span className="old-value">{trainingResult.oldValue}</span>
                  <span className="arrow">→</span>
                  <span className="new-value">{trainingResult.newValue}</span>
                  <span className="gain">(+{trainingResult.gain})</span>
                </div>
                <div className="result-costs">
                  <div>💰 Kosten: {trainingResult.cost}€</div>
                  <div>❤️ Fitness: {trainingResult.newFitness}/100 (-{trainingResult.fitnessLoss})</div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
