// this import uses the pathed importmap entry pointing to a path.
// this import utilizes that path definition to then point somewhere
// in the lib's folder structure to a specific file.
import { libPathedPlusOne } from 'some-lib/some-path/index.mjs';

export function usePathedImport() {
    const a = 41;
    return libPathedPlusOne(a);
}
