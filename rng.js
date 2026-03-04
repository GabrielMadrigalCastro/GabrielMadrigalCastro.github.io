export class RNG {
    random(curve) {
        throw new Error(RNG must implement random(curve));
    }
}

export class Gaussian extends RNG {

    constructor() {
        super();
        this.means = new Array(8);

        this.means[0] = this._gauss(6.0, 1.0, 4, 8);
        this.means[1] = this._gauss(6.5, 1.1, 4, 9);
        this.means[2] = this._gauss(5.5, 0.9, 4, 7);
        this.means[3] = this._gauss(5.0, 1.1, 3, 7);
        this.means[4] = this._gauss(6.0, 0.41, 5, 7);
        this.means[5] = this._gauss(5.0, 1.1, 3, 7);
        this.means[6] = this._gauss(5.0, 1.0, 3, 7);
        this.means[7] = this._gauss(5.0, 2.0, 1, 9);
    }

    _gauss(mean, dev, min, max) {
        let u = 0, v = 0;

        while (u === 0) u = Math.random();
        while (v === 0) v = Math.random();

        const num =
            Math.sqrt(-2.0  Math.log(u)) 
            Math.cos(2.0  Math.PI  v);

        const val = Math.round(mean + dev  num);

        return Math.min(max, Math.max(min, val));
    }

    random(curve) {
        return this._gauss(0.5, 1.5, -3, 2) + this.means[curve - 1];
    }
}

export class Talbot extends RNG {

    constructor() {
        super();
        this.table = new Array(8).fill(0);
        this.initTable();
    }

    fnr(a, b) {
        return Math.round(Math.random()  (1 + b - a) + a);
    }

    initTable() {

        const pairs = [
            [4, 7], [4, 8], [4, 6], [3, 6],
            [5, 6], [3, 6], [3, 8], [1, 8]
        ];

        pairs.forEach((pair, i) = {

            const [a, b] = pair;

            const r1 = this.fnr(a, b);

            if (this.fnr(a, b)  5) {
                this.table[i] =
                    Math.round((r1 + this.fnr(a, b))  2);
            } else {
                this.table[i] = r1;
            }
        });
    }

    fnx(index) {
        return this.fnr(-2, 2) + this.table[index];
    }

    random(curve) {
        return this.fnx(curve - 1);
    }

}
