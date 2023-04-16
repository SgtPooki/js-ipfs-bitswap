import type { PeerId } from '@libp2p/interface-peer-id';
import type { CID } from 'multiformats/cid';
import type { Message } from '../message/message.js';
import type { WantListEntry } from '../wantlist/entry.js';
import { Wantlist } from '../wantlist/index.js';
export declare class Ledger {
    partner: PeerId;
    wantlist: Wantlist;
    exchangeCount: number;
    accounting: {
        bytesSent: number;
        bytesRecv: number;
    };
    lastExchange?: number;
    constructor(peerId: PeerId);
    sentBytes(n: number): void;
    receivedBytes(n: number): void;
    wants(cid: CID, priority: number, wantType: Message.Wantlist.WantType): void;
    /**
     * @param {CID} cid
     * @returns {void}
     */
    cancelWant(cid: CID): void;
    wantlistContains(cid: CID): WantListEntry | undefined;
    debtRatio(): number;
}
//# sourceMappingURL=ledger.d.ts.map