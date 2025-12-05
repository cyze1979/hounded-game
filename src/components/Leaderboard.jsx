export default function Leaderboard({ players }) {
  const sortedPlayers = [...players].sort((a, b) => b.totalWinnings - a.totalWinnings);
  
  return (
    <div className="leaderboard-view">
      <h2 className="heading-xl">STATISTIKEN</h2>
      <p className="label-md" style={{color: 'var(--text-gray)', marginBottom: '20px'}}>
        Die erfolgreichsten Trainer
      </p>
      
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
