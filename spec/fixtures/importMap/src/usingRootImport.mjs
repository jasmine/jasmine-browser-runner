// this uses an importmap entry pointing to the root index.mjs specifically.
import { libMultiply } from 'some-lib';

export function useRootImport() {
    const a = 21;
    const b = 2;
    return libMultiply(a, b);
}
