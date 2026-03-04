// ================================
// DUKEDOM - GAME STATE CONTROLLER
// Exact mechanical clone of dukedom()
// ================================

import {
    GameState,
    GameReport,
    EndGame,
    allocate
} from "./engine.js";

import { Gaussian, Talbot } from "./rng.js";

import { WarSystem } from "./war.js";

export class DukedomGame {

    constructor(useTalbot = false) {
        this.state = new GameState();
        this.report = new GameReport();
        this.distributions = useTalbot ? new Talbot() : new Gaussian();
		this.war = new WarSystem(this.distributions)
        this.king = 0;
        this.externalResentment = 0;
    }

    // ================================
    // MAIN YEAR PROCESS
    // ================================

    processYear(decisions) {
        const game = this.state;
        const report = this.report;

        // END GAME CHECKS (start of year)
        if (game.peasants < 33) throw new EndGame("pop loss");
        if (game.land < 200) throw new EndGame("land loss");
        if (this.externalResentment > 88 || game.resentment > 99 || game.grain < 429)
            throw new EndGame("deposed");
        if (game.year > 45 && this.king === 0)
            throw new EndGame("retirement");

        game.year++;

        report.record("Peasants at start", game.peasants);
        report.record("Land at start", game.land);
        report.record("Grain at start", game.grain);
        report.reset();

        this.externalResentment = 0;

        // ================================
        // FEED PEASANTS
        // ================================

        let food = decisions.food;
        let totalFood;

        if (food > 100) {
            totalFood = food;
        } else {
            totalFood = food * game.peasants;
        }

        if (totalFood > game.grain)
            throw new Error("Not enough grain.");

        game.grain -= totalFood;
        report.record("Used for food", -totalFood);

        const foodPerCapita = Math.floor(totalFood / game.peasants);

        let starved = 0;
        if (foodPerCapita < 13) {
            starved = game.peasants - Math.floor(totalFood / 13);
            game.peasants -= starved;
            report.record("Starvations", -starved);
        }

        const overfed = Math.min(4, foodPerCapita - 14);
        this.externalResentment += (3 * starved) - (2 * overfed);

        // ================================
        // LAND MARKET
        // ================================

        const bid = Math.round(2 * game.cropYield + this.distributions.random(1) - 5);
        const landTrade = decisions.landTrade;

        if (landTrade > 0) {
            const cost = landTrade * bid;
            if (cost > game.grain)
                throw new Error("Not enough grain to buy land.");

            game.land += landTrade;
            game.buckets[2] += landTrade;
            game.grain -= cost;

            report.record("Bought/sold", landTrade);
            report.record("Land deals", -cost);

        } else if (landTrade < 0) {

            const sell = Math.abs(landTrade);
            const sellable = game.buckets.slice(0, 3).reduce((a, b) => a + b, 0);

            if (sell > sellable)
                throw new Error("Not enough good land.");

            const offer = bid - 1;
            const received = sell * offer;

            game.land -= sell;

            const reversed = [...game.buckets.slice(0, 3)].reverse();
            const soldBuckets = [...allocate(reversed, sell)].reverse();

            game.buckets = game.buckets.map((v, i) =>
                v - (soldBuckets[i] || 0)
            );

            game.grain += received;

            report.record("Bought/sold", -sell);
            report.record("Land deals", received);
        }

        // ================================
        // PLANTING
        // ================================

        const farmed = decisions.plant;

        if (farmed > game.land)
            throw new Error("Not enough land.");
        if (farmed * 2 > game.grain)
            throw new Error("Not enough grain to plant.");
        if (farmed > game.peasants * 4)
            throw new Error("Not enough workers.");

        const seeding = -(farmed * 2);
        game.grain += seeding;
        report.record("Seeding", seeding);

        // ================================
        // CROP YIELD
        // ================================

        let yld = this.distributions.random(2) + 9;

        if ((game.year % 7) === 0) {
            yld = Math.round(yld * 0.65);
        }

        const sown = [...allocate(game.buckets, farmed)];
        const fallow = game.buckets.map((v, i) => v - (sown[i] || 0));

        const weighted = sown.slice(0, 5)
            .reduce((sum, area, i) =>
                sum + area * (1 - (0.2 * i)), 0);

        game.cropYield = farmed > 0
            ? Math.round(yld * (weighted / farmed) * 100) / 100
            : 0;

        const depletion = [0, ...sown.slice(0, 4), sown.slice(4).reduce((a, b) => a + b, 0)];
        const nutrition = [
            fallow.slice(0, 3).reduce((a, b) => a + b, 0),
            ...fallow.slice(3),
            0,
            0
        ];

        game.buckets = game.buckets.map((v, i) =>
            (depletion[i] || 0) + (nutrition[i] || 0)
        );

        let harvest = Math.round(game.cropYield * farmed);

        // ================================
        // RATS
        // ================================

        const cropHazards = this.distributions.random(3) + 3;

        if (cropHazards > 9) {
            const eaten = Math.round((cropHazards * game.grain) / 83);
            game.grain -= eaten;
            report.record("Rat losses", -eaten);
        }

        // ================================
        // PLAGUE & DISEASE
        // ================================

        let deaths = 0;
        const outbreak = this.distributions.random(8) + 1;

        game.coolDown--;

        if (outbreak === 1 && game.coolDown === 0) {
            game.coolDown = 13;
            deaths = -Math.round(game.peasants / 3);
        } else if (outbreak < 4) {
            deaths = -Math.round(game.peasants / (outbreak * 5));
        }

        game.peasants += deaths;
        report.record("Disease victims", deaths);

        const naturalDeaths = Math.round(0.3 - game.peasants / 22);
        report.record("Natural deaths", naturalDeaths);

        const births = Math.round(game.peasants / (this.distributions.random(8) + 4));

        // ================================
        // TAX & EXPENSES
        // ================================

        const milling = harvest > 4000
            ? Math.round((harvest - 4000) * 0.1)
            : 0;

        report.record("Castle expense", -120 - milling);

        let landTax = this.king >= 0
            ? Math.round(game.land / 2)
            : 0;

        if (this.king >= 2)
            landTax *= 2;

        if (landTax > game.grain)
            throw new EndGame("beggared");

        report.record("Royal tax", -landTax);


		// ================================
		// WAR PHASE
		// ================================

		const mercenaries =
			this.war.hireMercenaries(
				game,
				report,
				decisions.mercenaries || 0
			);

		this.war.resolveBattle(
			game,
			report,
			mercenaries
		);

        // ================================
        // END OF YEAR UPDATES
        // ================================

        game.peasants += births + naturalDeaths;
        game.grain += harvest - milling - landTax;

        game.resentment =
            Math.round(game.resentment * 0.85) +
            this.externalResentment;

        report.record("Births", births);
        report.record("Crop yield", harvest);
        report.record("Peasants at end", game.peasants);
        report.record("Land at end of year", game.land);
        report.record("Grain at end of year", game.grain);

        return report.data;
    }
}