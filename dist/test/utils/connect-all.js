// @ts-expect-error no types
import without from 'lodash.without';
export const connectAll = async (nodes) => {
    for (const node of nodes) {
        for (const otherNode of without(nodes, node)) {
            await node.libp2pNode.dial(otherNode.bitswap.peerId);
        }
    }
};
//# sourceMappingURL=connect-all.js.map