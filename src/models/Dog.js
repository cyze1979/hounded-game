import { getUniqueDogName, AI_OWNER_NAME } from '../data/dogData';
import { assignDogImageToDog } from '../utils/assetLoader';

export class Dog {
    constructor(name = null, breed = 'Greyhound') {
        this.id = Date.now() + Math.random();
        this.name = name || getUniqueDogName(); // Verwendet unique Namen!
        this.breed = breed;
        this.age = Math.floor(Math.random() * 5) + 2;
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
        this.price = Math.floor((this.speed + this.stamina + this.acceleration + this.focus) * 10);
        
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
        
        // Trainer
        this.trainer = null;
        this.trainingEndsDay = null;
        
        // Owner - X Syndicate für nicht-Spieler-Hunde
        this.owner = AI_OWNER_NAME;
        
        // Image
        this.imageNumber = assignDogImageToDog(this);
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
            age: this.age,
            gender: this.gender,
            speed: this.speed,
            stamina: this.stamina,
            acceleration: this.acceleration,
            focus: this.focus,
            fitness: this.fitness,
            races: this.races,
            wins: this.wins,
            experience: this.experience,
            price: this.price,
            specialTrait: this.specialTrait,
            trainer: this.trainer,
            trainingEndsDay: this.trainingEndsDay,
            owner: this.owner,
            imageNumber: this.imageNumber
        };
    }
    
    static fromJSON(data) {
        const dog = new Dog();
        Object.assign(dog, data);
        return dog;
    }
}
