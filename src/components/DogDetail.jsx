import { trainers } from '../data/trainers';

export default function DogDetail({ dog, player, gameState, setGameState, onClose }) {
  
  const handleCare = (type) => {
    const result = type === 'rest' ? dog.rest() : dog.feed(type);
    
    if (result.success) {
      setGameState({...gameState}); // Trigger re-render
      alert(result.message);
    } else {
      alert(result.message);
    }
  };
  
  const handleTrainer = (trainerId) => {
    const result = dog.assignTrainer(trainerId, trainers, gameState.gameDay);
    
    if (result.success) {
      setGameState({...gameState}); // Trigger re-render
      alert(result.message);
    } else {
      alert(result.message);
    }
  };
  
  const genderIcon = dog.gender === 'männlich' ? '♂️' : '♀️';
  const winRate = dog.races > 0 ? ((dog.wins / dog.races) * 100).toFixed(1) : 0;
  
  return (
    <div className="dog-detail-modal" onClick={onClose}>
      <div className="dog-detail-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>✕</button>
        
        <div className="dog-detail-header" style={{borderBottom: `3px solid ${player.color}`}}>
          <div className="dog-detail-icon">🐕</div>
          <div>
            <h2>{dog.name} {genderIcon}</h2>
            <p style={{color: '#718096', margin: '5px 0'}}>{dog.breed} • {dog.age} Jahre</p>
            <p style={{color: '#a0aec0', fontStyle: 'italic', fontSize: '0.95em'}}>{dog.specialTrait}</p>
          </div>
          <div className="dog-detail-rating">
            <div style={{fontSize: '2em', fontWeight: 'bold', color: player.color}}>{dog.getOverallRating()}</div>
            <div style={{fontSize: '0.9em', color: '#718096'}}>Gesamtwertung</div>
          </div>
        </div>
        
        <div className="dog-detail-body">
          {/* Stats */}
          <div className="detail-section">
            <h3>📊 Karriere-Statistiken</h3>
            <div className="stats-grid">
              <div className="stat-box">
                <div className="stat-number">{dog.races}</div>
                <div className="stat-label">Rennen</div>
              </div>
              <div className="stat-box">
                <div className="stat-number">{dog.wins}</div>
                <div className="stat-label">Siege</div>
              </div>
              <div className="stat-box">
                <div className="stat-number">{winRate}%</div>
                <div className="stat-label">Siegrate</div>
              </div>
              <div className="stat-box">
                <div className="stat-number">{dog.experience}</div>
                <div className="stat-label">Erfahrung</div>
              </div>
            </div>
          </div>
          
          {/* Attributes */}
          <div className="detail-section">
            <h3>⚡ Attribute & Zustand</h3>
            <div className="dog-stats">
              {[
                {label: 'Geschwindigkeit', value: dog.speed, color: player.color},
                {label: 'Ausdauer', value: dog.stamina, color: player.color},
                {label: 'Beschleunigung', value: dog.acceleration, color: player.color},
                {label: 'Fokus', value: dog.focus, color: player.color},
                {label: 'Fitness', value: dog.fitness, color: dog.fitness > 70 ? '#48bb78' : dog.fitness > 40 ? '#ed8936' : '#f56565'}
              ].map(attr => (
                <div key={attr.label} className="stat-row">
                  <span className="stat-label-detail">{attr.label}</span>
                  <div className="stat-bar">
                    <div className="stat-bar-fill" style={{width: `${attr.value}%`, background: attr.color}} />
                    <span className="stat-value">{attr.value}</span>
                  </div>
                </div>
              ))}
            </div>
            {dog.fitness < 30 && <p style={{color: '#f56565', marginTop: '10px'}}>⚠️ Dein Hund braucht dringend Ruhe!</p>}
            {dog.fitness > 90 && <p style={{color: '#48bb78', marginTop: '10px'}}>✓ Dein Hund ist in Topform!</p>}
          </div>
          
          {/* Trainer */}
          <div className="detail-section">
            <h3>👨‍🏫 Trainer</h3>
            {dog.trainer ? (
              <div className="current-trainer">
                <p>Aktueller Trainer: <strong>{dog.trainer.icon} {dog.trainer.name}</strong></p>
                <p style={{fontSize: '0.9em', color: '#718096'}}>
                  Boni: +{dog.trainer.bonuses.speed} Speed, +{dog.trainer.bonuses.stamina} Ausdauer, 
                  +{dog.trainer.bonuses.acceleration} Beschl., +{dog.trainer.bonuses.focus} Fokus
                </p>
              </div>
            ) : (
              <>
                <p style={{color: '#718096', marginBottom: '15px'}}>Wähle einen Trainer für {dog.name}</p>
                <div className="trainer-grid">
                  {trainers.map(trainer => (
                    <div 
                      key={trainer.id} 
                      className="trainer-card"
                      onClick={() => handleTrainer(trainer.id)}
                    >
                      <div className="trainer-icon">{trainer.icon}</div>
                      <h4>{trainer.name}</h4>
                      <div className="trainer-specialty">{trainer.specialty}</div>
                      <div className="trainer-desc">{trainer.description}</div>
                      <div className="trainer-bonuses">
                        {Object.entries(trainer.bonuses).map(([key, value]) => 
                          value > 0 && <span key={key}>+{value} {key.substring(0, 3)}</span>
                        )}
                      </div>
                      <div className="trainer-cost">{trainer.cost}€</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
          
          {/* Care */}
          <div className="detail-section">
            <h3>🏥 Pflege</h3>
            <div className="action-buttons">
              <button className="btn btn-success" onClick={() => handleCare('rest')}>
                😴 Ausruhen<br/><small>Kostenlos, +30 Fitness</small>
              </button>
              <button className="btn btn-success" onClick={() => handleCare('basic')} disabled={player.money < 20}>
                🍖 Basis-Futter<br/><small>20€, +10 Fitness</small>
              </button>
              <button className="btn btn-success" onClick={() => handleCare('premium')} disabled={player.money < 50}>
                🥩 Premium-Futter<br/><small>50€, +20 Fitness</small>
              </button>
              <button className="btn btn-success" onClick={() => handleCare('deluxe')} disabled={player.money < 100}>
                🍗 Deluxe-Menü<br/><small>100€, +30 Fitness</small>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
