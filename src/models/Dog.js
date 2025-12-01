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
        this.cupWins = 0; // NEW: Championship wins
        this.trackRecords = []; // NEW: Track record holder
        this.lastTrainedMonth = null; // NEW: Track when last trained
        this.lastTrainedMonth = null; // NEW: Track when dog was last trained
        
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
    
    getTrainingEfficiency() {
        const category = this.getAgeCategory();
        const efficiencies = {
            juvenile: 1.5,  // +50%
            young: 1.25,    // +25%
            prime: 1.0,     // Normal
            veteran: 0.75,  // -25%
            elder: 0.5      // -50%
        };
        return efficiencies[category];
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
    
    assignTrainer(trainerId, trainers, currentDay) {
        const trainer = trainers.find(t => t.id === trainerId);
        if (!trainer) {
            return { success: false, message: 'Trainer nicht gefunden!' };
        }
        
        this.trainer = trainer;
        this.trainingEndsDay = currentDay + trainer.duration;
        
        return { 
            success: true, 
            message: `${trainer.name} trainiert ${this.name} für ${trainer.duration} Tage!`,
            cost: trainer.cost 
        };
    }
    
    completeTraining() {
        if (!this.trainer) return;
        
        this.speed = Math.min(100, this.speed + this.trainer.bonuses.speed);
        this.stamina = Math.min(100, this.stamina + this.trainer.bonuses.stamina);
        this.acceleration = Math.min(100, this.acceleration + this.trainer.bonuses.acceleration);
        this.focus = Math.min(100, this.focus + this.trainer.bonuses.focus);
        
        this.trainer = null;
        this.trainingEndsDay = null;
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
            lastTrainedMonth: this.lastTrainedMonth,
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
        if (dog.lastTrainedMonth === undefined) dog.lastTrainedMonth = null;
        
        return dog;
    }
}
