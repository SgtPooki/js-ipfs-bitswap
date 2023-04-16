import { Wantlist } from '../wantlist/index.js';
export class Ledger {
    constructor(peerId) {
        this.partner = peerId;
        this.wantlist = new Wantlist();
        this.exchangeCount = 0;
        this.accounting = {
            bytesSent: 0,
            bytesRecv: 0
        };
    }
    sentBytes(n) {
        this.exchangeCount++;
        this.lastExchange = (new Date()).getTime();
        this.accounting.bytesSent += n;
    }
    receivedBytes(n) {
        this.exchangeCount++;
        this.lastExchange = (new Date()).getTime();
        this.accounting.bytesRecv += n;
    }
    wants(cid, priority, wantType) {
        this.wantlist.add(cid, priority, wantType);
    }
    /**
     * @param {CID} cid
     * @returns {void}
     */
    cancelWant(cid) {
        this.wantlist.remove(cid);
    }
    wantlistContains(cid) {
        return this.wantlist.get(cid);
    }
    debtRatio() {
        return (this.accounting.bytesSent / (this.accounting.bytesRecv + 1)); // +1 is to prevent division by zero
    }
}
//# sourceMappingURL=ledger.js.map