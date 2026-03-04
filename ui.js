// ================================
// DUKEDOM - BROWSER UI
// ================================

import { DukedomGame } from "./state.js";
import { EndGame } from "./engine.js";

export class DukedomUI {

    constructor(rootId = "app") {
        this.root = document.getElementById(rootId);
        this.game = new DukedomGame(false);

        this.render();
        this.renderReport(this.game.report.data);
    }

    // ================================
    // RENDER BASE LAYOUT
    // ================================

    render() {
        this.root.innerHTML = `
            <h1>DUKEDOM</h1>

            <div id="status"></div>

            <div id="report" class="panel"></div>

            <div class="panel">
                <h3>Decisions</h3>

                <label>Food per peasant:
                    <input type="number" id="food" value="15">
                </label><br>

                <label>Land to buy (+) / sell (-):
                    <input type="number" id="landTrade" value="0">
                </label><br>

                <label>Land to plant:
                    <input type="number" id="plant" value="300">
                </label><br>

                <label>Mercenaries to hire:
                    <input type="number" id="mercenaries" value="0">
                </label><br><br>

                <button id="nextYear">End Year</button>
            </div>
        `;

        document
            .getElementById("nextYear")
            .addEventListener("click", () => this.nextYear());
    }

    // ================================
    // PROCESS TURN
    // ================================

    nextYear() {
        const decisions = {
            food: parseInt(document.getElementById("food").value),
            landTrade: parseInt(document.getElementById("landTrade").value),
            plant: parseInt(document.getElementById("plant").value),
            mercenaries: parseInt(document.getElementById("mercenaries").value)
        };

        try {
            const report = this.game.processYear(decisions);
            this.renderReport(report);
            this.renderStatus();

        } catch (e) {

            if (e instanceof EndGame) {
                alert(e.message);
                this.resetGame();
            } else {
                alert(e.message);
            }
        }
    }

    // ================================
    // RENDER REPORT
    // ================================

    renderReport(data) {

        const reportDiv = document.getElementById("report");

        let html = `<h3>Year ${this.game.state.year}</h3><pre>`;

        for (let key in data) {
            html += `${key}: ${data[key]}\n`;
        }

        html += `</pre>`;

        reportDiv.innerHTML = html;
    }

    // ================================
    // RENDER STATUS BAR
    // ================================

    renderStatus() {

        const s = this.game.state;

        document.getElementById("status").innerHTML = `
            <strong>Peasants:</strong> ${s.peasants} |
            <strong>Land:</strong> ${s.land} |
            <strong>Grain:</strong> ${s.grain} |
            <strong>Resentment:</strong> ${s.resentment}
        `;
    }

    // ================================
    // RESET GAME
    // ================================

    resetGame() {
        this.game = new DukedomGame(false);
        this.renderReport(this.game.report.data);
        this.renderStatus();
    }
}