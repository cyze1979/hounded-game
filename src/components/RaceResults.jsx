import { RACE_PRIZES } from '../data/trackData';
import { AI_OWNER_NAME } from '../data/dogData';

export default function RaceResults({ raceState, currentTrack, raceData, gameState, onContinue }) {
  if (!raceState || !raceState.isFinished) {
    return null;
  }

  const prizes = RACE_PRIZES[raceState.raceName] || {};

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

  return (
    <div className="race-view">
      <div className="results-screen">
        <div className="results-header">
          <h2 className="results-title">{raceState.raceName}</h2>
          <div className="race-meta">
            <span className="race-distance">{currentTrack.distance}m</span>
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
            const owned = isPlayerDog(p.dog);
            const owner = getDogOwner(p.dog);
            const prize = p.prize || 0;

            return (
              <div key={p.id} className={`results-row ${owned ? 'owned-dog' : ''}`}>
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
          <button className="btn-cta" onClick={onContinue}>
            NÄCHSTES RENNEN
          </button>
        </div>
      </div>
    </div>
  );
}
