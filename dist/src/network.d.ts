import { BitswapMessage as Message } from './message/index.js';
import type { Libp2p } from '@libp2p/interface-libp2p';
import type { PeerId } from '@libp2p/interface-peer-id';
import type { Multiaddr } from '@multiformats/multiaddr';
import type { MultihashHasherLoader } from './index.js';
import type { DefaultBitswap } from './bitswap.js';
import type { Stats } from './stats/index.js';
import type { IncomingStreamData } from '@libp2p/interface-registrar';
import type { CID } from 'multiformats/cid';
import type { AbortOptions } from '@libp2p/interfaces';
import type { Connection } from '@libp2p/interface-connection';
import type { PeerInfo } from '@libp2p/interface-peer-info';
import { ProgressEvent, ProgressOptions } from 'progress-events';
export interface Provider {
    id: PeerId;
    multiaddrs: Multiaddr[];
}
export type BitswapNetworkProgressEvents = ProgressEvent<'bitswap:network:dial', PeerId>;
export type BitswapNetworkWantProgressEvents = ProgressEvent<'bitswap:network:send-wantlist', PeerId> | ProgressEvent<'bitswap:network:send-wantlist:error', {
    peer: PeerId;
    error: Error;
}> | ProgressEvent<'bitswap:network:find-providers', CID> | BitswapNetworkProgressEvents;
export type BitswapNetworkNotifyProgressEvents = ProgressEvent<'bitswap:network:provide', CID> | BitswapNetworkProgressEvents;
export interface NetworkOptions {
    b100Only?: boolean;
    hashLoader?: MultihashHasherLoader;
    maxInboundStreams?: number;
    maxOutboundStreams?: number;
    incomingStreamTimeout?: number;
}
export declare class Network {
    private readonly _log;
    private readonly _libp2p;
    private readonly _bitswap;
    _protocols: string[];
    private readonly _stats;
    private _running;
    private readonly _hashLoader;
    private readonly _maxInboundStreams;
    private readonly _maxOutboundStreams;
    private readonly _incomingStreamTimeout;
    private _registrarIds?;
    constructor(libp2p: Libp2p, bitswap: DefaultBitswap, stats: Stats, options?: NetworkOptions);
    start(): Promise<void>;
    stop(): Promise<void>;
    /**
     * Handles both types of incoming bitswap messages
     */
    _onConnection(info: IncomingStreamData): void;
    _onPeerConnect(peerId: PeerId): void;
    _onPeerDisconnect(peerId: PeerId): void;
    /**
     * Find providers given a `cid`.
     */
    findProviders(cid: CID, options?: AbortOptions & ProgressOptions<BitswapNetworkWantProgressEvents>): AsyncIterable<PeerInfo>;
    /**
     * Find the providers of a given `cid` and connect to them.
     */
    findAndConnect(cid: CID, options?: AbortOptions & ProgressOptions<BitswapNetworkWantProgressEvents>): Promise<void>;
    /**
     * Tell the network we can provide content for the passed CID
     */
    provide(cid: CID, options?: AbortOptions & ProgressOptions<BitswapNetworkNotifyProgressEvents>): Promise<void>;
    /**
     * Connect to the given peer
     * Send the given msg (instance of Message) to the given peer
     */
    sendMessage(peer: PeerId, msg: Message, options?: ProgressOptions<BitswapNetworkWantProgressEvents>): Promise<void>;
    /**
     * Connects to another peer
     */
    connectTo(peer: PeerId, options?: AbortOptions & ProgressOptions<BitswapNetworkProgressEvents>): Promise<Connection>;
    _updateSentStats(peer: PeerId, blocks: Map<string, Uint8Array>): void;
    _writeMessage(peerId: PeerId, msg: Message, options?: ProgressOptions<BitswapNetworkWantProgressEvents>): Promise<void>;
}
//# sourceMappingURL=network.d.ts.map