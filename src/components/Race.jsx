import { useState, useEffect } from 'react';
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
  const [raceInterval, setRaceInterval] = useState(null);
  const [selectedDog, setSelectedDog] = useState(null);
  const [allParticipants, setAllParticipants] = useState([]);
  const [raceTime, setRaceTime] = useState(0);
  
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
    console.log('🎬 START RACE BUTTON CLICKED');
    
    const participants = [];
    gameState.players.forEach(player => {
      player.dogs.forEach(dog => {
        if (dog.fitness >= 20) {
          participants.push(dog);
        }
      });
    });
    
    while (participants.length < 8) {
      const name = dogNames[Math.floor(Math.random() * dogNames.length)];
      const breed = dogBreeds[Math.floor(Math.random() * dogBreeds.length)];
      participants.push(new Dog(null, breed));
    }
    
    const raceDogs = participants.slice(0, 8);
    raceDogs.sort(() => Math.random() - 0.5);
    
    console.log('🐕 Race participants:', raceDogs.map(d => d.name));
    
    const totalRating = raceDogs.reduce((sum, dog) => sum + dog.getOverallRating(), 0);
    
    const newRace = {
      participants: raceDogs.map(dog => {
        const rating = dog.getOverallRating();
        const odds = (totalRating / rating / raceDogs.length) * 1.5;
        const baseSpeed = rating / 100;
        
        return {
          dog: dog,
          progress: 0,
          speed: baseSpeed,
          odds: Math.max(1.2, Math.min(10, odds)),
          position: 0,
          finishTime: null
        };
      }),
      finished: false,
      startTime: Date.now(),
      isRunning: false
    };
    
    console.log('✅ New race created:', newRace);
    
    // CRITICAL: Update gameState properly
    const updatedGameState = {
      ...gameState,
      currentRace: newRace,
      raceCompleted: false
    };
    
    setGameState(updatedGameState);
    setRaceTime(0);
    
    // Start race after state update
    setTimeout(() => {
      console.log('🏁 Starting race interval...');
      runRace(newRace, updatedGameState);
    }, 800);
  };
  
  const runRace = (race, currentGameState) => {
    console.log('🏃 runRace called');
    
    if (race.isRunning) {
      console.log('⚠️ Race already running!');
      return;
    }
    
    race.isRunning = true;
    const startTime = Date.now();
    let finishedCount = 0;
    
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      setRaceTime(elapsed);
      
      let allFinished = true;
      
      race.participants.forEach(p => {
        if (p.progress < 100) {
          allFinished = false;
          
          // Simple progress update
          const variance = 0.9 + (Math.random() * 0.2);
          const step = p.speed * variance;
          
          p.progress += step;
          
          if (p.progress >= 100 && !p.finishTime) {
            p.progress = 100;
            p.finishTime = elapsed;
            finishedCount++;
            console.log(`✅ ${p.dog.name} finished at ${elapsed.toFixed(2)}s (${finishedCount}/8)`);
          }
        }
      });
      
      // Sort by position
      race.participants.sort((a, b) => {
        if (a.progress >= 100 && b.progress >= 100) {
          return a.finishTime - b.finishTime;
        }
        return b.progress - a.progress;
      });
      
      race.participants.forEach((p, i) => {
        p.position = i + 1;
      });
      
      // Update state
      setGameState({...currentGameState});
      
      // Check if done
      if (allFinished) {
        console.log('🏁 Race finished! All dogs done.');
        clearInterval(interval);
        setRaceInterval(null);
        
        race.finished = true;
        race.isRunning = false;
        
        // Update records
        const winner = race.participants[0];
        if (!raceData.bestTime || winner.finishTime < raceData.bestTime) {
          raceData.bestTime = winner.finishTime;
          raceData.bestTimeHolder = winner.dog.name;
          console.log(`🏆 New record: ${winner.finishTime.toFixed(2)}s by ${winner.dog.name}`);
        }
        
        // Update dog stats
        race.participants.forEach((p, index) => {
          if (p.dog.races !== undefined) {
            p.dog.races++;
            p.dog.experience += 10;
            if (index === 0) {
              p.dog.wins++;
              raceData.lastWinner = p.dog.name;
              const owner = currentGameState.players.find(pl => pl.dogs.includes(p.dog));
              if (owner) {
                owner.totalWins = (owner.totalWins || 0) + 1;
              }
            }
          }
        });
        
        setGameState({...currentGameState, raceCompleted: true});
      }
    }, 100);
    
    setRaceInterval(interval);
  };
  
  useEffect(() => {
    return () => {
      if (raceInterval) {
        console.log('🧹 Cleaning up race interval');
        clearInterval(raceInterval);
      }
    };
  }, [raceInterval]);
  
  // PRE-RACE OVERVIEW
  if (!gameState.currentRace) {
    console.log('📋 Showing pre-race overview');
    
    const participants = [];
    gameState.players.forEach(player => {
      player.dogs.forEach(dog => {
        if (dog.fitness >= 20) {
          participants.push(dog);
        }
      });
    });
    
    while (participants.length < 8) {
      const name = dogNames[Math.floor(Math.random() * dogNames.length)];
      const breed = dogBreeds[Math.floor(Math.random() * dogBreeds.length)];
      participants.push(new Dog(null, breed));
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
                  <div key={`preview-${index}`} className={`participant-row ${isOwned ? 'owned-dog' : ''}`}>
                    
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
  
  // RUNNING RACE
  console.log('🏁 Rendering running race view');
  const race = gameState.currentRace;
  
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
            {raceData.lastWinner && (
              <>
                <span className="race-separator">•</span>
                <span className="race-champion">Vorjahressieger: {raceData.lastWinner}</span>
              </>
            )}
          </div>
        </div>
        <div className="race-timer-simple">{raceTime.toFixed(2)}s</div>
      </div>
      
      <div className="race-full-width">
        <div className="participants-table-container">
          <div className="participants-table">
            {race.participants.map((p, idx) => {
              const isOwned = isPlayerDog(p.dog);
              const owner = getDogOwner(p.dog);
              
              return (
                <div key={`race-${p.dog.id}-${idx}`} className={`participant-row-running ${isOwned ? 'owned-dog' : ''}`}>
                  
                  <div className="col-position-simple">#{p.position}</div>
                  
                  <div className="col-dog-simple">
                    <div className="participant-dog-info">
                      <span className="participant-name-small">{p.dog.name}</span>
                      <span className="participant-owner-small">{owner}</span>
                    </div>
                  </div>
                  
                  <div className="col-track-simple">
                    <div className="progress-track-visual">
                      <div className="track-start-marker">START</div>
                      <img 
                        src={getDogImage(p.dog.imageNumber)}
                        alt={p.dog.name}
                        className="running-dog-sprite"
                        style={{ left: `${Math.min(p.progress, 100)}%` }}
                      />
                      <div className="track-finish-marker">ZIEL</div>
                    </div>
                  </div>
                  
                  {race.finished && (
                    <div className="col-time-simple">
                      {p.finishTime ? `${p.finishTime.toFixed(2)}s` : '-'}
                    </div>
                  )}
                  
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
    </div>
  );
}
