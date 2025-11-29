export class Player {
    constructor(name, color, index) {
        this.name = name;
        this.color = color;
        this.index = index;
        this.money = 20000; // Increased for testing
        this.dogs = [];
        this.bets = [];
        this.totalWinnings = 0;
        this.totalRaces = 0;
        this.totalWins = 0;
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
            totalWins: this.totalWins
        };
    }
    
    static fromJSON(data) {
        const player = new Player(data.name, data.color, data.index);
        player.money = data.money;
        player.bets = data.bets || [];
        player.totalWinnings = data.totalWinnings || 0;
        player.totalRaces = data.totalRaces || 0;
        player.totalWins = data.totalWins || 0;
        // Dogs will be loaded separately
        return player;
    }
}
