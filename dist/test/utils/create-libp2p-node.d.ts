import { Libp2pOptions } from 'libp2p';
import type { Libp2p } from '@libp2p/interface-libp2p';
export interface NodeOptions extends Libp2pOptions {
    DHT?: boolean;
}
export declare function createLibp2pNode(options?: NodeOptions): Promise<Libp2p>;
//# sourceMappingURL=create-libp2p-node.d.ts.map