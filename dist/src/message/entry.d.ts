import type { CID } from 'multiformats/cid';
import type { Message } from './message.js';
import { WantListEntry } from '../wantlist/entry.js';
export declare class BitswapMessageEntry {
    entry: WantListEntry;
    cancel: boolean;
    sendDontHave: boolean;
    constructor(cid: CID, priority: number, wantType: Message.Wantlist.WantType, cancel?: boolean, sendDontHave?: boolean);
    get cid(): CID;
    set cid(cid: CID);
    get priority(): number;
    set priority(val: number);
    get wantType(): Message.Wantlist.WantType;
    set wantType(val: Message.Wantlist.WantType);
    get [Symbol.toStringTag](): string;
    equals(other: BitswapMessageEntry): boolean;
}
//# sourceMappingURL=entry.d.ts.map