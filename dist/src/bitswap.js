import { WantManager } from './want-manager/index.js';
import { Network } from './network.js';
import { DecisionEngine } from './decision-engine/index.js';
import { Notifications } from './notifications.js';
import { logger } from './utils/index.js';
import { Stats } from './stats/index.js';
import { anySignal } from 'any-signal';
import { CID } from 'multiformats/cid';
import forEach from 'it-foreach';
const hashLoader = {
    async getHasher() {
        throw new Error('Not implemented');
    }
};
const defaultOptions = {
    maxInboundStreams: 1024,
    maxOutboundStreams: 1024,
    incomingStreamTimeout: 30000,
    hashLoader,
    statsEnabled: false,
    statsComputeThrottleTimeout: 1000,
    statsComputeThrottleMaxQueueSize: 1000
};
const statsKeys = [
    'blocksReceived',
    'dataReceived',
    'dupBlksReceived',
    'dupDataReceived',
    'blocksSent',
    'dataSent',
    'providesBufferLength',
    'wantListLength',
    'peerCount'
];
/**
 * JavaScript implementation of the Bitswap 'data exchange' protocol
 * used by IPFS.
 */
export class DefaultBitswap {
    constructor(libp2p, blockstore, options = {}) {
        this._libp2p = libp2p;
        this._log = logger(this.peerId);
        options = Object.assign({}, defaultOptions, options);
        // stats
        this.stats = new Stats(libp2p, statsKeys, {
            enabled: options.statsEnabled,
            computeThrottleTimeout: options.statsComputeThrottleTimeout,
            computeThrottleMaxQueueSize: options.statsComputeThrottleMaxQueueSize
        });
        // the network delivers messages
        this.network = new Network(libp2p, this, this.stats, {
            hashLoader: options.hashLoader,
            maxInboundStreams: options.maxInboundStreams,
            maxOutboundStreams: options.maxOutboundStreams,
            incomingStreamTimeout: options.incomingStreamTimeout
        });
        // local database
        this.blockstore = blockstore;
        this.engine = new DecisionEngine(this.peerId, blockstore, this.network, this.stats, libp2p);
        // handle message sending
        this.wm = new WantManager(this.peerId, this.network, this.stats, libp2p);
        this.notifications = new Notifications(this.peerId);
        this.started = false;
    }
    isStarted() {
        return this.started;
    }
    get peerId() {
        return this._libp2p.peerId;
    }
    /**
     * handle messages received through the network
     */
    async _receiveMessage(peerId, incoming) {
        try {
            // Note: this allows the engine to respond to any wants in the message.
            // Processing of the blocks in the message happens below, after the
            // blocks have been added to the blockstore.
            await this.engine.messageReceived(peerId, incoming);
        }
        catch (err) {
            // Log instead of throwing an error so as to process as much as
            // possible of the message. Currently `messageReceived` does not
            // throw any errors, but this could change in the future.
            this._log('failed to receive message', incoming);
        }
        if (incoming.blocks.size === 0) {
            return;
        }
        /** @type { { cid: CID, wasWanted: boolean, data: Uint8Array }[] } */
        const received = [];
        for (const [cidStr, data] of incoming.blocks.entries()) {
            const cid = CID.parse(cidStr);
            received.push({
                wasWanted: this.wm.wantlist.contains(cid),
                cid,
                data
            });
        }
        // quickly send out cancels, reduces chances of duplicate block receives
        this.wm.cancelWants(received
            .filter(({ wasWanted }) => wasWanted)
            .map(({ cid }) => cid));
        await Promise.all(received.map(async ({ cid, wasWanted, data }) => { await this._handleReceivedBlock(peerId, cid, data, wasWanted); }));
    }
    async _handleReceivedBlock(peerId, cid, data, wasWanted) {
        this._log('received block');
        const has = await this.blockstore.has(cid);
        this._updateReceiveCounters(peerId.toString(), cid, data, has);
        if (!wasWanted) {
            return;
        }
        await this.put(cid, data);
    }
    _updateReceiveCounters(peerIdStr, cid, data, exists) {
        this.stats.push(peerIdStr, 'blocksReceived', 1);
        this.stats.push(peerIdStr, 'dataReceived', data.length);
        if (exists) {
            this.stats.push(peerIdStr, 'dupBlksReceived', 1);
            this.stats.push(peerIdStr, 'dupDataReceived', data.length);
        }
    }
    /**
     * handle errors on the receiving channel
     */
    _receiveError(err) {
        this._log.error('ReceiveError', err);
    }
    /**
     * handle new peers
     */
    _onPeerConnected(peerId) {
        this.wm.connected(peerId);
    }
    /**
     * handle peers being disconnected
     */
    _onPeerDisconnected(peerId) {
        this.wm.disconnected(peerId);
        this.engine.peerDisconnected(peerId);
        this.stats.disconnected(peerId);
    }
    enableStats() {
        this.stats.enable();
    }
    disableStats() {
        this.stats.disable();
    }
    /**
     * Return the current wantlist for a given `peerId`
     */
    wantlistForPeer(peerId, _options) {
        return this.engine.wantlistForPeer(peerId);
    }
    /**
     * Return ledger information for a given `peerId`
     */
    ledgerForPeer(peerId) {
        return this.engine.ledgerForPeer(peerId);
    }
    /**
     * Fetch a given block by cid. If the block is in the local
     * blockstore it is returned, otherwise the block is added to the wantlist and returned once another node sends it to us.
     */
    async want(cid, options = {}) {
        const fetchFromNetwork = async (cid, options) => {
            // add it to the want list - n.b. later we will abort the AbortSignal
            // so no need to remove the blocks from the wantlist after we have it
            this.wm.wantBlocks([cid], options);
            return await this.notifications.wantBlock(cid, options);
        };
        let promptedNetwork = false;
        const loadOrFetchFromNetwork = async (cid, options) => {
            try {
                // have to await here as we want to handle ERR_NOT_FOUND
                const block = await this.blockstore.get(cid, options);
                return block;
            }
            catch (err) {
                if (err.code !== 'ERR_NOT_FOUND') {
                    throw err;
                }
                if (!promptedNetwork) {
                    promptedNetwork = true;
                    this.network.findAndConnect(cid, options)
                        .catch((err) => { this._log.error(err); });
                }
                // we don't have the block locally so fetch it from the network
                return await fetchFromNetwork(cid, options);
            }
        };
        // depending on implementation it's possible for blocks to come in while
        // we do the async operations to get them from the blockstore leading to
        // a race condition, so register for incoming block notifications as well
        // as trying to get it from the datastore
        const controller = new AbortController();
        const signal = (options.signal != null)
            ? anySignal([options.signal, controller.signal])
            : controller.signal;
        try {
            const block = await Promise.race([
                this.notifications.wantBlock(cid, {
                    ...options,
                    signal
                }),
                loadOrFetchFromNetwork(cid, {
                    ...options,
                    signal
                })
            ]);
            return block;
        }
        finally {
            // since we have the block we can now abort any outstanding attempts to
            // fetch it
            controller.abort();
        }
    }
    /**
     * Removes the given CIDs from the wantlist independent of any ref counts.
     *
     * This will cause all outstanding promises for a given block to reject.
     *
     * If you want to cancel the want for a block without doing that, pass an
     * AbortSignal in to `.get` or `.getMany` and abort it.
     */
    unwant(cids) {
        const cidsArray = Array.isArray(cids) ? cids : [cids];
        this.wm.unwantBlocks(cidsArray);
        cidsArray.forEach((cid) => { this.notifications.unwantBlock(cid); });
    }
    /**
     * Removes the given keys from the want list. This may cause pending promises
     * for blocks to never resolve.  If you wish these promises to abort instead
     * call `unwant(cids)` instead.
     */
    cancelWants(cids) {
        this.wm.cancelWants(Array.isArray(cids) ? cids : [cids]);
    }
    /**
     * Put the given block to the underlying blockstore and
     * send it to nodes that have it in their wantlist.
     */
    async put(cid, block, _options) {
        await this.blockstore.put(cid, block);
        this.notify(cid, block);
    }
    /**
     * Put the given blocks to the underlying blockstore and
     * send it to nodes that have it them their wantlist.
     */
    async *putMany(source, options) {
        yield* this.blockstore.putMany(forEach(source, ({ cid, block }) => {
            this.notify(cid, block);
        }), options);
    }
    /**
     * Sends notifications about the arrival of a block
     */
    notify(cid, block, options = {}) {
        this.notifications.hasBlock(cid, block);
        this.engine.receivedBlocks([{ cid, block }]);
        // Note: Don't wait for provide to finish before returning
        this.network.provide(cid, options).catch((err) => {
            this._log.error('Failed to provide: %s', err.message);
        });
    }
    /**
     * Get the current list of wants
     */
    getWantlist() {
        return this.wm.wantlist.entries();
    }
    /**
     * Get the current list of partners
     */
    get peers() {
        return this.engine.peers();
    }
    /**
     * Start the bitswap node
     */
    async start() {
        this.wm.start();
        await this.network.start();
        this.engine.start();
        this.started = true;
    }
    /**
     * Stop the bitswap node
     */
    async stop() {
        this.stats.stop();
        this.wm.stop();
        await this.network.stop();
        this.engine.stop();
        this.started = false;
    }
}
//# sourceMappingURL=bitswap.js.map