import type { Blockstore } from 'interface-blockstore';
import { DefaultBitswap } from '../../src/bitswap.js';
import { Network } from '../../src/network.js';
import type { Libp2p } from '@libp2p/interface-libp2p';
import type { PeerId } from '@libp2p/interface-peer-id';
import type { Multiaddr } from '@multiformats/multiaddr';
import type { BitswapMessage } from '../../src/message/index.js';
import type { Bitswap } from '../../src/index.js';
/**
 * Create a mock libp2p node
 */
export declare const mockLibp2pNode: () => Libp2p;
interface OnDone {
    (args: {
        connects: Array<PeerId | Multiaddr>;
        messages: Array<[PeerId, BitswapMessage]>;
    }): void;
}
interface OnMessage {
    (peerId: PeerId, message: BitswapMessage): void;
}
/**
 * Create a mock network instance
 */
export declare const mockNetwork: (calls?: number, done?: OnDone, onMsg?: OnMessage) => Network;
export declare const applyNetwork: (bs: DefaultBitswap, n: Network) => void;
export interface BitswapNode {
    libp2p: Libp2p;
    bitswap: Bitswap;
    blockstore: Blockstore;
}
export declare const genBitswapNetwork: (n: number, enableDHT?: boolean) => Promise<BitswapNode[]>;
export {};
//# sourceMappingURL=mocks.d.ts.map