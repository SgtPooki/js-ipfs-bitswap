/// <reference types="node" />
import { EventEmitter } from 'events';
import { IMovingAverage } from '@vascosantos/moving-average';
export type Op = [string, number, number];
export interface StatOptions {
    enabled: boolean;
    computeThrottleTimeout: number;
    computeThrottleMaxQueueSize: number;
    movingAverageIntervals: number[];
}
export declare class Stat extends EventEmitter {
    private readonly _options;
    private readonly _queue;
    private _stats;
    private _frequencyLastTime;
    private _frequencyAccumulators;
    private _movingAverages;
    private _enabled;
    private _timeout?;
    constructor(initialCounters: string[], options: StatOptions);
    enable(): void;
    disable(): void;
    stop(): void;
    get snapshot(): Record<string, bigint>;
    get movingAverages(): Record<string, Record<number, IMovingAverage>>;
    push(counter: string, inc: number): void;
    _resetComputeTimeout(): void;
    _nextTimeout(): number;
    _update(): void;
    _updateFrequency(latestTime: number): void;
    _updateFrequencyFor(key: string, timeDiffMS: number, latestTime: number): void;
    _applyOp(op: Op): void;
}
//# sourceMappingURL=stat.d.ts.map