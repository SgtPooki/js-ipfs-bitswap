import type { PeerId } from '@libp2p/interface-peer-id';
import { Logger } from '@libp2p/logger';
import { BitswapMessageEntry } from '../message/entry.js';
/**
 * Creates a logger for the given subsystem
 */
export declare const logger: (id: PeerId, subsystem?: string) => Logger;
export declare const includesWith: <X, T>(pred: (x: X, t: T) => boolean, x: X, list: T[]) => boolean;
export declare const uniqWith: <T>(pred: (x: T, t: T) => boolean, list: T[]) => T[];
export declare const groupBy: <K extends string | number | symbol, V>(pred: (v: V) => K, list: V[]) => Record<K, V[]>;
export declare const pullAllWith: <T, E>(pred: (a: T, b: E) => boolean, list: T[], values: E[]) => T[];
export declare const sortBy: <T>(fn: (v: T) => number, list: T[]) => T[];
/**
 * Is equal for Maps of BitswapMessageEntry or Uint8Arrays
 */
export declare const isMapEqual: (a: Map<string, Uint8Array | BitswapMessageEntry>, b: Map<string, Uint8Array | BitswapMessageEntry>) => boolean;
//# sourceMappingURL=index.d.ts.map