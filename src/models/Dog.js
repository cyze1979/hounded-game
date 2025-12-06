import { getUniqueDogName, AI_OWNER_NAME } from '../data/dogData';
import { assignDogImageToDog } from '../utils/assetLoader';

export class Dog {
    constructor(name = null, breed = 'Greyhound') {
        this.id = Date.now() + Math.random();
        this.name = name || getUniqueDogName();
        this.breed = breed;
        this.ageInMonths = (Math.floor(Math.random() * 3) + 2) * 12; // 2-4 years in months
        this.gender = Math.random() > 0.5 ? 'männlich' : 'weiblich';
        
        // Attributes (30-90)
        this.speed = Math.floor(Math.random() * 60) + 30;
        this.stamina = Math.floor(Math.random() * 60) + 30;
        this.acceleration = Math.floor(Math.random() * 60) + 30;
        this.focus = Math.floor(Math.random() * 60) + 30;
        this.fitness = 100;
        
        // Career
        this.races = 0;
        this.wins = 0;
        this.experience = 0;
        this.cupWins = 0;
        this.trackRecords = [];
        this.purchasePrice = null;
        this.totalEarnings = 0;
        this.racesParticipated = 0;
        this.bestPosition = null;
        this.worstPosition = null;
        this.averagePosition = null;
        this.totalPrizeMoney = 0;

        // XP and Level System
        this.level = 1;
        this.xp = 0;
        this.availablePoints = 0;
        
        // Special traits
        const traits = [
            'Liebt Leckerlis 🍖',
            'Jagt Schmetterlinge 🦋',
            'Hat buschige Augenbrauen 👁️',
            'Tanzt wenn es futtert 💃',
            'Schnarchend 😴',
            'Mag Bauchkraulen 🤗',
            'Bellt im Schlaf 🗣️',
            'Sammelt Stöckchen 🌿',
            'Furzt oft 💨',
            'Hasst Regen ☔',
            'Eingebildet 👑',
            'Schüchtern 🙈',
            'Verspielt 🎾',
            'Faul 😪',
            'Hyperaktiv ⚡'
        ];
        this.specialTrait = traits[Math.floor(Math.random() * traits.length)];
        
        // Owner - X Syndicate für nicht-Spieler-Hunde
        this.owner = AI_OWNER_NAME;
        
        // Image
        this.imageNumber = assignDogImageToDog(this);
    }
    
    // Age helper methods
    getAgeInYears() {
        return Math.floor(this.ageInMonths / 12);
    }
    
    getAgeCategory() {
        const years = this.getAgeInYears();
        if (years <= 2) return 'juvenile';
        if (years === 3) return 'young';
        if (years >= 4 && years <= 6) return 'prime';
        if (years >= 7 && years <= 8) return 'veteran';
        return 'elder';
    }
    
    getAgeCategoryName() {
        const categories = {
            juvenile: 'Junghund',
            young: 'Jung',
            prime: 'Prime',
            veteran: 'Veteran',
            elder: 'Senior'
        };
        return categories[this.getAgeCategory()];
    }
    
    getRacingPenalty() {
        const category = this.getAgeCategory();
        const penalties = {
            juvenile: 0.95, // -5%
            young: 0.98,    // -2%
            prime: 1.0,     // No penalty
            veteran: 0.97,  // -3%
            elder: 0.92     // -8%
        };
        return penalties[category];
    }
    
    getValue() {
        const baseRating = this.getOverallRating();
        const baseValue = baseRating * 20;
        
        // Age multiplier
        const category = this.getAgeCategory();
        const ageMultipliers = {
            juvenile: 0.6,
            young: 0.8,
            prime: 1.2,
            veteran: 0.7,
            elder: 0.4
        };
        
        let value = baseValue * ageMultipliers[category];
        
        // Cup wins bonus (later: +500 per win)
        value += this.cupWins * 500;
        
        // Track records bonus (later: +300 per record)
        value += this.trackRecords.length * 300;
        
        return Math.floor(value);
    }
    
    ageOneMonth() {
        this.ageInMonths += 1;
        
        // Check for category change
        const oldCategory = this.getAgeCategory();
        this.ageInMonths += 1;
        const newCategory = this.getAgeCategory();
        this.ageInMonths -= 1; // Revert for actual increment
        
        return {
            categoryChanged: oldCategory !== newCategory,
            oldCategory,
            newCategory
        };
    }
    
    getOverallRating() {
        return Math.floor((this.speed + this.stamina + this.acceleration + this.focus) / 4);
    }
    
    rest() {
        if (this.fitness >= 100) {
            return { success: false, message: `${this.name} ist bereits topfit!` };
        }
        this.fitness = Math.min(100, this.fitness + 30);
        return { success: true, message: `${this.name} hat sich ausgeruht. Fitness: ${this.fitness}` };
    }
    
    feed(type) {
        const foodTypes = {
            basic: { cost: 20, fitness: 10 },
            premium: { cost: 50, fitness: 20 },
            deluxe: { cost: 100, fitness: 30 }
        };
        
        const food = foodTypes[type];
        if (!food) return { success: false, message: 'Unbekannter Futtertyp!' };
        
        this.fitness = Math.min(100, this.fitness + food.fitness);
        return { success: true, message: `${this.name} wurde gefüttert. Fitness: ${this.fitness}`, cost: food.cost };
    }
    
    // XP and Level System
    getXpForNextLevel() {
        return 100 + (this.level - 1) * 50;
    }

    addXp(amount) {
        this.xp += amount;
        let leveledUp = false;

        while (this.xp >= this.getXpForNextLevel()) {
            this.xp -= this.getXpForNextLevel();
            this.level += 1;
            this.availablePoints += 1;
            leveledUp = true;
        }

        return leveledUp;
    }

    spendAttributePoint(attribute) {
        if (this.availablePoints <= 0) {
            return { success: false, message: 'Keine Attributpunkte verfügbar!' };
        }

        const validAttributes = ['speed', 'stamina', 'acceleration', 'focus'];
        if (!validAttributes.includes(attribute)) {
            return { success: false, message: 'Ungültiges Attribut!' };
        }

        if (this[attribute] >= 100) {
            return { success: false, message: 'Attribut ist bereits auf Maximum!' };
        }

        this[attribute] = Math.min(100, this[attribute] + 1);
        this.availablePoints -= 1;

        return { success: true, message: `${attribute} erhöht!` };
    }

    // Serialization
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            breed: this.breed,
            ageInMonths: this.ageInMonths,
            gender: this.gender,
            speed: this.speed,
            stamina: this.stamina,
            acceleration: this.acceleration,
            focus: this.focus,
            fitness: this.fitness,
            races: this.races,
            wins: this.wins,
            experience: this.experience,
            cupWins: this.cupWins,
            trackRecords: this.trackRecords,
            purchasePrice: this.purchasePrice,
            totalEarnings: this.totalEarnings,
            racesParticipated: this.racesParticipated,
            bestPosition: this.bestPosition,
            worstPosition: this.worstPosition,
            averagePosition: this.averagePosition,
            totalPrizeMoney: this.totalPrizeMoney,
            level: this.level,
            xp: this.xp,
            availablePoints: this.availablePoints,
            specialTrait: this.specialTrait,
            owner: this.owner,
            imageNumber: this.imageNumber
        };
    }

    static fromJSON(data) {
        const dog = new Dog();
        Object.assign(dog, data);

        // Migration: Convert old age to ageInMonths
        if (data.age !== undefined && data.ageInMonths === undefined) {
            dog.ageInMonths = data.age * 12;
        }

        // Ensure new properties exist
        if (dog.cupWins === undefined) dog.cupWins = 0;
        if (dog.trackRecords === undefined) dog.trackRecords = [];
        if (dog.purchasePrice === undefined) dog.purchasePrice = null;
        if (dog.totalEarnings === undefined) dog.totalEarnings = 0;
        if (dog.racesParticipated === undefined) dog.racesParticipated = 0;
        if (dog.bestPosition === undefined) dog.bestPosition = null;
        if (dog.worstPosition === undefined) dog.worstPosition = null;
        if (dog.averagePosition === undefined) dog.averagePosition = null;
        if (dog.totalPrizeMoney === undefined) dog.totalPrizeMoney = 0;

        // XP/Level System migration
        if (dog.level === undefined) dog.level = 1;
        if (dog.xp === undefined) dog.xp = 0;
        if (dog.availablePoints === undefined) dog.availablePoints = 0;

        return dog;
    }
}
