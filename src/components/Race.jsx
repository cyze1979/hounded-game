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

const commentaryPhrases = {
  start: ["🏁 UND SIE SIND WEG!", "🏁 DAS RENNEN BEGINNT!", "🏁 DIE HUNDE STÜRMEN LOS!"],
  middle: ["⚡ Mittelteil erreicht!", "⚡ Jetzt zeigt sich die Ausdauer!", "⚡ Die Hälfte ist geschafft!"],
  sprint: ["🔥 ENDSPURT BEGINNT!", "🔥 JETZT WIRD ES ERNST!", "🔥 WER HAT NOCH KRAFT?!"],
  overtake: ["⚡ {dog} EXPLODIERT nach vorn!", "⚡ {dog} überholt mit POWER!", "⚡ WAHNSINN! {dog} zieht vorbei!"],
  win: ["🏆 {dog} GEWINNT!", "🏆 SIEG FÜR {dog}!", "🏆 {dog} TRIUMPHIERT!"],
  finish: ["🏁 Rennen beendet!", "🏁 Alle im Ziel!", "🏁 Das war spannend!"]
};

const getRandomPhrase = (category, dogName = null) => {
  const phrases = commentaryPhrases[category];
  const phrase = phrases[Math.floor(Math.random() * phrases.length)];
  return dogName ? phrase.replace('{dog}', dogName.toUpperCase()) : phrase;
};

export default function Race({ gameState, setGameState, getCurrentPlayer }) {
  const [raceInterval, setRaceInterval] = useState(null);
  const [commentary, setCommentary] = useState([]);
  const [selectedDog, setSelectedDog] = useState(null);
  const [allParticipants, setAllParticipants] = useState([]);
  const [raceStartTime, setRaceStartTime] = useState(null);
  const [currentRaceTime, setCurrentRaceTime] = useState(0);
  const [winnerTime, setWinnerTime] = useState(null);
  
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
    
    while (participants.length < 8) {
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
          position: 0,
          lastPosition: 0,
          finishTime: null,
          // NEW: Simplified stats
          speedFactor: (dog.speed / 100) * 0.4,
          staminaFactor: (dog.stamina / 100) * 0.25,
          accelerationFactor: (dog.acceleration / 100) * 0.2,
          focusFactor: (dog.focus / 100) * 0.15,
          fitnessFactor: Math.max(0.7, dog.fitness / 100)
        };
      }),
      finished: false,
      results: [],
      startTime: null,
      autoStarted: false
    };
    
    setGameState({
      ...gameState,
      currentRace: newRace
    });
    
    setCommentary([]);
    setRaceStartTime(null);
    setCurrentRaceTime(0);
    setWinnerTime(null);
  };
  
  const runRace = () => {
    const race = gameState.currentRace;
    if (!race || raceInterval) return;
    
    const startTime = Date.now();
    race.startTime = startTime;
    setRaceStartTime(startTime);
    
    let finished = [];
    let tick = 0;
    const TARGET_TICKS = 140; // ~7 seconds at 50ms
    
    addCommentary(getRandomPhrase('start'));
    
    race.participants.forEach(p => {
      p.progress = 0;
      p.position = 0;
      p.lastPosition = 0;
      p.finishTime = null;
    });
    
    const interval = setInterval(() => {
      tick++;
      const currentTime = (Date.now() - startTime) / 1000;
      
      const progressPercent = (tick / TARGET_TICKS) * 100;
      let racePhase = progressPercent < 25 ? 'start' : progressPercent < 75 ? 'middle' : 'sprint';
      
      if (tick === Math.floor(TARGET_TICKS * 0.25)) addCommentary(getRandomPhrase('middle'));
      if (tick === Math.floor(TARGET_TICKS * 0.75)) addCommentary(getRandomPhrase('sprint'));
      
      race.participants.forEach(p => {
        if (p.progress < 100) {
          const dog = p.dog;
          
          // Base speed calculation - simplified
          let baseSpeed = p.speedFactor + p.staminaFactor + p.accelerationFactor + p.focusFactor;
          baseSpeed *= p.fitnessFactor;
          
          // Phase multipliers
          let phaseMultiplier = 1.0;
          if (racePhase === 'start') {
            phaseMultiplier = 0.8 + (p.accelerationFactor * 2); // Acceleration boost
          } else if (racePhase === 'sprint') {
            phaseMultiplier = 0.9 + (p.staminaFactor * 1.5); // Stamina crucial
          }
          
          // Variance based on focus (less focus = more variance)
          const variance = (1 - p.focusFactor) * 0.4;
          const randomFactor = 1 + ((Math.random() - 0.5) * variance);
          
          // Calculate progress step
          const progressStep = (100 / TARGET_TICKS) * baseSpeed * phaseMultiplier * randomFactor;
          
          p.progress = Math.min(100, p.progress + progressStep);
          
          if (p.progress >= 100 && !p.finishTime) {
            p.finishTime = currentTime;
            finished.push(p);
            if (finished.length === 1) {
              setWinnerTime(currentTime);
              addCommentary(getRandomPhrase('win', dog.name));
            }
          }
        }
      });
      
      // Update positions
      race.participants.forEach(p => p.lastPosition = p.position);
      race.participants.sort((a, b) => {
        if (a.finishTime && b.finishTime) return a.finishTime - b.finishTime;
        if (a.finishTime) return -1;
        if (b.finishTime) return 1;
        return b.progress - a.progress;
      });
      race.participants.forEach((p, index) => {
        p.position = index + 1;
        
        // Detect overtakes
        if (p.lastPosition > 0 && p.position < p.lastPosition && tick > 10) {
          if (p.lastPosition - p.position >= 2 && Math.random() > 0.7) {
            addCommentary(getRandomPhrase('overtake', p.dog.name));
          }
        }
      });
      
      setGameState({...gameState});
      
      // Race ends when all dogs finish or timeout
      if (finished.length === race.participants.length || tick >= TARGET_TICKS + 40) {
        clearInterval(interval);
        setRaceInterval(null);
        
        // Ensure all dogs have times
        race.participants.forEach(p => {
          if (!p.finishTime) {
            p.finishTime = currentTime;
          }
        });
        
        race.participants.sort((a, b) => a.finishTime - b.finishTime);
        race.participants.forEach((p, i) => p.position = i + 1);
        
        race.finished = true;
        race.results = race.participants;
        
        // Update records
        const winTime = race.participants[0].finishTime;
        if (!raceData.bestTime || winTime < raceData.bestTime) {
          raceData.bestTime = winTime;
          raceData.bestTimeHolder = race.participants[0].dog.name;
        }
        
        race.participants.forEach((p, index) => {
          const dog = p.dog;
          if (dog.races !== undefined) {
            dog.races++;
            dog.experience += 10;
            if (index === 0) {
              dog.wins++;
              raceData.lastWinner = dog.name;
              const owner = gameState.players.find(pl => pl.dogs.includes(dog));
              if (owner) {
                owner.totalWins = (owner.totalWins || 0) + 1;
              }
            }
          }
        });
        
        setGameState({...gameState, raceCompleted: true});
        addCommentary(getRandomPhrase('finish'));
      }
    }, 50); // 50ms = 20 FPS
    
    setRaceInterval(interval);
  };
  
  // Update timer
  useEffect(() => {
    if (raceStartTime && !winnerTime) {
      const timer = setInterval(() => {
        setCurrentRaceTime((Date.now() - raceStartTime) / 1000);
      }, 10);
      return () => clearInterval(timer);
    }
  }, [raceStartTime, winnerTime]);
  
  // Auto-start
  useEffect(() => {
    if (gameState.currentRace && !gameState.currentRace.autoStarted && !raceInterval) {
      gameState.currentRace.autoStarted = true;
      setTimeout(() => runRace(), 500);
    }
  }, [gameState.currentRace]);
  
  useEffect(() => {
    return () => {
      if (raceInterval) clearInterval(raceInterval);
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
  
  const race = gameState.currentRace;
  const displayTime = winnerTime || currentRaceTime;
  
  return (
    <div className="race-view">
      
      <div className="race-header-compact">
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
        <div className="race-timer">{displayTime.toFixed(2)}s</div>
      </div>
      
      <div className="race-running-layout">
        
        <div className="race-table-compact">
          <div className="participants-table-container">
            <div className="participants-table">
              {race.participants.map((p, index) => {
                const isOwned = isPlayerDog(p.dog);
                const owner = getDogOwner(p.dog);
                
                return (
                  <div key={p.dog.id} className={`participant-row-running ${isOwned ? 'owned-dog' : ''}`}>
                    
                    <div className="col-position">#{p.position}</div>
                    
                    <div className="col-dog-compact">
                      <div className="participant-dog-info">
                        <span className="participant-name-small">{p.dog.name}</span>
                        <span className="participant-owner-small">{owner}</span>
                      </div>
                    </div>
                    
                    <div className="col-progress">
                      <div className="progress-track-visual">
                        <div className="track-start-marker">START</div>
                        <img 
                          src={getDogImage(p.dog.imageNumber)}
                          alt={p.dog.name}
                          className="running-dog-sprite"
                          style={{ left: `${p.progress}%` }}
                        />
                        <div className="track-finish-marker">ZIEL</div>
                      </div>
                    </div>
                    
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        <div className="race-sidebar">
          
          <div className="race-standings-box">
            <h3 className="standings-title">{race.finished ? 'ERGEBNISSE' : 'STANDINGS'}</h3>
            <div className="standings-list">
              {race.participants.map((p, i) => (
                <div key={p.dog.id} className="standing-item">
                  <span className="standing-pos">{i + 1}.</span>
                  <span className="standing-name">{p.dog.name}</span>
                  {race.finished && p.finishTime && (
                    <span className="standing-time">{p.finishTime.toFixed(2)}s</span>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="race-commentary-box">
            <h3 className="commentary-title">📢 LIVE</h3>
            <div className="commentary-feed-compact">
              {commentary.map((msg, i) => (
                <div key={i} className="commentary-message-compact">{msg}</div>
              ))}
            </div>
          </div>
          
        </div>
        
      </div>
      
    </div>
  );
}
