import { CID } from 'multiformats/cid';
import { Message } from './message.js';
import { BitswapMessageEntry as Entry } from './entry.js';
import type { MultihashHasherLoader } from '../index.js';
export declare class BitswapMessage {
    static Entry: typeof Entry;
    static WantType: {
        Block: Message.Wantlist.WantType;
        Have: Message.Wantlist.WantType;
    };
    static BlockPresenceType: {
        Have: Message.BlockPresenceType;
        DontHave: Message.BlockPresenceType;
    };
    static deserialize: (raw: Uint8Array, hashLoader?: MultihashHasherLoader) => Promise<BitswapMessage>;
    static blockPresenceSize: (cid: CID) => number;
    full: boolean;
    wantlist: Map<string, Entry>;
    blocks: Map<string, Uint8Array>;
    blockPresences: Map<string, Message.BlockPresenceType>;
    pendingBytes: number;
    constructor(full: boolean);
    get empty(): boolean;
    addEntry(cid: CID, priority: number, wantType?: Message.Wantlist.WantType, cancel?: boolean, sendDontHave?: boolean): void;
    addBlock(cid: CID, block: Uint8Array): void;
    addHave(cid: CID): void;
    addDontHave(cid: CID): void;
    cancel(cid: CID): void;
    setPendingBytes(size: number): void;
    /**
     * Serializes to Bitswap Message protobuf of
     * version 1.0.0
     */
    serializeToBitswap100(): Uint8Array;
    /**
     * Serializes to Bitswap Message protobuf of
     * version 1.1.0
     */
    serializeToBitswap110(): Uint8Array;
    equals(other: BitswapMessage): boolean;
    get [Symbol.toStringTag](): string;
}
//# sourceMappingURL=index.d.ts.map