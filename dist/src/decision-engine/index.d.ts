import { CID } from 'multiformats/cid';
import { BitswapMessage as Message } from '../message/index.js';
import { Ledger } from './ledger.js';
import { RequestQueue } from './req-queue.js';
import type { Message as PBMessage } from '../message/message.js';
import type { BitswapMessageEntry } from '../message/entry.js';
import type { PeerId } from '@libp2p/interface-peer-id';
import type { Blockstore } from 'interface-blockstore';
import type { Network } from '../network.js';
import type { Stats } from '../stats/index.js';
import type { Libp2p } from '@libp2p/interface-libp2p';
import type { WantListEntry } from '../wantlist/entry.js';
export interface TaskMerger {
    /**
     * Given the existing tasks with the same topic, does the task add some new
     * information? Used to decide whether to merge the task or ignore it.
     */
    hasNewInfo: (task: Task, tasksWithTopic: Task[]) => boolean;
    /**
     * Merge the information from the task into the existing pending task.
     */
    merge: (newTask: Task, existingTask: Task) => void;
}
export interface Task {
    /**
     * A name for the Task (like an id but not necessarily unique)
     */
    topic: string;
    /**
     * Priority for the Task (tasks are ordered by priority per peer).
     */
    priority: number;
    /**
     * The size of the task, e.g. the number of bytes in a block.
     */
    size: number;
    data: TaskData;
}
export interface TaskData {
    /**
     * The size of the block, if known (if we don't have the block this is zero)
     */
    blockSize: number;
    /**
     * Indicates if the request is for a block or for a HAVE.
     */
    isWantBlock: boolean;
    /**
     * Indicates if we have the block.
     */
    haveBlock: boolean;
    /**
     * Indicates whether to send a DONT_HAVE response if we don't have the block.
     * If this is `false` and we don't have the block, we just ignore the
     * want-block request (useful for discovery where we query lots of peers but
     * don't want a response unless the peer has the block).
     */
    sendDontHave: boolean;
}
export interface DecisionEngineOptions {
    targetMessageSize?: number;
    maxSizeReplaceHasWithBlock?: number;
}
export interface PeerLedger {
    peer: PeerId;
    value: number;
    sent: number;
    recv: number;
    exchanged: number;
}
export declare class DecisionEngine {
    private readonly _log;
    blockstore: Blockstore;
    network: Network;
    private readonly _stats;
    private readonly _opts;
    ledgerMap: Map<string, Ledger>;
    private _running;
    _requestQueue: RequestQueue;
    constructor(peerId: PeerId, blockstore: Blockstore, network: Network, stats: Stats, libp2p: Libp2p, opts?: DecisionEngineOptions);
    _processOpts(opts: DecisionEngineOptions): Required<DecisionEngineOptions>;
    _scheduleProcessTasks(): void;
    /**
     * Pull tasks off the request queue and send a message to the corresponding
     * peer
     */
    _processTasks(): Promise<void>;
    wantlistForPeer(peerId: PeerId): Map<string, WantListEntry>;
    ledgerForPeer(peerId: PeerId): PeerLedger | undefined;
    peers(): PeerId[];
    /**
     * Receive blocks either from an incoming message from the network, or from
     * blocks being added by the client on the localhost (eg IPFS add)
     */
    receivedBlocks(blocks: Array<{
        cid: CID;
        block: Uint8Array;
    }>): void;
    /**
     * Handle incoming messages
     */
    messageReceived(peerId: PeerId, msg: Message): Promise<void>;
    _cancelWants(peerId: PeerId, cids: CID[]): void;
    _addWants(peerId: PeerId, wants: BitswapMessageEntry[]): Promise<void>;
    _sendAsBlock(wantType: PBMessage.Wantlist.WantType, blockSize: number): boolean;
    _getBlockSizes(cids: CID[]): Promise<Map<string, number>>;
    _getBlocks(cids: CID[]): Promise<Map<string, Uint8Array>>;
    _updateBlockAccounting(blocksMap: Map<string, Uint8Array>, ledger: Ledger): void;
    /**
     * Clear up all accounting things after message was sent
     */
    messageSent(peerId: PeerId, cid: CID, block: Uint8Array): void;
    numBytesSentTo(peerId: PeerId): number;
    numBytesReceivedFrom(peerId: PeerId): number;
    peerDisconnected(peerId: PeerId): void;
    _findOrCreate(peerId: PeerId): Ledger;
    start(): void;
    stop(): void;
}
//# sourceMappingURL=index.d.ts.map