import type { CID } from 'multiformats/cid';
import type { Message } from '../message/message';
export declare class WantListEntry {
    private _refCounter;
    cid: CID;
    priority: number;
    wantType: Message.Wantlist.WantType;
    constructor(cid: CID, priority: number, wantType: Message.Wantlist.WantType);
    inc(): void;
    dec(): void;
    hasRefs(): boolean;
    get [Symbol.toStringTag](): string;
    equals(other: any): boolean;
}
//# sourceMappingURL=entry.d.ts.map