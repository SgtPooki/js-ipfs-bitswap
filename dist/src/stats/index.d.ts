/// <reference types="node" />
import { EventEmitter } from 'events';
import { Stat } from './stat.js';
import type { Libp2p } from 'libp2p';
import type { PeerId } from '@libp2p/interface-peer-id';
import type { IMovingAverage } from '@vascosantos/moving-average';
/**
 * @typedef {import('multiformats').CID} CID
 * @typedef {import('@libp2p/interface-peer-id').PeerId} PeerId
 */
export interface StatsOptions {
    enabled?: boolean;
    computeThrottleTimeout?: number;
    computeThrottleMaxQueueSize?: number;
    movingAverageIntervals?: number[];
}
export declare class Stats extends EventEmitter {
    private readonly _initialCounters;
    private readonly _options;
    private _enabled;
    private readonly _global;
    private readonly _peers;
    constructor(libp2p: Libp2p, initialCounters?: string[], _options?: StatsOptions);
    enable(): void;
    disable(): void;
    stop(): void;
    get snapshot(): Record<string, bigint>;
    get movingAverages(): Record<string, Record<number, IMovingAverage>>;
    forPeer(peerId: PeerId | string): Stat | undefined;
    push(peer: string | undefined, counter: string, inc: number): void;
    disconnected(peer: PeerId): void;
}
//# sourceMappingURL=index.d.ts.map