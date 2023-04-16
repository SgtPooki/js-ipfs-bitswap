// @ts-expect-error no types
import range from 'lodash.range';
import { expect } from 'aegir/chai';
export const orderedFinish = (n) => {
    const r = range(1, n + 1);
    const finishes = [];
    const output = (i) => {
        finishes.push(i);
    };
    output.assert = () => {
        expect(finishes.length).to.equal(n);
        expect(r).to.deep.equal(finishes, `Invalid finish order: ${finishes}`);
    };
    return output;
};
export const countToFinish = (n) => {
    let pending = n;
    const output = () => {
        pending--;
    };
    output.assert = () => {
        expect(pending).to.equal(0, `too many finishes, expected only ${n}`);
    };
    return output;
};
//# sourceMappingURL=helpers.js.map