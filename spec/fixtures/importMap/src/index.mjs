// this uses an importmap entry pointing to the root index.mjs specifically.
import { libMultiply } from 'some-lib';

// this import uses the pathed importmap entry pointing to a path.
// this import utilizes that path definition to then point somewhere
// in the lib's folder structure to a specific file.
import { libPathedPlusOne } from 'some-lib/dist/some-path/index.mjs';

export function useRootImport() {
    const a = 21;
    const b = 2;
    return libMultiply(a, b);
}

export function usePathedImport() {
    const a = 41;
    return libPathedPlusOne(a);
}
