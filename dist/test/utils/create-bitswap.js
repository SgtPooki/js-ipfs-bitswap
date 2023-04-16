import { DefaultBitswap } from '../../src/bitswap.js';
import { MemoryBlockstore } from 'blockstore-core/memory';
import { createLibp2pNode } from './create-libp2p-node.js';
export const createBitswap = async () => {
    const libp2p = await createLibp2pNode({
        DHT: true
    });
    const blockstore = new MemoryBlockstore();
    const bitswap = new DefaultBitswap(libp2p, blockstore);
    await bitswap.start();
    return { bitswap, libp2p, blockstore };
};
//# sourceMappingURL=create-bitswap.js.map