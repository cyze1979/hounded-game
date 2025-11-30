import { useState, useEffect } from 'react';
import { Dog } from '../models/Dog';
import { dogNames, dogBreeds } from '../data/dogData';

export default function Race({ gameState, setGameState, getCurrentPlayer }) {
  const [raceInterval, setRaceInterval] = useState(null);
  
  const startRace = () => {
    // Get all player dogs
    const participants = [];
    gameState.players.forEach(player => {
      player.dogs.forEach(dog => {
        if (dog.fitness >= 20) { // Only if not too tired
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
          energy: 100
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
  };
  
  const runRace = () => {
    const race = gameState.currentRace;
    let finished = [];
    let tick = 0;
    const maxTicks = 80;
    
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
    });
    
    const interval = setInterval(() => {
      tick++;
      race.elapsedTime = tick / 10;
      
      let racePhase = tick < 20 ? 'start' : tick < 60 ? 'middle' : 'sprint';
      
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
          }
        }
      });
      
      race.participants.sort((a, b) => b.progress - a.progress);
      race.participants.forEach((p, index) => {
        p.position = index + 1;
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
        
        // IMPORTANT: Mark race as completed
        const updatedGameState = {...gameState, raceCompleted: true};
        setGameState(updatedGameState);
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
      <div className="race-container">
        <h2>Rennen</h2>
        <p style={{color: '#718096', marginBottom: '30px'}}>
          Bereit für das Rennen dieser Woche?
        </p>
        <button className="btn btn-primary" onClick={startRace} style={{fontSize: '1.2em', padding: '15px 30px'}}>
          🏁 Rennen starten
        </button>
      </div>
    );
  }
  
  const race = gameState.currentRace;
  
  return (
    <div className="race-container">
      <h2>Rennen läuft... ({race.elapsedTime.toFixed(1)}s)</h2>
      
      {!race.finished && !raceInterval && (
        <button className="btn btn-success" onClick={runRace} style={{marginBottom: '20px'}}>
          ▶️ Los geht's!
        </button>
      )}
      
      <div className="race-track">
        {race.participants.map((p, index) => (
          <div key={index} className="race-lane">
            <div className="lane-info">
              <span className="position">#{p.position}</span>
              <span className="dog-name">{p.dog.name}</span>
              <span className="dog-rating">{p.dog.getOverallRating()}</span>
              <span className="dog-odds">{p.odds.toFixed(1)}x</span>
            </div>
            <div className="progress-track">
              <div 
                className="progress-dog" 
                style={{
                  left: `${p.progress}%`,
                  transition: 'left 0.1s linear'
                }}
              >
                🐕
              </div>
            </div>
            <div className="progress-percent">{p.progress.toFixed(1)}%</div>
          </div>
        ))}
      </div>
      
      {race.finished && (
        <div className="race-results">
          <h3>🏆 Ergebnisse</h3>
          <div className="results-list">
            {race.results.map((result, index) => (
              <div key={index} className="result-item">
                <span className="result-position">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                </span>
                <span className="result-name">{result.dog.name}</span>
                <span className="result-breed">{result.dog.breed}</span>
                <span className="result-rating">{result.dog.getOverallRating()}</span>
                <span className="result-time">{(result.finishTick / 10).toFixed(2)}s</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
