// ================================
// DUKEDOM - CORE ENGINE (Exact Clone)
// ================================

export class EndGame extends Error {
    constructor(reason) {
        const messages = {
            "pop loss": "You have so few peasants left that the High King has abolished your Ducal right.",
            "deposed": "The peasants are tired of war and starvation. You are deposed.",
            "land loss": "You have so little land left that you are deposed.",
            "retirement": "You have reached the age of retirement.",
            "overrun": "You have been overrun and lost your entire Dukedom.",
            "defeat": "Your head is placed atop of the castle gate.",
            "victory": "Wipe the blood from the crown - you are High King!",
            "beggared": "You have insufficient grain to pay the royal tax."
        };
        super(messages[reason] || "Game Over");
        this.reason = reason;
    }
}

// ================================
// GAME STATE
// ================================

export class GameState {
    constructor() {
        this.peasants = 100;
        this.grain = 4177;
        this.land = 600;
        this.year = 0;
        this.cropYield = 3.95;
        this.coolDown = 0;
        this.resentment = 0;

        // 100%, 80%, 60%, 40%, 20%, depleted
        this.buckets = [216, 200, 184, 0, 0, 0];
    }
}

// ================================
// GAME REPORT (exact structure)
// ================================

export class GameReport {
    constructor() {
        this.template = {
            "Peasants at start": 96,
            "Starvations": 0,
            "King's levy": 0,
            "War casualties": 0,
            "Looting victims": 0,
            "Disease victims": 0,
            "Natural deaths": -4,
            "Births": 8,
            "Peasants at end": 100,

            "Land at start": 600,
            "Bought/sold": 0,
            "Annexed land": 0,
            "Land at end of year": 600,

            "Grain at start": 5193,
            "Used for food": -1344,
            "Land deals": 0,
            "Seeding": -768,
            "Rat losses": 0,
            "Mercenary hire": 0,
            "Captured grain": 0,
            "Crop yield": 1516,
            "Castle expense": -120,
            "Royal tax": -300,
            "Grain at end of year": 4177
        };

        this.data = JSON.parse(JSON.stringify(this.template));
    }

    reset() {
        const zeroEachYear = [
            "Starvations",
            "King's levy",
            "Disease victims",
            "Bought/sold",
            "Land deals",
            "Rat losses",
            "Castle expense",
            "War casualties",
            "Looting victims",
            "Annexed land",
            "Captured grain",
            "Royal tax"
        ];
        zeroEachYear.forEach(key => this.data[key] = 0);
    }

    record(stat, value) {
        this.data[stat] = value;
    }
}

// ================================
// LAND BUCKET ALLOCATION (Exact Logic)
// ================================

export function* allocate(buckets, amount, proportional = false) {
    const n = buckets.length;
    for (let i = 0; i < buckets.length; i++) {
        let limit = proportional
            ? Math.round(buckets[i] / (n - i))
            : buckets[i];

        const x = Math.min(amount, limit);
        amount = Math.max(amount - x, 0);
        yield x;
    }
}