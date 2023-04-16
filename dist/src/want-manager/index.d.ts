import { Wantlist } from '../wantlist/index.js';
import { MsgQueue } from './msg-queue.js';
import type { PeerId } from '@libp2p/interface-peer-id';
import type { Network } from '../network.js';
import type { Stats } from '../stats/index.js';
import type { Libp2p } from '@libp2p/interface-libp2p';
import type { CID } from 'multiformats/cid';
import type { AbortOptions } from '@multiformats/multiaddr';
import type { ProgressOptions } from 'progress-events';
import type { BitswapWantBlockProgressEvents } from '../index.js';
export declare class WantManager {
    private readonly peers;
    wantlist: Wantlist;
    network: Network;
    private readonly _peerId;
    private readonly _log;
    constructor(peerId: PeerId, network: Network, stats: Stats, libp2p: Libp2p);
    _addEntries(cids: CID[], cancel: boolean, force?: boolean, options?: ProgressOptions<BitswapWantBlockProgressEvents>): void;
    _startPeerHandler(peerId: PeerId): MsgQueue | undefined;
    _stopPeerHandler(peerId: PeerId): void;
    /**
     * add all the cids to the wantlist
     */
    wantBlocks(cids: CID[], options?: AbortOptions & ProgressOptions<BitswapWantBlockProgressEvents>): void;
    /**
     * Remove blocks of all the given keys without respecting refcounts
     */
    unwantBlocks(cids: CID[]): void;
    /**
     * Cancel wanting all of the given keys
     */
    cancelWants(cids: CID[]): void;
    /**
     * Returns a list of all currently connected peers
     */
    connectedPeers(): string[];
    connected(peerId: PeerId): void;
    disconnected(peerId: PeerId): void;
    start(): void;
    stop(): void;
}
//# sourceMappingURL=index.d.ts.map