import debounce from 'just-debounce-it';
import { BitswapMessage as Message } from '../message/index.js';
import { logger } from '../utils/index.js';
import { wantlistSendDebounceMs } from '../constants.js';
export class MsgQueue {
    constructor(selfPeerId, otherPeerId, network) {
        this.peerId = otherPeerId;
        this.network = network;
        this.refcnt = 1;
        this._entries = [];
        this._log = logger(selfPeerId, 'msgqueue');
        this.sendEntries = debounce(this.sendEntries.bind(this), wantlistSendDebounceMs);
    }
    addMessage(msg, options = {}) {
        if (msg.empty) {
            return;
        }
        void this.send(msg, options);
    }
    addEntries(entries, options = {}) {
        this._entries = this._entries.concat(entries);
        this.sendEntries(options);
    }
    sendEntries(options = {}) {
        if (this._entries.length === 0) {
            return;
        }
        const msg = new Message(false);
        this._entries.forEach((entry) => {
            if (entry.cancel === true) {
                msg.cancel(entry.cid);
            }
            else {
                msg.addEntry(entry.cid, entry.priority);
            }
        });
        this._entries = [];
        this.addMessage(msg, options);
    }
    async send(msg, options = {}) {
        try {
            await this.network.connectTo(this.peerId, options);
        }
        catch (err) {
            this._log.error('cant connect to peer %p: %s', this.peerId, err.message);
            return;
        }
        this._log('sending message to peer %p', this.peerId);
        // Note: Don't wait for sendMessage() to complete
        this.network.sendMessage(this.peerId, msg, options).catch((err) => {
            this._log.error('send error', err);
        });
    }
}
//# sourceMappingURL=msg-queue.js.map