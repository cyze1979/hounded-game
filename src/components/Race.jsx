import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Dog } from '../models/Dog';
import { dogNames, dogBreeds, AI_OWNER_NAME } from '../data/dogData';
import { getDogImage } from '../utils/assetLoader';
import DogDetailFull from './DogDetailFull';

const raceData = {
  name: "STADTPARK SPRINT",
  distance: 800,
  bestTime: null,
  bestTimeHolder: null,
  lastWinner: null,
  lastResults: null // Store last race results
};

// Prize money structure
const RACE_PRIZES = {
  "STADTPARK SPRINT": {
    1: 1000,
    2: 750,
    3: 500
  }
};

export default function Race({ gameState, setGameState, getCurrentPlayer }) {
  const [selectedDog, setSelectedDog] = useState(null);
  const [allParticipants, setAllParticipants] = useState([]);
  const [displayTime, setDisplayTime] = useState(0);
  const [raceState, setRaceState] = useState(null);
  const [showResults, setShowResults] = useState(false);
  
  const raceRef = useRef(null);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  
  // Load stored results if they exist
  useEffect(() => {
    if (raceData.lastResults && !raceState && !showResults) {
      setRaceState(raceData.lastResults.race);
      setShowResults(true);
    }
  }, []);
  
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
  
  const continueAfterResults = () => {
    // Clear everything including stored results
    raceData.lastResults = null;
    setRaceState(null);
    setShowResults(false);
    
    // Age all dogs by 1 month
    gameState.players.forEach(player => {
      player.dogs.forEach(dog => {
        dog.ageInMonths += 1;
      });
    });
    
    setGameState({
      ...gameState,
      currentRace: null,
      raceCompleted: false,
      currentMonth: gameState.currentMonth + 1 // Next month!
    });
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
    
    while (participants.length < 8) {
      participants.push(new Dog(null, dogBreeds[Math.floor(Math.random() * dogBreeds.length)]));
    }
    
    const raceDogs = participants.slice(0, 8);
    raceDogs.sort(() => Math.random() - 0.5);
    
    const newRace = {
      participants: raceDogs.map((dog, index) => {
        const baseSpeed = (
          dog.speed * 0.4 +
          dog.stamina * 0.25 +
          dog.acceleration * 0.2 +
          dog.focus * 0.15
        ) / 100;
        
        const fitnessFactor = Math.max(0.85, dog.fitness / 100);
        const focusFactor = dog.focus / 100;
        
        return {
          id: `racer-${index}`,
          dog: dog,
          progress: 0,
          position: index + 1,
          baseSpeed: baseSpeed * fitnessFactor * 0.5,
          accelerationBoost: (dog.acceleration / 100) * 0.15,
          staminaFactor: dog.stamina / 100,
          focusFactor: focusFactor,
          energy: 100,
          finishTime: null
        };
      }),
      isRunning: false,
      isFinished: false,
      raceName: raceData.name
    };
    
    setRaceState(newRace);
    setDisplayTime(0);
    setShowResults(false);
    
    setGameState({
      ...gameState,
      currentRace: { exists: true },
      raceCompleted: false
    });
    
    setTimeout(() => {
      runRace(newRace);
    }, 500);
  };
  
  const runRace = (race) => {
    console.log('🏁 Starting race...');
    
    race.isRunning = true;
    startTimeRef.current = Date.now();
    let finishedCount = 0;
    
    timerRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      setDisplayTime(elapsed);
    }, 10);
    
    raceRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      let allDone = true;
      
      const avgProgress = race.participants.reduce((sum, p) => sum + p.progress, 0) / 8;
      let phase = 'start';
      if (avgProgress > 25) phase = 'middle';
      if (avgProgress > 75) phase = 'sprint';
      
      race.participants.forEach(p => {
        if (p.progress < 100) {
          allDone = false;
          
          let currentSpeed = p.baseSpeed;
          
          if (phase === 'start') {
            currentSpeed += p.accelerationBoost;
          }
          
          if (phase === 'sprint') {
            const energyDrain = (1 - p.staminaFactor) * 1.5;
            p.energy = Math.max(40, p.energy - energyDrain);
            const energyMultiplier = p.energy / 100;
            currentSpeed *= (0.75 + energyMultiplier * 0.25);
          }
          
          const maxVariance = 0.2 * (1 - p.focusFactor);
          const variance = 1 + ((Math.random() - 0.5) * maxVariance * 2);
          
          const step = currentSpeed * variance;
          p.progress = Math.min(100, p.progress + step);
          
          if (p.progress >= 100 && !p.finishTime) {
            p.finishTime = elapsed;
            finishedCount++;
            console.log(`✅ ${p.dog.name} finished: ${elapsed.toFixed(2)}s (${finishedCount}/8)`);
          }
        }
      });
      
      race.participants.sort((a, b) => {
        if (a.finishTime && b.finishTime) return a.finishTime - b.finishTime;
        if (a.finishTime) return -1;
        if (b.finishTime) return 1;
        return b.progress - a.progress;
      });
      
      race.participants.forEach((p, i) => {
        p.position = i + 1;
      });
      
      setRaceState({...race});
      
      if (allDone) {
        console.log('🏁 Race finished!');
        
        clearInterval(raceRef.current);
        clearInterval(timerRef.current);
        
        race.isFinished = true;
        race.isRunning = false;
        
        const winner = race.participants[0];
        if (!raceData.bestTime || winner.finishTime < raceData.bestTime) {
          raceData.bestTime = winner.finishTime;
          raceData.bestTimeHolder = winner.dog.name;
        }
        
        // Calculate prize money
        const prizes = RACE_PRIZES[race.raceName] || {};
        
        race.participants.forEach((p, idx) => {
          const position = idx + 1;
          const prize = prizes[position] || 0;
          p.prize = prize;
          
          if (p.dog.races !== undefined) {
            p.dog.races++;
            p.dog.experience += 10;
            
            if (position === 1) {
              p.dog.wins++;
              raceData.lastWinner = p.dog.name;
            }
            
            // Award prize money to player if it's their dog
            if (isPlayerDog(p.dog)) {
              const owner = gameState.players.find(pl => pl.dogs.includes(p.dog));
              if (owner) {
                owner.money += prize;
                p.dog.totalEarnings += prize; // Track dog's total earnings
                if (position === 1) {
                  owner.totalWins = (owner.totalWins || 0) + 1;
                }
              }
            }
          }
        });
        
        setRaceState({...race});
        
        // Store results so they persist when switching tabs
        raceData.lastResults = {
          race: race
        };
        
        // Show results screen after brief delay
        setTimeout(() => {
          setShowResults(true);
        }, 1000);
      }
    }, 20);
  };
  
  useEffect(() => {
    return () => {
      if (raceRef.current) clearInterval(raceRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);
  
  // PRE-RACE OVERVIEW
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
  
  // RESULTS SCREEN
  if (showResults && raceState && raceState.isFinished) {
    const prizes = RACE_PRIZES[raceState.raceName] || {};
    
    return (
      <div className="race-view">
        <div className="results-screen">
          <div className="results-header">
            <h2 className="results-title">{raceState.raceName}</h2>
            <div className="race-meta">
              <span className="race-distance">{raceData.distance}m</span>
              <span className="race-separator">•</span>
              <span className="race-record">
                Bestzeit: {raceData.bestTime ? `${raceData.bestTime.toFixed(2)}s (${raceData.bestTimeHolder})` : 'N/A'}
              </span>
            </div>
          </div>
          
          <div className="results-table">
            {raceState.participants.map((p, idx) => {
              const position = idx + 1;
              const medal = position === 1 ? '🥇' : position === 2 ? '🥈' : position === 3 ? '🥉' : '';
              const isOwned = isPlayerDog(p.dog);
              const owner = getDogOwner(p.dog);
              const prize = p.prize || 0;
              
              return (
                <div key={p.id} className={`results-row ${isOwned ? 'owned-dog' : ''}`}>
                  <div className="results-position">
                    <span className="results-pos-number">#{position}</span>
                    {medal && <span className="results-medal">{medal}</span>}
                  </div>
                  
                  <div className="results-info">
                    <div className="results-dog-name">{p.dog.name}</div>
                    <div className="results-owner">{owner}</div>
                  </div>
                  
                  <div className="results-time">{p.finishTime.toFixed(2)}s</div>
                  
                  <div className="results-prize">{prize > 0 ? `${prize}€` : '-'}</div>
                </div>
              );
            })}
          </div>
          
          <div className="results-continue">
            <button className="btn-cta" onClick={continueAfterResults}>
              NÄCHSTES RENNEN
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // RUNNING RACE
  if (!raceState || !raceState.participants) {
    return null; // Return nothing if no valid race state
  }
  
  const sortedParticipants = [...raceState.participants].sort((a, b) => a.position - b.position);
  
  return (
    <div className="race-view">
      <div className="race-header-simple">
        <div>
          <h2 className="race-title">{raceData.name}</h2>
          <div className="race-meta">
            <span className="race-distance">{raceData.distance}m</span>
            <span className="race-separator">•</span>
            <span className="race-record">
              Bestzeit: {raceData.bestTime ? `${raceData.bestTime.toFixed(2)}s (${raceData.bestTimeHolder})` : 'N/A'}
            </span>
          </div>
        </div>
        <div className="race-timer-simple">{displayTime.toFixed(2)}s</div>
      </div>
      
      <div className="race-minimal-container">
        {sortedParticipants.map((p) => {
          const isOwned = isPlayerDog(p.dog);
          const owner = getDogOwner(p.dog);
          
          return (
            <motion.div 
              key={p.id}
              layout
              transition={{
                layout: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
              }}
              className={`race-row-minimal ${isOwned ? 'owned-dog' : ''}`}
            >
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
              
              <div className="race-time">
                {p.finishTime ? `${p.finishTime.toFixed(2)}s` : ''}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
