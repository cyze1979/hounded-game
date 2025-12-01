import { useState, useEffect, useRef } from 'react';
import { Dog } from '../models/Dog';
import { dogNames, dogBreeds, AI_OWNER_NAME } from '../data/dogData';
import { getDogImage } from '../utils/assetLoader';
import DogDetailFull from './DogDetailFull';

const raceData = {
  name: "STADTPARK SPRINT",
  distance: 800,
  bestTime: null,
  bestTimeHolder: null,
  lastWinner: null
};

export default function Race({ gameState, setGameState, getCurrentPlayer }) {
  const [selectedDog, setSelectedDog] = useState(null);
  const [allParticipants, setAllParticipants] = useState([]);
  const [displayTime, setDisplayTime] = useState(0);
  
  const raceRef = useRef(null);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  
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
    // Gather participants
    const participants = [];
    gameState.players.forEach(player => {
      player.dogs.forEach(dog => {
        if (dog.fitness >= 20) {
          participants.push(dog);
        }
      });
    });
    
    // Fill with AI dogs
    while (participants.length < 8) {
      participants.push(new Dog(null, dogBreeds[Math.floor(Math.random() * dogBreeds.length)]));
    }
    
    const raceDogs = participants.slice(0, 8);
    raceDogs.sort(() => Math.random() - 0.5);
    
    // Create race state
    const newRace = {
      participants: raceDogs.map((dog, index) => ({
        id: `racer-${index}`,
        dog: dog,
        progress: 0,
        position: index + 1,
        speed: dog.getOverallRating() / 100, // Simple for now
        finishTime: null
      })),
      isRunning: false,
      isFinished: false
    };
    
    // Update game state
    setGameState({
      ...gameState,
      currentRace: newRace,
      raceCompleted: false
    });
    
    setDisplayTime(0);
    
    // Auto-start after brief delay
    setTimeout(() => {
      runRace(newRace);
    }, 500);
  };
  
  const runRace = (race) => {
    console.log('🏁 Starting race...');
    
    race.isRunning = true;
    startTimeRef.current = Date.now();
    let finishedCount = 0;
    
    // Timer for display (updates every 10ms for smooth hundredths)
    timerRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      setDisplayTime(elapsed);
    }, 10);
    
    // Race logic (updates every 50ms)
    raceRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      let allDone = true;
      
      // Update each participant
      race.participants.forEach(p => {
        if (p.progress < 100) {
          allDone = false;
          
          // Simple progress calculation
          const randomness = 0.9 + (Math.random() * 0.2); // 0.9 to 1.1
          const step = p.speed * randomness;
          
          p.progress = Math.min(100, p.progress + step);
          
          // Check if finished
          if (p.progress >= 100 && !p.finishTime) {
            p.finishTime = elapsed;
            finishedCount++;
            console.log(`✅ ${p.dog.name} finished: ${elapsed.toFixed(2)}s (${finishedCount}/8)`);
          }
        }
      });
      
      // Sort by position (finished first by time, then by progress)
      race.participants.sort((a, b) => {
        if (a.finishTime && b.finishTime) return a.finishTime - b.finishTime;
        if (a.finishTime) return -1;
        if (b.finishTime) return 1;
        return b.progress - a.progress;
      });
      
      // Update positions
      race.participants.forEach((p, i) => {
        p.position = i + 1;
      });
      
      // Trigger re-render
      setGameState({...gameState});
      
      // Check if race is complete
      if (allDone) {
        console.log('🏁 Race finished!');
        
        clearInterval(raceRef.current);
        clearInterval(timerRef.current);
        
        race.isFinished = true;
        race.isRunning = false;
        
        // Update best time
        const winner = race.participants[0];
        if (!raceData.bestTime || winner.finishTime < raceData.bestTime) {
          raceData.bestTime = winner.finishTime;
          raceData.bestTimeHolder = winner.dog.name;
        }
        
        // Update dog stats
        race.participants.forEach((p, idx) => {
          if (p.dog.races !== undefined) {
            p.dog.races++;
            p.dog.experience += 10;
            if (idx === 0) {
              p.dog.wins++;
              raceData.lastWinner = p.dog.name;
              const owner = gameState.players.find(pl => pl.dogs.includes(p.dog));
              if (owner) {
                owner.totalWins = (owner.totalWins || 0) + 1;
              }
            }
          }
        });
        
        setGameState({...gameState, raceCompleted: true});
      }
    }, 50);
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (raceRef.current) clearInterval(raceRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);
  
  // ========================================
  // PRE-RACE OVERVIEW
  // ========================================
  if (!gameState.currentRace) {
    const participants = [];
    gameState.players.forEach(player => {
      player.dogs.forEach(dog => {
        if (dog.fitness >= 20) {
          participants.push(dog);
        }
      });
    });
    
    while (participants.length < 8) {
      participants.push(new Dog(null, dogBreeds[Math.floor(Math.random() * dogBreeds.length)]));
    }
    
    const raceDogs = participants.slice(0, 8);
    const totalRating = raceDogs.reduce((sum, dog) => sum + dog.getOverallRating(), 0);
    
    const participantsWithOdds = raceDogs.map(dog => {
      const rating = dog.getOverallRating();
      const odds = (totalRating / rating / raceDogs.length) * 1.5;
      return { dog, odds: Math.max(1.2, Math.min(10, odds)) };
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
                <span className="race-record">
                  Bestzeit: {raceData.bestTime ? `${raceData.bestTime.toFixed(2)}s (${raceData.bestTimeHolder})` : 'N/A'}
                </span>
                {raceData.lastWinner && (
                  <>
                    <span className="race-separator">•</span>
                    <span className="race-champion">Vorjahressieger: {raceData.lastWinner}</span>
                  </>
                )}
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
                  <div key={`prev-${index}`} className={`participant-row ${isOwned ? 'owned-dog' : ''}`}>
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
                      {[
                        { icon: '⚡', val: p.dog.speed },
                        { icon: '💪', val: p.dog.stamina },
                        { icon: '🚀', val: p.dog.acceleration },
                        { icon: '🎯', val: p.dog.focus },
                        { icon: '❤️', val: p.dog.fitness }
                      ].map((s, i) => (
                        <div key={i} className="stat-item">
                          <span className="stat-icon">{s.icon}</span>
                          <span className="stat-value">{s.val}</span>
                        </div>
                      ))}
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
                      <button className="btn-action btn-bet" disabled>💰</button>
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
  
  // ========================================
  // RUNNING RACE - MINIMAL VIEW
  // ========================================
  const race = gameState.currentRace;
  
  return (
    <div className="race-view">
      <div className="race-header-simple">
        <h2 className="race-title">{raceData.name}</h2>
        <div className="race-timer-simple">{displayTime.toFixed(2)}s</div>
      </div>
      
      <div className="race-minimal-container">
        {race.participants.map((p) => {
          const isOwned = isPlayerDog(p.dog);
          const owner = getDogOwner(p.dog);
          
          return (
            <div key={p.id} className={`race-row-minimal ${isOwned ? 'owned-dog' : ''}`}>
              <div className="race-position">#{p.position}</div>
              
              <div className="race-info">
                <div className="race-dog-name">{p.dog.name}</div>
                <div className="race-dog-owner">{owner}</div>
              </div>
              
              <div className="race-track">
                <div className="race-progress-bg">
                  <div 
                    className="race-progress-bar"
                    style={{ width: `${Math.min(p.progress, 100)}%` }}
                  />
                </div>
                <img 
                  src={getDogImage(p.dog.imageNumber)}
                  alt={p.dog.name}
                  className="race-dog-sprite"
                  style={{ left: `${Math.min(p.progress, 100)}%` }}
                />
              </div>
              
              {race.isFinished && p.finishTime && (
                <div className="race-time">{p.finishTime.toFixed(2)}s</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
