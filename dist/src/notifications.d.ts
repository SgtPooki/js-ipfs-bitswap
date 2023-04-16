/// <reference types="node" />
import type { PeerId } from '@libp2p/interface-peer-id';
import type { AbortOptions } from '@libp2p/interfaces';
import { EventEmitter } from 'events';
import type { CID } from 'multiformats/cid';
import { ProgressOptions } from 'progress-events';
import type { BitswapWantBlockProgressEvents } from './index.js';
export declare class Notifications extends EventEmitter {
    private readonly _log;
    /**
     * Internal module used to track events about incoming blocks,
     * wants and unwants.
     */
    constructor(peerId: PeerId);
    /**
     * Signal the system that we received `block`.
     */
    hasBlock(cid: CID, block: Uint8Array): void;
    /**
     * Signal the system that we are waiting to receive the
     * block associated with the given `cid`.
     * Returns a Promise that resolves to the block when it is received,
     * or undefined when the block is unwanted.
     */
    wantBlock(cid: CID, options?: AbortOptions & ProgressOptions<BitswapWantBlockProgressEvents>): Promise<Uint8Array>;
    /**
     * Signal that the block is not wanted anymore
     */
    unwantBlock(cid: CID): void;
}
//# sourceMappingURL=notifications.d.ts.map