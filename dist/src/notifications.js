import { EventEmitter } from 'events';
import { CustomProgressEvent } from 'progress-events';
import { toString as uint8ArrayToString } from 'uint8arrays/to-string';
import * as CONSTANTS from './constants.js';
import { logger } from './utils/index.js';
const unwantEvent = (cid) => `unwant:${uint8ArrayToString(cid.multihash.bytes, 'base64')}`;
const blockEvent = (cid) => `block:${uint8ArrayToString(cid.multihash.bytes, 'base64')}`;
export class Notifications extends EventEmitter {
    /**
     * Internal module used to track events about incoming blocks,
     * wants and unwants.
     */
    constructor(peerId) {
        super();
        this.setMaxListeners(CONSTANTS.maxListeners);
        this._log = logger(peerId, 'notif');
    }
    /**
     * Signal the system that we received `block`.
     */
    hasBlock(cid, block) {
        const event = blockEvent(cid);
        this._log(event);
        this.emit(event, block);
    }
    /**
     * Signal the system that we are waiting to receive the
     * block associated with the given `cid`.
     * Returns a Promise that resolves to the block when it is received,
     * or undefined when the block is unwanted.
     */
    async wantBlock(cid, options = {}) {
        if (cid == null) {
            throw new Error('Not a valid cid');
        }
        const blockEvt = blockEvent(cid);
        const unwantEvt = unwantEvent(cid);
        this._log(`wantBlock:${cid}`);
        return await new Promise((resolve, reject) => {
            const onUnwant = () => {
                this.removeListener(blockEvt, onBlock);
                options.onProgress?.(new CustomProgressEvent('bitswap:want-block:unwant', cid));
                reject(new Error(`Block for ${cid} unwanted`));
            };
            const onBlock = (data) => {
                this.removeListener(unwantEvt, onUnwant);
                options.onProgress?.(new CustomProgressEvent('bitswap:want-block:block', cid));
                resolve(data);
            };
            this.once(unwantEvt, onUnwant);
            this.once(blockEvt, onBlock);
            options.signal?.addEventListener('abort', () => {
                this.removeListener(blockEvt, onBlock);
                this.removeListener(unwantEvt, onUnwant);
                reject(new Error(`Want for ${cid} aborted`));
            });
        });
    }
    /**
     * Signal that the block is not wanted anymore
     */
    unwantBlock(cid) {
        const event = unwantEvent(cid);
        this._log(event);
        this.emit(event);
    }
}
//# sourceMappingURL=notifications.js.map