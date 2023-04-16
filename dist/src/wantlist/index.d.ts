import { WantListEntry as Entry } from './entry.js';
import { Message } from '../message/message.js';
import type { Stats } from '../stats/index.js';
import type { Libp2p } from '@libp2p/interface-libp2p';
import type { CID } from 'multiformats/cid';
export declare class Wantlist {
    static Entry: typeof Entry;
    private readonly set;
    private readonly _stats?;
    constructor(stats?: Stats, libp2p?: Libp2p);
    get length(): number;
    add(cid: CID, priority: number, wantType: Message.Wantlist.WantType): void;
    remove(cid: CID): void;
    removeForce(cidStr: string): void;
    forEach(fn: (entry: Entry, key: string) => void): void;
    entries(): IterableIterator<[string, Entry]>;
    sortedEntries(): Map<string, Entry>;
    contains(cid: CID): boolean;
    get(cid: CID): Entry | undefined;
}
//# sourceMappingURL=index.d.ts.map