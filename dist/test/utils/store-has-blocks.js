import { expect } from 'aegir/chai';
import { CID } from 'multiformats/cid';
export async function storeHasBlocks(message, store) {
    for (const k of message.blocks.keys()) {
        expect(await store.has(CID.parse(k))).to.be.true('missing block');
    }
}
//# sourceMappingURL=store-has-blocks.js.map