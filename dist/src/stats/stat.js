import { EventEmitter } from 'events';
import MovingAverage from '@vascosantos/moving-average';
export class Stat extends EventEmitter {
    constructor(initialCounters, options) {
        super();
        this._options = options;
        this._queue = [];
        this._stats = {};
        this._frequencyLastTime = Date.now();
        this._frequencyAccumulators = {};
        this._movingAverages = {};
        this._update = this._update.bind(this);
        initialCounters.forEach((key) => {
            this._stats[key] = BigInt(0);
            this._movingAverages[key] = {};
            this._options.movingAverageIntervals.forEach((interval) => {
                const ma = this._movingAverages[key][interval] = MovingAverage(interval);
                ma.push(this._frequencyLastTime, 0);
            });
        });
        this._enabled = this._options.enabled;
    }
    enable() {
        this._enabled = true;
    }
    disable() {
        this._enabled = false;
    }
    stop() {
        if (this._timeout != null) {
            clearTimeout(this._timeout);
        }
    }
    get snapshot() {
        return Object.assign({}, this._stats);
    }
    get movingAverages() {
        return Object.assign({}, this._movingAverages);
    }
    push(counter, inc) {
        if (this._enabled) {
            this._queue.push([counter, inc, Date.now()]);
            this._resetComputeTimeout();
        }
    }
    _resetComputeTimeout() {
        if (this._timeout != null) {
            clearTimeout(this._timeout);
        }
        this._timeout = setTimeout(this._update, this._nextTimeout());
    }
    _nextTimeout() {
        // calculate the need for an update, depending on the queue length
        const urgency = this._queue.length / this._options.computeThrottleMaxQueueSize;
        return Math.max(this._options.computeThrottleTimeout * (1 - urgency), 0);
    }
    _update() {
        this._timeout = undefined;
        if (this._queue.length > 0) {
            let last;
            while (this._queue.length > 0) {
                const op = last = this._queue.shift();
                (op != null) && this._applyOp(op);
            }
            (last != null) && this._updateFrequency(last[2]); // contains timestamp of last op
            this.emit('update', this._stats);
        }
    }
    _updateFrequency(latestTime) {
        const timeDiff = latestTime - this._frequencyLastTime;
        if (timeDiff > 0) {
            Object.keys(this._stats).forEach((key) => {
                this._updateFrequencyFor(key, timeDiff, latestTime);
            });
        }
        this._frequencyLastTime = latestTime;
    }
    _updateFrequencyFor(key, timeDiffMS, latestTime) {
        const count = this._frequencyAccumulators[key] ?? 0;
        this._frequencyAccumulators[key] = 0;
        const hz = (count / timeDiffMS) * 1000;
        let movingAverages = this._movingAverages[key];
        if (movingAverages == null) {
            movingAverages = this._movingAverages[key] = {};
        }
        this._options.movingAverageIntervals.forEach((movingAverageInterval) => {
            let movingAverage = movingAverages[movingAverageInterval];
            if (movingAverage == null) {
                movingAverage = movingAverages[movingAverageInterval] = MovingAverage(movingAverageInterval);
            }
            movingAverage.push(latestTime, hz);
        });
    }
    _applyOp(op) {
        const key = op[0];
        const inc = op[1];
        if (typeof inc !== 'number') {
            throw new Error(`invalid increment number: ${inc}`);
        }
        if (!Object.prototype.hasOwnProperty.call(this._stats, key)) {
            this._stats[key] = BigInt(0);
        }
        this._stats[key] = BigInt(this._stats[key]) + BigInt(inc);
        if (this._frequencyAccumulators[key] == null) {
            this._frequencyAccumulators[key] = 0;
        }
        this._frequencyAccumulators[key] += inc;
    }
}
//# sourceMappingURL=stat.js.map