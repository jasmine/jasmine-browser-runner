import { useRootImport, usePathedImport } from "../src/index.mjs";

describe('when using jasmine-browser-runner super cool importMap feature,', () => {

    it('should exec functions with a root import', () => {
        const result = useRootImport();
        expect(result).toEqual(42);
    });

    it('should exec functions with a pathed import', () => {
        const result = usePathedImport();
        expect(result).toEqual(42);
    });

});
