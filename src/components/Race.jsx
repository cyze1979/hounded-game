import { useState, useEffect } from 'react';
import { Dog } from '../models/Dog';
import { dogNames, dogBreeds, AI_OWNER_NAME } from '../data/dogData';
import { getDogImage } from '../utils/assetLoader';
import DogDetailFull from './DogDetailFull';

// Race Database
const raceData = {
  name: "STADTPARK SPRINT",
  distance: 800,
  bestTime: 42.3,
  bestTimeHolder: "Shadow",
  lastWinner: "Blitz"
};

export default function Race({ gameState, setGameState, getCurrentPlayer }) {
  const [raceInterval, setRaceInterval] = useState(null);
  const [commentary, setCommentary] = useState([]);
  const [selectedDog, setSelectedDog] = useState(null);
  const [allParticipants, setAllParticipants] = useState([]);
  
  const addCommentary = (text) => {
    setCommentary(prev => [...prev.slice(-5), text]);
  };
  
  const isPlayerDog = (dog) => {
    return gameState.players.some(player => 
      player.dogs.some(d => d.id === dog.id)
    );
  };
  
  const getDogOwner = (dog) => {
    const owner = gameState.players.find(player => 
      player.dogs.some(d => d.id === dog.id)
    );
    return owner ? owner.name : dog.owner || AI_OWNER_NAME;
  };
  
  const startRace = () => {
    const participants = [];
    gameState.players.forEach(player => {
      player.dogs.forEach(dog => {
        if (dog.fitness >= 20) {
          participants.push(dog);
        }
      });
    });
    
    while (participants.length < 6) {
      const name = dogNames[Math.floor(Math.random() * dogNames.length)];
      const breed = dogBreeds[Math.floor(Math.random() * dogBreeds.length)];
      participants.push(new Dog(null, breed));
    }
    
    const raceDogs = participants.slice(0, 8);
    raceDogs.sort(() => Math.random() - 0.5);
    
    const totalRating = raceDogs.reduce((sum, dog) => sum + dog.getOverallRating(), 0);
    
    const newRace = {
      participants: raceDogs.map(dog => {
        const rating = dog.getOverallRating();
        const odds = (totalRating / rating / raceDogs.length) * 1.5;
        return {
          dog: dog,
          progress: 0,
          odds: Math.max(1.2, Math.min(10, odds)),
          dailyForm: 0,
          fitnessFactor: 1,
          energy: 100,
          position: 0,
          lastPosition: 0
        };
      }),
      finished: false,
      results: [],
      elapsedTime: 0
    };
    
    setGameState({
      ...gameState,
      currentRace: newRace
    });
    
    setCommentary([]);
    
    // AUTO-START RACE immediately
    setTimeout(() => runRace(), 100);
  };
  
  const runRace = () => {
    const race = gameState.currentRace;
    let finished = [];
    let tick = 0;
    const maxTicks = 80;
    
    addCommentary("🏁 UND SIE SIND WEG!");
    
    race.participants.forEach(p => {
      const dog = p.dog;
      p.dailyForm = dog.getDailyForm ? dog.getDailyForm() : 0;
      p.fitnessFactor = Math.max(0.5, dog.fitness / 100);
      p.startStrength = (dog.acceleration + dog.focus) / 2;
      p.middleStrength = (dog.speed + dog.stamina) / 2;
      p.sprintStrength = (dog.speed + dog.focus + (100 - dog.stamina * 0.3)) / 2;
      p.baseSpeed = (dog.speed + dog.stamina + dog.acceleration + dog.focus) / 4;
      p.effectiveRating = p.baseSpeed + p.dailyForm;
      p.effectiveRating *= p.fitnessFactor;
      p.energy = 100;
      p.position = 0;
      p.lastPosition = 0;
    });
    
    const interval = setInterval(() => {
      tick++;
      race.elapsedTime = tick / 10;
      
      let racePhase = tick < 20 ? 'start' : tick < 60 ? 'middle' : 'sprint';
      
      if (tick === 20) addCommentary("⚡ Mittelteil erreicht!");
      if (tick === 60) addCommentary("🔥 ENDSPURT BEGINNT!");
      
      race.participants.forEach(p => {
        if (p.progress < 100) {
          const dog = p.dog;
          
          let phaseStrength = racePhase === 'start' ? p.startStrength :
                             racePhase === 'middle' ? p.middleStrength : p.sprintStrength;
          
          const energyDrain = (100 - dog.stamina) / 500;
          p.energy = Math.max(30, p.energy - energyDrain);
          const energyFactor = p.energy / 100;
          
          let speedThisTick = (phaseStrength / 50) * p.fitnessFactor * energyFactor;
          
          const variance = (100 - dog.focus) / 500;
          speedThisTick += (Math.random() - 0.5) * variance * 2;
          
          if (tick < 10) {
            speedThisTick *= (dog.acceleration / 100) * 1.5;
          }
          
          p.progress = Math.min(100, p.progress + speedThisTick);
          
          if (p.progress >= 100 && !p.finishTick) {
            p.finishTick = tick;
            finished.push(p);
            if (finished.length === 1) {
              addCommentary(`🏆 ${dog.name.toUpperCase()} GEWINNT!`);
            }
          }
        }
      });
      
      race.participants.forEach(p => p.lastPosition = p.position);
      race.participants.sort((a, b) => b.progress - a.progress);
      race.participants.forEach((p, index) => {
        p.position = index + 1;
        
        if (p.lastPosition > 0 && p.position < p.lastPosition && tick > 10 && tick < 75) {
          if (p.lastPosition - p.position >= 2) {
            addCommentary(`⚡ ${p.dog.name} überholt!`);
          }
        }
      });
      
      setGameState({...gameState});
      
      if (finished.length === race.participants.length || tick >= maxTicks) {
        clearInterval(interval);
        setRaceInterval(null);
        
        finished.sort((a, b) => {
          if (a.finishTick && b.finishTick) return a.finishTick - b.finishTick;
          return b.progress - a.progress;
        });
        
        race.finished = true;
        race.results = finished;
        
        finished.forEach((result, index) => {
          const dog = result.dog;
          if (dog.races !== undefined) {
            dog.races++;
            dog.experience += 10;
            if (index === 0) {
              dog.wins++;
              const owner = gameState.players.find(p => p.dogs.includes(dog));
              if (owner) {
                owner.totalWins = (owner.totalWins || 0) + 1;
              }
            }
          }
        });
        
        const updatedGameState = {...gameState, raceCompleted: true};
        setGameState(updatedGameState);
        
        addCommentary("🏁 Rennen beendet!");
      }
    }, 100);
    
    setRaceInterval(interval);
  };
  
  useEffect(() => {
    return () => {
      if (raceInterval) {
        clearInterval(raceInterval);
      }
    };
  }, [raceInterval]);
  
  // Pre-race overview
  if (!gameState.currentRace) {
    const participants = [];
    gameState.players.forEach(player => {
      player.dogs.forEach(dog => {
        if (dog.fitness >= 20) {
          participants.push(dog);
        }
      });
    });
    
    while (participants.length < 6) {
      const name = dogNames[Math.floor(Math.random() * dogNames.length)];
      const breed = dogBreeds[Math.floor(Math.random() * dogBreeds.length)];
      participants.push(new Dog(null, breed));
    }
    
    const raceDogs = participants.slice(0, 8);
    const totalRating = raceDogs.reduce((sum, dog) => sum + dog.getOverallRating(), 0);
    
    const participantsWithOdds = raceDogs.map(dog => {
      const rating = dog.getOverallRating();
      const odds = (totalRating / rating / raceDogs.length) * 1.5;
      return {
        dog,
        odds: Math.max(1.2, Math.min(10, odds))
      };
    });
    
    return (
      <>
        <div className="race-view">
          
          <div className="race-info-header">
            <div className="race-info-main">
              <h2 className="race-name">{raceData.name}</h2>
              <div className="race-meta">
                <span className="race-distance">{raceData.distance}m</span>
                <span className="race-separator">•</span>
                <span className="race-record">Bestzeit: {raceData.bestTime}s ({raceData.bestTimeHolder})</span>
                <span className="race-separator">•</span>
                <span className="race-champion">Vorjahressieger: {raceData.lastWinner}</span>
              </div>
            </div>
          </div>
          
          <div className="participants-table-container">
            <h3 className="participants-title">TEILNEHMER</h3>
            
            <div className="participants-table">
              <div className="participants-header">
                <div className="col-dog">HUND</div>
                <div className="col-stats">ATTRIBUTE</div>
                <div className="col-rating">RATING</div>
                <div className="col-besttime">BESTZEIT</div>
                <div className="col-odds">QUOTE</div>
                <div className="col-actions">AKTIONEN</div>
              </div>
              
              {participantsWithOdds.map((p, index) => {
                const isOwned = isPlayerDog(p.dog);
                const owner = getDogOwner(p.dog);
                
                return (
                  <div key={index} className={`participant-row ${isOwned ? 'owned-dog' : ''}`}>
                    
                    <div className="col-dog">
                      <img 
                        src={getDogImage(p.dog.imageNumber)} 
                        alt={p.dog.name}
                        className="participant-icon"
                      />
                      <div className="participant-dog-info">
                        <span className="participant-name">{p.dog.name}</span>
                        <span className="participant-breed">{p.dog.breed} • {owner}</span>
                      </div>
                    </div>
                    
                    <div className="col-stats">
                      <div className="stat-item">
                        <span className="stat-icon">⚡</span>
                        <span className="stat-value">{p.dog.speed}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-icon">💪</span>
                        <span className="stat-value">{p.dog.stamina}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-icon">🚀</span>
                        <span className="stat-value">{p.dog.acceleration}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-icon">🎯</span>
                        <span className="stat-value">{p.dog.focus}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-icon">❤️</span>
                        <span className="stat-value">{p.dog.fitness}</span>
                      </div>
                    </div>
                    
                    <div className="col-rating">
                      <span className="rating-badge">{p.dog.getOverallRating()}</span>
                    </div>
                    
                    <div className="col-besttime">
                      <span className="besttime-value">n/a</span>
                    </div>
                    
                    <div className="col-odds">
                      <span className="odds-value">{p.odds.toFixed(1)}x</span>
                    </div>
                    
                    <div className="col-actions">
                      <button 
                        className="btn-action btn-details"
                        onClick={() => {
                          setSelectedDog(p.dog);
                          setAllParticipants(participantsWithOdds.map(p => p.dog));
                        }}
                      >
                        👁️
                      </button>
                      <button 
                        className="btn-action btn-bet"
                        disabled
                      >
                        💰
                      </button>
                    </div>
                    
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="race-start-cta">
            <button className="btn-cta race-start-btn" onClick={startRace}>
              RENNEN STARTEN
            </button>
          </div>
          
        </div>
        
        {selectedDog && (
          <DogDetailFull 
            dog={selectedDog} 
            player={getCurrentPlayer()}
            allDogs={allParticipants}
            gameState={gameState}
            setGameState={setGameState}
            onClose={() => setSelectedDog(null)}
            isRaceView={true}
            isPlayerDog={isPlayerDog(selectedDog)}
          />
        )}
      </>
    );
  }
  
  // Running race view
  const race = gameState.currentRace;
  
  return (
    <div className="race-view">
      
      {/* Race Header with Meta Info */}
      <div className="race-header-compact">
        <div>
          <h2 className="race-title">{raceData.name}</h2>
          <div className="race-meta">
            <span className="race-distance">{raceData.distance}m</span>
            <span className="race-separator">•</span>
            <span className="race-record">Bestzeit: {raceData.bestTime}s ({raceData.bestTimeHolder})</span>
            <span className="race-separator">•</span>
            <span className="race-champion">Vorjahressieger: {raceData.lastWinner}</span>
          </div>
        </div>
        <div className="race-timer">{race.elapsedTime.toFixed(1)}s</div>
      </div>
      
      {/* Main Race Layout: 2/3 Table + 1/3 Live Info */}
      <div className="race-running-layout">
        
        {/* Left: Compact Table (2/3) */}
        <div className="race-table-compact">
          <div className="participants-table-container">
            <div className="participants-table">
              {race.participants.map((p, index) => {
                const isOwned = isPlayerDog(p.dog);
                const owner = getDogOwner(p.dog);
                
                return (
                  <div key={index} className={`participant-row-running ${isOwned ? 'owned-dog' : ''}`}>
                    
                    <div className="col-position">#{p.position}</div>
                    
                    <div className="col-dog-compact">
                      <img 
                        src={getDogImage(p.dog.imageNumber)} 
                        alt={p.dog.name}
                        className="participant-icon-small"
                      />
                      <div className="participant-dog-info">
                        <span className="participant-name-small">{p.dog.name}</span>
                        <span className="participant-owner-small">{owner}</span>
                      </div>
                    </div>
                    
                    <div className="col-progress">
                      <div className="progress-bar-inline">
                        <div 
                          className="progress-fill-inline"
                          style={{width: `${p.progress}%`}}
                        />
                      </div>
                      <span className="progress-text">{p.progress.toFixed(0)}%</span>
                    </div>
                    
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* Right: Live Info (1/3) */}
        <div className="race-sidebar">
          
          {/* Standings - with finish times when race is over */}
          <div className="race-standings-box">
            <h3 className="standings-title">{race.finished ? 'ERGEBNISSE' : 'STANDINGS'}</h3>
            <div className="standings-list">
              {race.participants.map((p, i) => (
                <div key={i} className="standing-item">
                  <span className="standing-pos">{i + 1}.</span>
                  <span className="standing-name">{p.dog.name}</span>
                  {race.finished && p.finishTick && (
                    <span className="standing-time">{(p.finishTick / 10).toFixed(2)}s</span>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Commentary */}
          <div className="race-commentary-box">
            <h3 className="commentary-title">📢 LIVE</h3>
            <div className="commentary-feed-compact">
              {commentary.map((msg, i) => (
                <div key={i} className="commentary-message-compact">
                  {msg}
                </div>
              ))}
            </div>
          </div>
          
        </div>
        
      </div>
      
    </div>
  );
}
