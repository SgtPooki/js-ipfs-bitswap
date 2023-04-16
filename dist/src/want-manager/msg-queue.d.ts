import { BitswapMessage as Message } from '../message/index.js';
import type { PeerId } from '@libp2p/interface-peer-id';
import type { BitswapNetworkWantProgressEvents, Network } from '../network.js';
import type { CID } from 'multiformats/cid';
import type { ProgressOptions } from 'progress-events';
import type { BitswapWantBlockProgressEvents } from '../index.js';
export declare class MsgQueue {
    peerId: PeerId;
    refcnt: number;
    private readonly network;
    private _entries;
    private readonly _log;
    constructor(selfPeerId: PeerId, otherPeerId: PeerId, network: Network);
    addMessage(msg: Message, options?: ProgressOptions<BitswapNetworkWantProgressEvents>): void;
    addEntries(entries: Array<{
        cid: CID;
        priority: number;
    }>, options?: ProgressOptions<BitswapWantBlockProgressEvents>): void;
    sendEntries(options?: ProgressOptions<BitswapWantBlockProgressEvents>): void;
    send(msg: Message, options?: ProgressOptions<BitswapNetworkWantProgressEvents>): Promise<void>;
}
//# sourceMappingURL=msg-queue.d.ts.map