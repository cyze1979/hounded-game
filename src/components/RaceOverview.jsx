import { useState } from 'react';
import { Dog } from '../models/Dog';
import { dogBreeds, AI_OWNER_NAME } from '../data/dogData';
import { getDogImage } from '../utils/assetLoader';
import DogDetailFull from './DogDetailFull';

export default function RaceOverview({ gameState, currentTrack, raceData, onRaceStart, getCurrentPlayer }) {
  const [selectedDog, setSelectedDog] = useState(null);
  const [allParticipants, setAllParticipants] = useState([]);

  if (!raceData || !currentTrack) {
    return <div className="race-view">Loading track data...</div>;
  }

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
            <h1 className="display-lg">{raceData.name}</h1>
            <div className="label-md">
              <span className="race-distance">{raceData.distance}m</span>
              <span className="race-separator"> • </span>
              <span className="race-record">
                Bestzeit: {raceData.bestTime ? `${raceData.bestTime.toFixed(2)}s (${raceData.bestTimeHolder})` : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        <div className="participants-table-container">
          <h3 className="heading-md">TEILNEHMER</h3>

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
              const owned = isPlayerDog(p.dog);
              const owner = getDogOwner(p.dog);

              return (
                <div key={`prev-${index}`} className={`participant-row ${owned ? 'owned-dog' : ''}`}>
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
          <button className="btn-cta race-start-btn" onClick={() => onRaceStart(raceDogs)}>
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
          setGameState={() => {}}
          onClose={() => setSelectedDog(null)}
          isRaceView={true}
          isPlayerDog={isPlayerDog(selectedDog)}
        />
      )}
    </>
  );
}
