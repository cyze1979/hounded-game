export default function Leaderboard({ players }) {
  const sortedPlayers = [...players].sort((a, b) => b.totalWinnings - a.totalWinnings);
  
  return (
    <div className="leaderboard-view">
      <h1 className="display-lg">STATISTIKEN</h1>
      <div className="label-md">
        Die erfolgreichsten Trainer
      </div>
      
      <div className="leaderboard-list">
        {sortedPlayers.map((player, index) => (
          <div 
            key={player.index} 
            className="leaderboard-item"
            style={{borderLeft: `4px solid ${player.color}`}}
          >
            <div className="rank">
              {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
            </div>
            <div className="player-info-leaderboard">
              <h3>{player.name}</h3>
              <div className="stats-row">
                <span>💰 {player.totalWinnings}€ Gewonnen</span>
                <span>🏆 {player.totalWins} Siege</span>
                <span>🏁 {player.totalRaces} Rennen</span>
                <span>📊 {player.getWinRate()}% Siegrate</span>
              </div>
            </div>
            <div className="current-money">
              <div className="money-amount">{player.money}€</div>
              <div className="money-label">Aktuelles Geld</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
