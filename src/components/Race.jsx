import { useState, useEffect } from 'react';
import { dogBreeds } from '../data/dogData';
import { getAllTracks, getTrackForMonth, RACE_PRIZES } from '../data/trackData';
import { saveRace } from '../utils/supabaseGame';
import RaceOverview from './RaceOverview';
import RaceAnimation from './RaceAnimation';
import RaceResults from './RaceResults';

export default function Race({ gameState, setGameState, getCurrentPlayer }) {
  const [raceState, setRaceState] = useState(null);
  const [showResults, setShowResults] = useState(false);

  const currentMonth = gameState.currentMonth || 1;
  const currentTrack = getTrackForMonth(currentMonth);

  useEffect(() => {
    if (!gameState.tracks) {
      const tracks = {};
      getAllTracks().forEach(track => {
        tracks[track.name] = {
          ...track,
          bestTime: null,
          bestTimeHolder: null,
          lastWinner: null,
          lastResults: null,
          racesHeld: 0
        };
      });
      setGameState({ ...gameState, tracks });
    }
  }, []);

  const raceData = gameState.tracks && currentTrack ? gameState.tracks[currentTrack.name] : null;

  const isPlayerDog = (dog) => {
    return gameState.players.some(player =>
      player.dogs.some(d => d.id === dog.id)
    );
  };

  const getAttributeWeights = (distance) => {
    if (distance <= 800) {
      return { speed: 0.50, stamina: 0.10, acceleration: 0.30, focus: 0.10 };
    } else if (distance <= 1000) {
      return { speed: 0.45, stamina: 0.20, acceleration: 0.25, focus: 0.10 };
    } else if (distance <= 1200) {
      return { speed: 0.35, stamina: 0.30, acceleration: 0.20, focus: 0.15 };
    } else if (distance <= 1500) {
      return { speed: 0.30, stamina: 0.40, acceleration: 0.15, focus: 0.15 };
    } else {
      return { speed: 0.25, stamina: 0.50, acceleration: 0.10, focus: 0.15 };
    }
  };

  const startRace = (raceDogs) => {
    raceDogs.sort(() => Math.random() - 0.5);

    const weights = getAttributeWeights(currentTrack.distance);

    const newRace = {
      participants: raceDogs.map((dog, index) => {
        const baseSpeed = (
          dog.speed * weights.speed +
          dog.stamina * weights.stamina +
          dog.acceleration * weights.acceleration +
          dog.focus * weights.focus
        ) / 100;

        const fitnessFactor = Math.max(0.85, dog.fitness / 100);
        const focusFactor = dog.focus / 100;
        const distanceMultiplier = 800 / currentTrack.distance;

        return {
          id: `racer-${index}`,
          dog: dog,
          progress: 0,
          position: index + 1,
          baseSpeed: baseSpeed * fitnessFactor * distanceMultiplier,
          accelerationBoost: (dog.acceleration / 100) * 0.15 * distanceMultiplier,
          staminaFactor: dog.stamina / 100,
          focusFactor: focusFactor,
          energy: 100,
          finishTime: null
        };
      }),
      isRunning: true,
      isFinished: false,
      raceName: raceData.name
    };

    setRaceState(newRace);
    setShowResults(false);

    setGameState({
      ...gameState,
      currentRace: { exists: true },
      raceCompleted: false
    });
  };

  const handleRaceComplete = (completedRaceState) => {
    const prizes = RACE_PRIZES[completedRaceState.raceName] || {};
    const updatedGameState = { ...gameState };

    const winner = completedRaceState.participants[0];
    if (!raceData.bestTime || winner.finishTime < raceData.bestTime) {
      raceData.bestTime = winner.finishTime;
      raceData.bestTimeHolder = winner.dog.name;
    }

    completedRaceState.participants.forEach((p, idx) => {
      const position = idx + 1;
      const prize = prizes[position] || 0;
      p.prize = prize;

      if (p.dog.races !== undefined) {
        p.dog.races++;
        p.dog.experience += 10;
        p.dog.fitness = Math.max(0, p.dog.fitness - 15);

        if (position === 1) {
          p.dog.wins++;
          raceData.lastWinner = p.dog.name;
        }

        if (isPlayerDog(p.dog)) {
          const owner = updatedGameState.players.find(pl => pl.dogs.includes(p.dog));
          if (owner) {
            owner.money += prize;
            p.dog.totalEarnings += prize;
            if (position === 1) {
              owner.totalWins = (owner.totalWins || 0) + 1;
            }
          }
        }
      }
    });

    raceData.lastResults = { race: completedRaceState };
    setGameState(updatedGameState);
    setRaceState(completedRaceState);
    setShowResults(true);

    if (gameState.sessionId) {
      const winnerDog = completedRaceState.participants[0].dog;
      const participantIds = completedRaceState.participants.map(p => p.dog.id);
      const totalPrizes = Object.values(prizes).reduce((sum, p) => sum + p, 0);

      saveRace(
        gameState.sessionId,
        gameState.gameDay,
        currentTrack.name,
        currentTrack.distance,
        winnerDog.id,
        totalPrizes,
        participantIds
      ).catch(err => console.error('Failed to save race:', err));
    }
  };

  const continueAfterResults = () => {
    if (raceData) {
      raceData.lastResults = null;
    }
    setRaceState(null);
    setShowResults(false);

    gameState.players.forEach(player => {
      player.dogs.forEach(dog => {
        dog.ageInMonths += 1;
      });
    });

    setGameState({
      ...gameState,
      currentRace: null,
      raceCompleted: false,
      currentMonth: (gameState.currentMonth || 1) + 1
    });
  };

  if (!gameState.tracks) {
    return <div className="race-view">Initializing...</div>;
  }

  if (!raceState && !showResults) {
    return (
      <RaceOverview
        gameState={gameState}
        currentTrack={currentTrack}
        raceData={raceData}
        onRaceStart={startRace}
        getCurrentPlayer={getCurrentPlayer}
      />
    );
  }

  if (showResults && raceState && raceState.isFinished) {
    return (
      <RaceResults
        raceState={raceState}
        currentTrack={currentTrack}
        raceData={raceData}
        gameState={gameState}
        onContinue={continueAfterResults}
      />
    );
  }

  if (raceState && raceState.isRunning) {
    return (
      <RaceAnimation
        raceState={raceState}
        currentTrack={currentTrack}
        raceData={raceData}
        gameState={gameState}
        onRaceComplete={handleRaceComplete}
      />
    );
  }

  return null;
}
