export class Player {
    constructor(name, color, index) {
        this.name = name;
        this.color = color;
        this.index = index;
        this.money = 5000;
        this.dogs = [];
        this.bets = [];
        this.totalWinnings = 0;
        this.totalRaces = 0;
        this.totalWins = 0;
        this.isAi = false;
        this.podiums = 0;
        this.totalPrizeMoney = 0;
        this.bestMonth = '';
    }
    
    getWinRate() {
        if (this.totalRaces === 0) return 0;
        return ((this.totalWins / this.totalRaces) * 100).toFixed(1);
    }
    
    // Serialization
    toJSON() {
        return {
            name: this.name,
            color: this.color,
            index: this.index,
            money: this.money,
            dogs: this.dogs.map(d => d.toJSON()),
            bets: this.bets,
            totalWinnings: this.totalWinnings,
            totalRaces: this.totalRaces,
            totalWins: this.totalWins,
            isAi: this.isAi,
            podiums: this.podiums,
            totalPrizeMoney: this.totalPrizeMoney,
            bestMonth: this.bestMonth
        };
    }

    static fromJSON(data) {
        const player = new Player(data.name, data.color, data.index);
        player.money = data.money;
        player.bets = data.bets || [];
        player.totalWinnings = data.totalWinnings || 0;
        player.totalRaces = data.totalRaces || 0;
        player.totalWins = data.totalWins || 0;
        player.isAi = data.isAi || false;
        player.podiums = data.podiums || 0;
        player.totalPrizeMoney = data.totalPrizeMoney || 0;
        player.bestMonth = data.bestMonth || '';
        // Dogs will be loaded separately
        return player;
    }
}
