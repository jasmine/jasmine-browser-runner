import { useRootImport } from "../__src__/index.mjs";
import { usePathedImport } from "../__src__/usingPathedImport.mjs";
import { pretty } from 'helper-gib'; // uses absolute map -> "helper-gib": "https://cdn.jsdelivr.net/npm/@ibgib/helper-gib@0.0.4/dist/index.mjs"

describe('when using jasmine-browser-runner super cool importMap feature,', () => {

    it('should execute function without any imports', () => {
        expect(true).toBeTrue();
    });

    it('should consume helper-gib pretty', () => {
        let x = {
            a: 'aaa',
            b: 'bbbb',
            c: '1234c'
        };
        let prettyString = pretty(x);
        console.log(prettyString)
        expect(prettyString).toBeTruthy();
    });

    it('should exec functions with a root import', () => {
        const result = useRootImport();
        expect(result).toEqual(42);
    });

    it('should exec functions with a pathed import', () => {
        const result = usePathedImport();
        expect(result).toEqual(42);
    });

});
