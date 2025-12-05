import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { getDogImage } from '../utils/assetLoader';
import { AI_OWNER_NAME } from '../data/dogData';

export default function RaceAnimation({ raceState, currentTrack, raceData, gameState, onRaceComplete }) {
  const [displayTime, setDisplayTime] = useState(0);
  const [updatedRaceState, setUpdatedRaceState] = useState(raceState);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const raceRef = useRef(null);

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

  useEffect(() => {
    startTimeRef.current = Date.now();
    let finishedCount = 0;

    timerRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      setDisplayTime(elapsed);
    }, 10);

    raceRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      let allDone = true;

      const avgProgress = updatedRaceState.participants.reduce((sum, p) => sum + p.progress, 0) / 8;
      let phase = 'start';
      if (avgProgress > 25) phase = 'middle';
      if (avgProgress > 75) phase = 'sprint';

      updatedRaceState.participants.forEach(p => {
        if (p.progress < 100) {
          allDone = false;

          let currentSpeed = p.baseSpeed;

          if (phase === 'start') {
            const accelImportance = 1 + (1 - (currentTrack.distance / 2000));
            currentSpeed += p.accelerationBoost * accelImportance;
          }

          if (phase === 'sprint') {
            const distanceFactor = currentTrack.distance / 1000;
            const energyDrain = (1 - p.staminaFactor) * 1.5 * distanceFactor;
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
          }
        }
      });

      updatedRaceState.participants.sort((a, b) => {
        if (a.finishTime && b.finishTime) return a.finishTime - b.finishTime;
        if (a.finishTime) return -1;
        if (b.finishTime) return 1;
        return b.progress - a.progress;
      });

      updatedRaceState.participants.forEach((p, i) => {
        p.position = i + 1;
      });

      setUpdatedRaceState({ ...updatedRaceState });

      if (allDone) {
        clearInterval(raceRef.current);
        clearInterval(timerRef.current);

        updatedRaceState.isFinished = true;
        updatedRaceState.isRunning = false;

        setTimeout(() => {
          onRaceComplete(updatedRaceState);
        }, 1000);
      }
    }, 20);

    return () => {
      if (raceRef.current) clearInterval(raceRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const sortedParticipants = [...updatedRaceState.participants].sort((a, b) => a.position - b.position);

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
          const owned = isPlayerDog(p.dog);
          const owner = getDogOwner(p.dog);

          return (
            <motion.div
              key={p.id}
              layout
              transition={{
                layout: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
              }}
              className={`race-row-minimal ${owned ? 'owned-dog' : ''}`}
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
