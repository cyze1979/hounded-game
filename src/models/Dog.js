export class Dog {
    constructor(name, breed, owner = null) {
        this.id = Date.now() + Math.random();
        this.name = name;
        this.breed = breed;
        this.owner = owner;
        
        // Generate random gender
        this.gender = Math.random() > 0.5 ? 'männlich' : 'weiblich';
        
        // Base performance attributes (0-100) - permanent, trainable
        this.speed = 40 + Math.floor(Math.random() * 40);
        this.stamina = 40 + Math.floor(Math.random() * 40);
        this.acceleration = 40 + Math.floor(Math.random() * 40);
        this.focus = 40 + Math.floor(Math.random() * 40);
        
        // State attributes
        this.fitness = 100;
        this.age = 2 + Math.floor(Math.random() * 3); // 2-4 Jahre
        this.experience = 0;
        
        // Special trait (fun factor)
        this.specialTrait = this.generateSpecialTrait();
        
        // Price calculation
        this.price = this.calculatePrice();
        
        // Racing stats
        this.wins = 0;
        this.races = 0;
        
        // Trainer
        this.trainer = null;
        
        // History tracking
        this.raceHistory = [];
        this.attributeHistory = [{
            day: 1,
            speed: this.speed,
            stamina: this.stamina,
            acceleration: this.acceleration,
            focus: this.focus
        }];
    }
    
    generateSpecialTrait() {
        const traits = [
            "Liebt Leckerlis 🍖",
            "Jagt gerne Schmetterlinge 🦋",
            "Hat einen weißen Fleck ⚪",
            "Schläft sehr viel 😴",
            "Spielt gerne mit Bällen ⚽",
            "Mag Bauchkraulen 💕",
            "Bellt beim Frühstück 🗣️",
            "Läuft Kreise vor Freude 🌀",
            "Wedelt mit dem Schwanz ständig 🎾",
            "Macht gerne Mittagsschläfchen 🌙",
            "Liebt Kopfkraulen 👋",
            "Sammelt Spielzeuge 🧸",
            "Gräbt gerne Löcher 🕳️",
            "Hat buschige Augenbrauen 👁️",
            "Schnuppert an allem 👃",
            "Träumt laut im Schlaf 💭",
            "Stibitzt manchmal Socken 🧦",
            "Hat besonders weiches Fell ✨",
            "Liebt Autofahrten 🚗",
            "Tanzt wenn es Futter gibt 💃"
        ];
        return traits[Math.floor(Math.random() * traits.length)];
    }
    
    calculatePrice() {
        const avgStats = (this.speed + this.stamina + this.acceleration + this.focus) / 4;
        const ageModifier = this.age === 2 ? 1.2 : (this.age === 3 ? 1.0 : 0.8);
        return Math.floor(500 + avgStats * 30 * ageModifier + Math.random() * 500);
    }
    
    getOverallRating() {
        const baseRating = (this.speed + this.stamina + this.acceleration + this.focus) / 4;
        const fitnessModifier = this.fitness / 100;
        const experienceBonus = Math.min(this.experience * 0.5, 10);
        return Math.floor(baseRating * fitnessModifier + experienceBonus);
    }
    
    getDailyForm() {
        return Math.floor(Math.random() * 21) - 10; // -10 to +10
    }
    
    assignTrainer(trainerId, trainers, gameDay) {
        const trainer = trainers.find(t => t.id === trainerId);
        if (!trainer) return { success: false, message: 'Trainer nicht gefunden!' };
        
        const player = this.owner;
        if (!player || player.money < trainer.cost) {
            return { success: false, message: 'Nicht genug Geld!' };
        }
        
        player.money -= trainer.cost;
        this.trainer = trainer;
        
        // Apply training immediately
        this.speed = Math.min(100, this.speed + trainer.bonuses.speed);
        this.stamina = Math.min(100, this.stamina + trainer.bonuses.stamina);
        this.acceleration = Math.min(100, this.acceleration + trainer.bonuses.acceleration);
        this.focus = Math.min(100, this.focus + trainer.bonuses.focus);
        
        // Track in history
        this.attributeHistory.push({
            day: gameDay,
            speed: this.speed,
            stamina: this.stamina,
            acceleration: this.acceleration,
            focus: this.focus
        });
        
        return { success: true, message: `${trainer.name} wurde engagiert und hat ${this.name} trainiert!` };
    }
    
    rest() {
        this.fitness = Math.min(100, this.fitness + 30);
        return { success: true, message: `${this.name} hat sich ausgeruht und fühlt sich besser!` };
    }
    
    feed(quality) {
        const costs = { basic: 20, premium: 50, deluxe: 100 };
        const benefits = { basic: 10, premium: 20, deluxe: 30 };
        const player = this.owner;
        
        if (!player || player.money < costs[quality]) {
            return { success: false, message: 'Nicht genug Geld!' };
        }
        
        player.money -= costs[quality];
        this.fitness = Math.min(100, this.fitness + benefits[quality]);
        
        return { success: true, message: `${this.name} wurde gefüttert und ist zufrieden!` };
    }
    
    // Serialization for save/load
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            breed: this.breed,
            gender: this.gender,
            speed: this.speed,
            stamina: this.stamina,
            acceleration: this.acceleration,
            focus: this.focus,
            fitness: this.fitness,
            age: this.age,
            experience: this.experience,
            specialTrait: this.specialTrait,
            price: this.price,
            wins: this.wins,
            races: this.races,
            trainer: this.trainer,
            raceHistory: this.raceHistory,
            attributeHistory: this.attributeHistory
        };
    }
    
    static fromJSON(data, owner = null) {
        const dog = new Dog(data.name, data.breed, owner);
        Object.assign(dog, data);
        dog.owner = owner;
        return dog;
    }
}
