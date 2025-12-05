import { getDogImage } from '../utils/assetLoader';

export default function Stats({ gameState }) {
  const playerRankings = [...gameState.players]
    .sort((a, b) => {
      if (b.totalWins !== a.totalWins) return b.totalWins - a.totalWins;
      if (b.podiums !== a.podiums) return b.podiums - a.podiums;
      return b.totalPrizeMoney - a.totalPrizeMoney;
    });

  const allDogs = [];
  gameState.players.forEach(player => {
    player.dogs.forEach(dog => {
      allDogs.push({ dog, owner: player });
    });
  });

  const topDogsByWins = [...allDogs]
    .filter(item => item.dog.races > 0)
    .sort((a, b) => {
      if (b.dog.wins !== a.dog.wins) return b.dog.wins - a.dog.wins;
      return b.dog.totalPrizeMoney - a.dog.totalPrizeMoney;
    })
    .slice(0, 10);

  const topDogsByEarnings = [...allDogs]
    .filter(item => item.dog.totalPrizeMoney > 0)
    .sort((a, b) => b.dog.totalPrizeMoney - a.dog.totalPrizeMoney)
    .slice(0, 10);

  const topDogsByAverage = [...allDogs]
    .filter(item => item.dog.racesParticipated >= 3)
    .sort((a, b) => {
      const avgA = a.dog.averagePosition || 99;
      const avgB = b.dog.averagePosition || 99;
      return avgA - avgB;
    })
    .slice(0, 10);

  const recentRaces = [...(gameState.raceHistory || [])]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 10);

  return (
    <div className="stats-view">
      <div className="stats-header">
        <h1 className="display-lg">STATISTIKEN</h1>
        <p className="label-md" style={{color: 'var(--text-gray)'}}>
          Übersicht aller Spieler und Hunde
        </p>
      </div>

      <div className="stats-grid">
        <section className="stats-section">
          <h2 className="heading-lg">SPIELER RANKINGS</h2>
          <div className="rankings-table">
            <div className="rankings-header">
              <div className="col-rank">#</div>
              <div className="col-player">SPIELER</div>
              <div className="col-stat">RENNEN</div>
              <div className="col-stat">SIEGE</div>
              <div className="col-stat">PODIUMS</div>
              <div className="col-stat">PREISGELDER</div>
            </div>
            {playerRankings.map((player, idx) => (
              <div key={player.index} className="rankings-row">
                <div className="col-rank">
                  <span className="rank-badge">{idx + 1}</span>
                </div>
                <div className="col-player">
                  <span
                    className="player-color-badge"
                    style={{background: player.color}}
                  ></span>
                  <span className="player-name">{player.name}</span>
                  {player.isAi && <span className="ai-badge">KI</span>}
                </div>
                <div className="col-stat">{player.totalRaces || 0}</div>
                <div className="col-stat">{player.totalWins || 0}</div>
                <div className="col-stat">{player.podiums || 0}</div>
                <div className="col-stat">{(player.totalPrizeMoney || 0).toLocaleString()}€</div>
              </div>
            ))}
          </div>
        </section>

        <section className="stats-section">
          <h2 className="heading-lg">TOP HUNDE (NACH SIEGEN)</h2>
          <div className="dogs-table">
            {topDogsByWins.length === 0 ? (
              <p className="empty-state">Noch keine Rennsiege</p>
            ) : (
              topDogsByWins.map((item, idx) => (
                <div key={item.dog.id} className="dog-stats-row">
                  <div className="dog-rank">{idx + 1}</div>
                  <img
                    src={getDogImage(item.dog.imageNumber)}
                    alt={item.dog.name}
                    className="dog-icon"
                  />
                  <div className="dog-info">
                    <div className="dog-name">{item.dog.name}</div>
                    <div className="dog-owner">{item.owner.name}</div>
                  </div>
                  <div className="dog-stats">
                    <span>{item.dog.wins} Siege</span>
                    <span className="stat-separator">•</span>
                    <span>{item.dog.races} Rennen</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="stats-section">
          <h2 className="heading-lg">TOP HUNDE (NACH PREISGELDERN)</h2>
          <div className="dogs-table">
            {topDogsByEarnings.length === 0 ? (
              <p className="empty-state">Noch keine Preisgelder</p>
            ) : (
              topDogsByEarnings.map((item, idx) => (
                <div key={item.dog.id} className="dog-stats-row">
                  <div className="dog-rank">{idx + 1}</div>
                  <img
                    src={getDogImage(item.dog.imageNumber)}
                    alt={item.dog.name}
                    className="dog-icon"
                  />
                  <div className="dog-info">
                    <div className="dog-name">{item.dog.name}</div>
                    <div className="dog-owner">{item.owner.name}</div>
                  </div>
                  <div className="dog-stats">
                    <span>{item.dog.totalPrizeMoney.toLocaleString()}€</span>
                    <span className="stat-separator">•</span>
                    <span>{item.dog.races} Rennen</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="stats-section">
          <h2 className="heading-lg">TOP HUNDE (DURCHSCHNITTLICHE PLATZIERUNG)</h2>
          <div className="dogs-table">
            {topDogsByAverage.length === 0 ? (
              <p className="empty-state">Noch keine Daten (mind. 3 Rennen)</p>
            ) : (
              topDogsByAverage.map((item, idx) => (
                <div key={item.dog.id} className="dog-stats-row">
                  <div className="dog-rank">{idx + 1}</div>
                  <img
                    src={getDogImage(item.dog.imageNumber)}
                    alt={item.dog.name}
                    className="dog-icon"
                  />
                  <div className="dog-info">
                    <div className="dog-name">{item.dog.name}</div>
                    <div className="dog-owner">{item.owner.name}</div>
                  </div>
                  <div className="dog-stats">
                    <span>Ø {item.dog.averagePosition.toFixed(1)}</span>
                    <span className="stat-separator">•</span>
                    <span>{item.dog.racesParticipated} Rennen</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="stats-section full-width">
          <h2 className="heading-lg">RENN-HISTORIE</h2>
          <div className="races-table">
            {recentRaces.length === 0 ? (
              <p className="empty-state">Noch keine Rennen</p>
            ) : (
              <div className="races-header">
                <div className="col-date">DATUM</div>
                <div className="col-track">STRECKE</div>
                <div className="col-winner">GEWINNER</div>
                <div className="col-participants">TEILNEHMER</div>
              </div>
            )}
            {recentRaces.map((race) => {
              const participants = race.participants || [];
              const winner = participants.length > 0 ? participants[0] : null;

              return (
                <div key={race.id} className="race-history-row">
                  <div className="col-date">
                    {new Date(race.created_at).toLocaleDateString('de-DE')}
                  </div>
                  <div className="col-track">{race.track_name}</div>
                  <div className="col-winner">
                    {winner ? `${winner.dogName} (${winner.ownerName})` : 'N/A'}
                  </div>
                  <div className="col-participants">{participants.length}</div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
