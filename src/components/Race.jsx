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
      p.dailyForm = dog.getDailyForm();
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
            const accelFactor = dog.acceleration / 100;
            speedThisTick *= (0.3 + accelFactor * 0.7);
          }
          
          if (racePhase === 'sprint' && p.energy > 50) {
            speedThisTick *= 1.2;
          }
          
          p.progress = Math.min(100, p.progress + speedThisTick);
          
          if (p.progress >= 100 && !finished.includes(p)) {
            p.finishTick = tick;
            p.time = (tick / 10).toFixed(2);
            finished.push(p);
          }
        }
      });
      
      // Update positions
      const sorted = [...race.participants].sort((a, b) => b.progress - a.progress);
      sorted.forEach((p, idx) => p.position = idx + 1);
      
      setGameState({...gameState, currentRace: race});
      
      // Race finished
      if (finished.length === race.participants.length || tick >= maxTicks) {
        clearInterval(interval);
        
        race.participants.forEach(p => {
          if (!p.time) {
            p.time = ((maxTicks + Math.random() * 10) / 10).toFixed(2);
            p.progress = 100;
          }
        });
        
        finishRace(finished.length > 0 ? finished : race.participants);
      }
    }, 100);
    
    setRaceInterval(interval);
  };
  
  const finishRace = (finished) => {
    const race = gameState.currentRace;
    
    finished.sort((a, b) => {
      if (a.finishTick && b.finishTick) return a.finishTick - b.finishTick;
      return b.progress - a.progress;
    });
    
    race.finished = true;
    race.results = finished;
    
    // Update dog stats
    finished.forEach((p, index) => {
      if (p.dog.owner) {
        p.dog.races++;
        p.dog.experience += 5;
        p.dog.fitness = Math.max(0, p.dog.fitness - 15);
        
        p.dog.raceHistory.push({
          day: gameState.gameDay,
          position: index + 1,
          dailyForm: p.dailyForm,
          time: parseFloat(p.time),
          fitness: p.dog.fitness + 15
        });
        
        if (index === 0) {
          p.dog.wins++;
          p.dog.owner.totalWins++;
          p.dog.owner.money += 500;
          p.dog.owner.totalWinnings += 500;
        } else if (index === 1) {
          p.dog.owner.money += 200;
          p.dog.owner.totalWinnings += 200;
        } else if (index === 2) {
          p.dog.owner.money += 100;
          p.dog.owner.totalWinnings += 100;
        }
        
        p.dog.owner.totalRaces++;
      }
    });
    
    gameState.raceHistory.push({
      day: gameState.gameDay,
      results: finished.map(p => ({
        dog: p.dog.name,
        owner: p.dog.owner ? p.dog.owner.name : 'KI',
        time: p.time
      }))
    });
    
    setGameState({...gameState});
  };
  
  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (raceInterval) clearInterval(raceInterval);
    };
  }, [raceInterval]);
  
  const race = gameState.currentRace;
  
  if (!race) {
    return (
      <div className="race-container">
        <h2>Rennen</h2>
        <p style={{margin: '20px 0', color: '#718096'}}>Bereite ein neues Rennen vor</p>
        <button className="btn btn-primary" onClick={startRace}>🏁 Neues Rennen vorbereiten</button>
      </div>
    );
  }
  
  if (race.finished) {
    return (
      <div className="race-container">
        <div className="race-results">
          <h3>🏆 Rennergebnis</h3>
          {race.results.map((result, index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
            const ownerColor = result.dog.owner ? result.dog.owner.color : '#718096';
            const ownerName = result.dog.owner ? result.dog.owner.name : 'KI';
            const timeStr = typeof result.time === 'number' ? result.time.toFixed(2) : result.time;
            
            return (
              <div key={index} className="result-item" style={{borderLeft: `4px solid ${ownerColor}`}}>
                <span className="result-position">{medal} {index + 1}.</span>
                <span>{result.dog.name} <small style={{color: ownerColor}}>({ownerName})</small></span>
                <span style={{fontWeight: 'bold'}}>{timeStr}s</span>
              </div>
            );
          })}
        </div>
        <button className="btn btn-primary" onClick={startRace}>🏁 Neues Rennen vorbereiten</button>
      </div>
    );
  }
  
  const raceStarted = race.participants.some(p => p.progress > 0);
  
  if (!raceStarted) {
    // Pre-race overview
    return (
      <div className="race-container">
        <h2>Rennen vorbereitet</h2>
        <p style={{color: '#718096', marginBottom: '20px'}}>Teilnehmer für das nächste Rennen:</p>
        
        <div className="participants-table">
          <table style={{width: '100%', borderCollapse: 'collapse'}}>
            <thead>
              <tr style={{background: '#f7fafc', borderBottom: '2px solid #e2e8f0'}}>
                <th style={{padding: '12px', textAlign: 'left'}}>#</th>
                <th style={{padding: '12px', textAlign: 'left'}}>Hund</th>
                <th style={{padding: '12px', textAlign: 'left'}}>Besitzer</th>
                <th style={{padding: '12px', textAlign: 'center'}}>Wertung</th>
                <th style={{padding: '12px', textAlign: 'center'}}>Quote</th>
              </tr>
            </thead>
            <tbody>
              {race.participants.map((p, idx) => {
                const dog = p.dog;
                const ownerColor = dog.owner ? dog.owner.color : '#718096';
                const ownerName = dog.owner ? dog.owner.name : 'KI';
                const rating = dog.getOverallRating();
                
                return (
                  <tr key={idx} style={{borderBottom: '1px solid #e2e8f0'}}>
                    <td style={{padding: '12px', fontWeight: 'bold', color: ownerColor}}>{idx + 1}</td>
                    <td style={{padding: '12px'}}>
                      <div style={{fontWeight: 'bold'}}>{dog.name}</div>
                      <div style={{fontSize: '0.85em', color: '#718096'}}>{dog.breed}</div>
                    </td>
                    <td style={{padding: '12px'}}>
                      <span style={{color: ownerColor, fontWeight: 600}}>{ownerName}</span>
                    </td>
                    <td style={{padding: '12px', textAlign: 'center', fontWeight: 'bold', fontSize: '1.1em'}}>
                      {rating}
                    </td>
                    <td style={{padding: '12px', textAlign: 'center', fontWeight: 'bold', color: '#667eea'}}>
                      {p.odds.toFixed(1)}x
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        <div style={{display: 'flex', gap: '15px', marginTop: '30px', justifyContent: 'center'}}>
          <button className="btn btn-primary btn-large" onClick={runRace}>
            🚀 Rennen starten!
          </button>
        </div>
      </div>
    );
  }
  
  // Race in progress
  return (
    <div className="race-container">
      <h2>Rennen läuft...</h2>
      
      {race.elapsedTime !== undefined && (
        <div style={{textAlign: 'center', margin: '15px 0', padding: '10px', background: '#667eea', color: 'white', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.2em'}}>
          ⏱️ {race.elapsedTime.toFixed(2)}s
        </div>
      )}
      
      <div className="race-track">
        {race.participants.map((p, index) => {
          const ownerColor = p.dog.owner ? p.dog.owner.color : '#718096';
          return (
            <div key={index} className="race-lane">
              <span className="lane-number" style={{color: ownerColor, fontWeight: 'bold'}}>{index + 1}.</span>
              <span className="dog-name">{p.dog.name}</span>
              <div className="progress-bar">
                <div className="progress-fill" style={{width: `${p.progress}%`, background: ownerColor}}>
                  <span className="dog-runner">🐕</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
