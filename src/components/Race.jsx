import { useState, useEffect } from 'react';
import { Dog } from '../models/Dog';
import { dogNames, dogBreeds } from '../data/dogData';
import { getDogImage } from '../utils/assetLoader';

export default function Race({ gameState, setGameState, getCurrentPlayer }) {
  const [raceInterval, setRaceInterval] = useState(null);
  const [commentary, setCommentary] = useState([]);
  
  const addCommentary = (text) => {
    setCommentary(prev => [...prev.slice(-3), text]); // Keep last 4 messages
  };
  
  const startRace = () => {
    // Get all player dogs
    const participants = [];
    gameState.players.forEach(player => {
      player.dogs.forEach(dog => {
        if (dog.fitness >= 20) {
          participants.push(dog);
        }
      });
    });
    
    // Add AI dogs to make at least 6 total
    while (participants.length < 6) {
      const name = dogNames[Math.floor(Math.random() * dogNames.length)];
      const breed = dogBreeds[Math.floor(Math.random() * dogBreeds.length)];
      participants.push(new Dog(name, breed));
    }
    
    // Limit to 8 dogs max
    const raceDogs = participants.slice(0, 8);
    raceDogs.sort(() => Math.random() - 0.5);
    
    // Calculate odds
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
  };
  
  const runRace = () => {
    const race = gameState.currentRace;
    let finished = [];
    let tick = 0;
    const maxTicks = 80;
    
    addCommentary("🏁 UND SIE SIND WEG!");
    
    // Pre-calculate performance factors
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
      
      // Commentary based on phase
      if (tick === 20) addCommentary("⚡ Sie erreichen die Mitte der Strecke!");
      if (tick === 60) addCommentary("🔥 ENDSPURT! Wer hat noch Kraft?");
      
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
              addCommentary(`🏆 ${dog.name.toUpperCase()} GEWINNT DAS RENNEN!`);
            }
          }
        }
      });
      
      // Update positions and detect overtakes
      race.participants.forEach(p => p.lastPosition = p.position);
      race.participants.sort((a, b) => b.progress - a.progress);
      race.participants.forEach((p, index) => {
        p.position = index + 1;
        
        // Detect overtake
        if (p.lastPosition > 0 && p.position < p.lastPosition && tick > 10 && tick < 75) {
          if (p.lastPosition - p.position >= 2) {
            addCommentary(`⚡ ${p.dog.name} überholt mehrere Hunde!`);
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
        
        // Award wins and experience
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
  
  if (!gameState.currentRace) {
    return (
      <div className="race-view">
        <div className="race-start-screen">
          <h2 className="race-title">RENNEN DER WOCHE</h2>
          <p className="race-subtitle">Woche {gameState.gameDay}</p>
          
          <div className="race-info-box">
            <div className="race-info-item">
              <span className="race-info-label">Teilnehmer</span>
              <span className="race-info-value">
                {gameState.players.reduce((sum, p) => sum + p.dogs.filter(d => d.fitness >= 20).length, 0)} Hunde
              </span>
            </div>
            <div className="race-info-item">
              <span className="race-info-label">Streckenlänge</span>
              <span className="race-info-value">800m</span>
            </div>
          </div>
          
          <button className="btn-cta race-start-btn" onClick={startRace}>
            RENNEN STARTEN
          </button>
        </div>
      </div>
    );
  }
  
  const race = gameState.currentRace;
  
  return (
    <div className="race-view">
      
      {/* Race Header */}
      <div className="race-header">
        <h2 className="race-title">RENNEN LÄUFT</h2>
        <div className="race-timer">{race.elapsedTime.toFixed(1)}s</div>
      </div>
      
      {/* Start Button */}
      {!race.finished && !raceInterval && (
        <div className="race-controls">
          <button className="btn-cta race-go-btn" onClick={runRace}>
            ▶ LOS GEHT'S!
          </button>
        </div>
      )}
      
      {/* Race Track - Side Scroller */}
      <div className="race-track-container">
        {race.participants.map((p, index) => {
          const isPlayerDog = gameState.players.some(player => 
            player.dogs.some(dog => dog.id === p.dog.id)
          );
          
          return (
            <div key={index} className={`race-lane ${isPlayerDog ? 'player-lane' : ''}`}>
              
              {/* Lane Number & Dog Info */}
              <div className="lane-header">
                <span className="lane-position">#{p.position}</span>
                <div className="lane-dog-info">
                  <span className="lane-dog-name">{p.dog.name}</span>
                  <span className="lane-dog-breed">{p.dog.breed}</span>
                </div>
                <span className="lane-rating">{p.dog.getOverallRating()}</span>
              </div>
              
              {/* Track */}
              <div className="race-track-lane">
                {/* Start Line */}
                <div className="track-marker track-start">START</div>
                
                {/* Dog on Track */}
                <div 
                  className="track-dog" 
                  style={{
                    left: `${p.progress}%`,
                    transition: 'left 0.1s linear'
                  }}
                >
                  <img 
                    src={getDogImage(p.dog.imageNumber)} 
                    alt={p.dog.name}
                    className="dog-sprite"
                  />
                </div>
                
                {/* Finish Line */}
                <div className="track-marker track-finish">ZIEL</div>
                
                {/* Energy Bar */}
                <div className="track-energy-bar">
                  <div 
                    className="energy-fill" 
                    style={{
                      width: `${p.energy}%`,
                      background: p.energy > 70 ? '#48bb78' : p.energy > 40 ? '#ed8936' : '#f56565'
                    }}
                  />
                </div>
              </div>
              
              {/* Progress % */}
              <div className="lane-progress">{p.progress.toFixed(1)}%</div>
              
            </div>
          );
        })}
      </div>
      
      {/* Live Commentary */}
      <div className="race-commentary">
        <h3 className="commentary-title">📢 LIVE-KOMMENTAR</h3>
        <div className="commentary-feed">
          {commentary.map((msg, i) => (
            <div key={i} className="commentary-message">
              {msg}
            </div>
          ))}
        </div>
      </div>
      
      {/* Results */}
      {race.finished && (
        <div className="race-results">
          <h3 className="results-title">🏆 ERGEBNISSE</h3>
          <div className="results-grid">
            {race.results.map((result, index) => (
              <div key={index} className="result-card">
                <div className="result-position">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                </div>
                <img 
                  src={getDogImage(result.dog.imageNumber)} 
                  alt={result.dog.name}
                  className="result-dog-image"
                />
                <div className="result-info">
                  <div className="result-name">{result.dog.name}</div>
                  <div className="result-breed">{result.dog.breed}</div>
                  <div className="result-time">{(result.finishTick / 10).toFixed(2)}s</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
    </div>
  );
}
