import * as lp from 'it-length-prefixed';
import { pipe } from 'it-pipe';
import { createTopology } from '@libp2p/topology';
import { BitswapMessage as Message } from './message/index.js';
import * as CONSTANTS from './constants.js';
import { logger } from './utils/index.js';
import { TimeoutController } from 'timeout-abort-controller';
import { abortableSource } from 'abortable-iterator';
import { CustomProgressEvent } from 'progress-events';
import take from 'it-take';
import drain from 'it-drain';
import map from 'it-map';
const BITSWAP100 = '/ipfs/bitswap/1.0.0';
const BITSWAP110 = '/ipfs/bitswap/1.1.0';
const BITSWAP120 = '/ipfs/bitswap/1.2.0';
const DEFAULT_MAX_INBOUND_STREAMS = 1024;
const DEFAULT_MAX_OUTBOUND_STREAMS = 1024;
const DEFAULT_INCOMING_STREAM_TIMEOUT = 30000;
export class Network {
    constructor(libp2p, bitswap, stats, options = {}) {
        this._log = logger(libp2p.peerId, 'network');
        this._libp2p = libp2p;
        this._bitswap = bitswap;
        this._protocols = [BITSWAP100];
        if (options.b100Only !== true) {
            // Latest bitswap first
            this._protocols.unshift(BITSWAP110);
            this._protocols.unshift(BITSWAP120);
        }
        this._stats = stats;
        this._running = false;
        // bind event listeners
        this._onPeerConnect = this._onPeerConnect.bind(this);
        this._onPeerDisconnect = this._onPeerDisconnect.bind(this);
        this._onConnection = this._onConnection.bind(this);
        this._hashLoader = options.hashLoader ?? {
            async getHasher() {
                throw new Error('Not implemented');
            }
        };
        this._maxInboundStreams = options.maxInboundStreams ?? DEFAULT_MAX_INBOUND_STREAMS;
        this._maxOutboundStreams = options.maxOutboundStreams ?? DEFAULT_MAX_OUTBOUND_STREAMS;
        this._incomingStreamTimeout = options.incomingStreamTimeout ?? DEFAULT_INCOMING_STREAM_TIMEOUT;
    }
    async start() {
        this._running = true;
        await this._libp2p.handle(this._protocols, this._onConnection, {
            maxInboundStreams: this._maxInboundStreams,
            maxOutboundStreams: this._maxOutboundStreams
        });
        // register protocol with topology
        const topology = createTopology({
            onConnect: this._onPeerConnect,
            onDisconnect: this._onPeerDisconnect
        });
        /** @type {string[]} */
        this._registrarIds = [];
        for (const protocol of this._protocols) {
            this._registrarIds.push(await this._libp2p.register(protocol, topology));
        }
        // All existing connections are like new ones for us
        this._libp2p.getConnections().forEach(conn => {
            this._onPeerConnect(conn.remotePeer);
        });
    }
    async stop() {
        this._running = false;
        // Unhandle both, libp2p doesn't care if it's not already handled
        await this._libp2p.unhandle(this._protocols);
        // unregister protocol and handlers
        if (this._registrarIds != null) {
            for (const id of this._registrarIds) {
                this._libp2p.unregister(id);
            }
            this._registrarIds = [];
        }
    }
    /**
     * Handles both types of incoming bitswap messages
     */
    _onConnection(info) {
        if (!this._running) {
            return;
        }
        const { stream, connection } = info;
        const controller = new TimeoutController(this._incomingStreamTimeout);
        Promise.resolve().then(async () => {
            this._log('incoming new bitswap %s connection from %p', stream.stat.protocol, connection.remotePeer);
            await pipe(abortableSource(stream.source, controller.signal), (source) => lp.decode(source), async (source) => {
                for await (const data of source) {
                    try {
                        const message = await Message.deserialize(data.subarray(), this._hashLoader);
                        await this._bitswap._receiveMessage(connection.remotePeer, message);
                    }
                    catch (err) {
                        this._bitswap._receiveError(err);
                        break;
                    }
                    // we have received some data so reset the timeout controller
                    controller.reset();
                }
            });
        })
            .catch(err => {
            this._log(err);
            stream.abort(err);
        })
            .finally(() => {
            controller.clear();
            stream.close();
        });
    }
    _onPeerConnect(peerId) {
        this._bitswap._onPeerConnected(peerId);
    }
    _onPeerDisconnect(peerId) {
        this._bitswap._onPeerDisconnected(peerId);
    }
    /**
     * Find providers given a `cid`.
     */
    findProviders(cid, options = {}) {
        options.onProgress?.(new CustomProgressEvent('bitswap:network:find-providers', cid));
        return this._libp2p.contentRouting.findProviders(cid, options);
    }
    /**
     * Find the providers of a given `cid` and connect to them.
     */
    async findAndConnect(cid, options) {
        await drain(take(map(this.findProviders(cid, options), async (provider) => await this.connectTo(provider.id, options)
            .catch(err => {
            // Prevent unhandled promise rejection
            this._log.error(err);
        })), CONSTANTS.maxProvidersPerRequest))
            .catch(err => {
            this._log.error(err);
        });
    }
    /**
     * Tell the network we can provide content for the passed CID
     */
    async provide(cid, options = {}) {
        options.onProgress?.(new CustomProgressEvent('bitswap:network:provide', cid));
        await this._libp2p.contentRouting.provide(cid, options);
    }
    /**
     * Connect to the given peer
     * Send the given msg (instance of Message) to the given peer
     */
    async sendMessage(peer, msg, options = {}) {
        if (!this._running)
            throw new Error('network isn\'t running');
        const stringId = peer.toString();
        this._log('sendMessage to %s', stringId, msg);
        options.onProgress?.(new CustomProgressEvent('bitswap:network:send-wantlist', peer));
        await this._writeMessage(peer, msg, options);
        this._updateSentStats(peer, msg.blocks);
    }
    /**
     * Connects to another peer
     */
    async connectTo(peer, options = {}) {
        if (!this._running) {
            throw new Error('network isn\'t running');
        }
        options.onProgress?.(new CustomProgressEvent('bitswap:network:dial', peer));
        return await this._libp2p.dial(peer, options);
    }
    _updateSentStats(peer, blocks) {
        const peerId = peer.toString();
        if (this._stats != null) {
            for (const block of blocks.values()) {
                this._stats.push(peerId, 'dataSent', block.length);
            }
            this._stats.push(peerId, 'blocksSent', blocks.size);
        }
    }
    async _writeMessage(peerId, msg, options = {}) {
        const stream = await this._libp2p.dialProtocol(peerId, [BITSWAP120, BITSWAP110, BITSWAP100]);
        try {
            /** @type {Uint8Array} */
            let serialized;
            switch (stream.stat.protocol) {
                case BITSWAP100:
                    serialized = msg.serializeToBitswap100();
                    break;
                case BITSWAP110:
                case BITSWAP120:
                    serialized = msg.serializeToBitswap110();
                    break;
                default:
                    throw new Error(`Unknown protocol: ${stream.stat.protocol}`);
            }
            await pipe([serialized], (source) => lp.encode(source), stream);
        }
        catch (err) {
            options.onProgress?.(new CustomProgressEvent('bitswap:network:send-wantlist:error', { peer: peerId, error: err }));
            this._log(err);
        }
        finally {
            stream.close();
        }
    }
}
//# sourceMappingURL=network.js.map