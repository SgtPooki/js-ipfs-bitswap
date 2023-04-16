import { MemoryBlockstore } from 'blockstore-core/memory';
import { EventEmitter } from 'events';
import { DefaultBitswap } from '../../src/bitswap.js';
import { Network } from '../../src/network.js';
import { Stats } from '../../src/stats/index.js';
import { peerIdFromBytes } from '@libp2p/peer-id';
import { createLibp2pNode } from './create-libp2p-node.js';
import { createEd25519PeerId } from '@libp2p/peer-id-factory';
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string';
/**
 * Create a mock libp2p node
 */
export const mockLibp2pNode = () => {
    const buf = uint8ArrayFromString('122019318b6e5e0cf93a2314bf01269a2cc23cd3dcd452d742cdb9379d8646f6e4a9', 'base16');
    const peerId = peerIdFromBytes(buf);
    const libp2p = Object.assign(new EventEmitter(), {
        peerId,
        multiaddrs: [],
        handle() { },
        unhandle() { },
        register() { },
        unregister() { },
        contentRouting: {
            provide: async (cid) => { },
            findProviders: async (cid, timeout) => { return []; } // eslint-disable-line require-await
        },
        connectionManager: {
            on() { },
            removeListener() { }
        },
        async dial(peer) {
        },
        async dialProtocol(peer, protocol) {
            return {};
        },
        swarm: {
            setMaxListeners() { }
        },
        getConnections: () => []
    });
    // @ts-expect-error not all libp2p fields are implemented
    return libp2p;
};
/**
 * Create a mock network instance
 */
export const mockNetwork = (calls = Infinity, done = async () => { }, onMsg = async () => { }) => {
    const connects = [];
    const messages = [];
    let i = 0;
    const finish = (peerId, message) => {
        onMsg?.(peerId, message);
        if (++i === calls) {
            done?.({ connects, messages });
        }
    };
    class MockNetwork extends Network {
        constructor() {
            // @ts-expect-error - {} is not an instance of libp2p
            super({}, new DefaultBitswap({}, new MemoryBlockstore()), new Stats({}));
            this.connects = connects;
            this.messages = messages;
        }
        async connectTo(p) {
            setTimeout(() => {
                connects.push(p);
            });
            // @ts-expect-error not all connection fields are implemented
            return await Promise.resolve({ id: '', remotePeer: '' });
        }
        async sendMessage(p, msg) {
            messages.push([p, msg]);
            setTimeout(() => {
                finish(p, msg);
            });
            await Promise.resolve();
        }
        async start() {
            await Promise.resolve();
        }
        async stop() {
            await Promise.resolve();
        }
        async findAndConnect() {
            await Promise.resolve();
        }
        async provide() {
            await Promise.resolve();
        }
    }
    return new MockNetwork();
};
export const applyNetwork = (bs, n) => {
    bs.network = n;
    bs.wm.network = n;
    bs.engine.network = n;
};
export const genBitswapNetwork = async (n, enableDHT = false) => {
    // create PeerId and libp2p.Node for each
    const peers = await Promise.all(new Array(n).fill(0).map(async () => await createEd25519PeerId()));
    /** @type {{ libp2p: Libp2p, bitswap: Bitswap }[]} */
    const netArray = await Promise.all(peers.map(async (peerId, i) => {
        const libp2p = await createLibp2pNode({
            peerId,
            DHT: enableDHT,
            nat: {
                enabled: false
            }
        });
        await libp2p.start();
        const blockstore = new MemoryBlockstore();
        return {
            libp2p,
            bitswap: new DefaultBitswap(libp2p, blockstore),
            blockstore
        };
    }));
    // populate peerStores
    for (let i = 0; i < netArray.length; i++) {
        const netA = netArray[i];
        for (let j = 0; j < netArray.length; j++) {
            if (i === j) {
                continue;
            }
            const netB = netArray[j];
            await netA.libp2p.peerStore.addressBook.set(netB.libp2p.peerId, netB.libp2p.getMultiaddrs());
        }
    }
    return netArray;
};
//# sourceMappingURL=mocks.js.map