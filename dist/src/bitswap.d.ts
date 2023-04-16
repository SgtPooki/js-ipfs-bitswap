import { WantManager } from './want-manager/index.js';
import { Network } from './network.js';
import { DecisionEngine, PeerLedger } from './decision-engine/index.js';
import { Notifications } from './notifications.js';
import { Stats } from './stats/index.js';
import { CID } from 'multiformats/cid';
import type { BitswapOptions, Bitswap, WantListEntry, BitswapWantProgressEvents, BitswapNotifyProgressEvents } from './index.js';
import type { Libp2p } from '@libp2p/interface-libp2p';
import type { Blockstore, Pair } from 'interface-blockstore';
import type { PeerId } from '@libp2p/interface-peer-id';
import type { BitswapMessage } from './message/index.js';
import type { AbortOptions } from '@multiformats/multiaddr';
import type { ProgressOptions } from 'progress-events';
import type { AwaitIterable } from 'interface-store';
/**
 * JavaScript implementation of the Bitswap 'data exchange' protocol
 * used by IPFS.
 */
export declare class DefaultBitswap implements Bitswap {
    private readonly _libp2p;
    private readonly _log;
    readonly stats: Stats;
    network: Network;
    blockstore: Blockstore;
    engine: DecisionEngine;
    wm: WantManager;
    notifications: Notifications;
    private started;
    constructor(libp2p: Libp2p, blockstore: Blockstore, options?: BitswapOptions);
    isStarted(): boolean;
    get peerId(): PeerId;
    /**
     * handle messages received through the network
     */
    _receiveMessage(peerId: PeerId, incoming: BitswapMessage): Promise<void>;
    _handleReceivedBlock(peerId: PeerId, cid: CID, data: Uint8Array, wasWanted: boolean): Promise<void>;
    _updateReceiveCounters(peerIdStr: string, cid: CID, data: Uint8Array, exists: boolean): void;
    /**
     * handle errors on the receiving channel
     */
    _receiveError(err: Error): void;
    /**
     * handle new peers
     */
    _onPeerConnected(peerId: PeerId): void;
    /**
     * handle peers being disconnected
     */
    _onPeerDisconnected(peerId: PeerId): void;
    enableStats(): void;
    disableStats(): void;
    /**
     * Return the current wantlist for a given `peerId`
     */
    wantlistForPeer(peerId: PeerId, _options?: any): Map<string, WantListEntry>;
    /**
     * Return ledger information for a given `peerId`
     */
    ledgerForPeer(peerId: PeerId): PeerLedger | undefined;
    /**
     * Fetch a given block by cid. If the block is in the local
     * blockstore it is returned, otherwise the block is added to the wantlist and returned once another node sends it to us.
     */
    want(cid: CID, options?: AbortOptions & ProgressOptions<BitswapWantProgressEvents>): Promise<Uint8Array>;
    /**
     * Removes the given CIDs from the wantlist independent of any ref counts.
     *
     * This will cause all outstanding promises for a given block to reject.
     *
     * If you want to cancel the want for a block without doing that, pass an
     * AbortSignal in to `.get` or `.getMany` and abort it.
     */
    unwant(cids: CID[] | CID): void;
    /**
     * Removes the given keys from the want list. This may cause pending promises
     * for blocks to never resolve.  If you wish these promises to abort instead
     * call `unwant(cids)` instead.
     */
    cancelWants(cids: CID[] | CID): void;
    /**
     * Put the given block to the underlying blockstore and
     * send it to nodes that have it in their wantlist.
     */
    put(cid: CID, block: Uint8Array, _options?: any): Promise<void>;
    /**
     * Put the given blocks to the underlying blockstore and
     * send it to nodes that have it them their wantlist.
     */
    putMany(source: Iterable<Pair> | AsyncIterable<Pair>, options?: AbortOptions): AwaitIterable<CID>;
    /**
     * Sends notifications about the arrival of a block
     */
    notify(cid: CID, block: Uint8Array, options?: ProgressOptions<BitswapNotifyProgressEvents>): void;
    /**
     * Get the current list of wants
     */
    getWantlist(): IterableIterator<[string, WantListEntry]>;
    /**
     * Get the current list of partners
     */
    get peers(): PeerId[];
    /**
     * Start the bitswap node
     */
    start(): Promise<void>;
    /**
     * Stop the bitswap node
     */
    stop(): Promise<void>;
}
//# sourceMappingURL=bitswap.d.ts.map