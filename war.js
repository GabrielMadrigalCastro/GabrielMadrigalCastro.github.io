// ================================
// DUKEDOM - WAR SYSTEM
// Exact mechanical combat resolution
// ================================

import { EndGame } from "./engine.js";

export class WarSystem {

    constructor(distributions) {
        this.distributions = distributions;
    }

    // ================================
    // HIRE MERCENARIES
    // ================================

    hireMercenaries(game, report, amount) {

        if (amount <= 0) return 0;

        const costPer = 8;
        const totalCost = amount * costPer;

        if (totalCost > game.grain)
            throw new Error("Not enough grain to hire mercenaries.");

        game.grain -= totalCost;
        report.record("Mercenary hire", -totalCost);

        return amount;
    }

    // ================================
    // CHECK FOR INVASION
    // ================================

    checkForWar(game) {

        const threat = this.distributions.random(7);

        if (threat < 5)
            return null;

        const enemyStrength =
            Math.round(game.land / 12) +
            this.distributions.random(6);

        return {
            strength: enemyStrength
        };
    }

    // ================================
    // RESOLVE BATTLE
    // ================================

    resolveBattle(game, report, mercenaries) {

        const invasion = this.checkForWar(game);

        if (!invasion)
            return;

        const peasantLevy = Math.round(game.peasants / 5);

        const defense =
            peasantLevy +
            mercenaries +
            this.distributions.random(5);

        const attack =
            invasion.strength +
            this.distributions.random(4);

        // ================================
        // DEFEAT
        // ================================

        if (attack > defense) {

            const casualties =
                -Math.round(game.peasants / 4);

            game.peasants += casualties;
            report.record("War casualties", casualties);

            const landLost =
                Math.round(game.land * 0.15);

            game.land -= landLost;
            report.record("Annexed land", -landLost);

            const grainLooted =
                -Math.round(game.grain * 0.2);

            game.grain += grainLooted;
            report.record("Looting victims", grainLooted);

            if (game.land <= 0)
                throw new EndGame("overrun");

            if (game.peasants <= 20)
                throw new EndGame("defeat");

        }

        // ================================
        // VICTORY
        // ================================

        else {

            const casualties =
                -Math.round(peasantLevy / 3);

            game.peasants += casualties;
            report.record("War casualties", casualties);

            const landGained =
                Math.round(invasion.strength / 3);

            game.land += landGained;
            report.record("Annexed land", landGained);

            const grainCaptured =
                Math.round(invasion.strength * 12);

            game.grain += grainCaptured;
            report.record("Captured grain", grainCaptured);

            // possible High King victory condition
            if (game.land >= 1600)
                throw new EndGame("victory");
        }
    }
}