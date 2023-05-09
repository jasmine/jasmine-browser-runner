import { useRootImport } from "../src/index.mjs";
import { usePathedImport } from "../src/usingPathedImport.mjs";

describe('when using import maps,', function() {
  it('should execute function without any imports', function() {
    expect(true).toBeTrue();
  });

  it('should exec functions with a root import', function() {
    const result = useRootImport();
    expect(result).toEqual(42);
  });

  it('should exec functions with a pathed import', function() {
    const result = usePathedImport();
    expect(result).toEqual(42);
  });
});


// The following commented out code is an example of using an absolute URL
// specifier, like you would if you were pulling down a package from a CDN.
// This is included here for didactic purposes only. This is commented out,
// because we can't be reliant upon/pinging a CDN every time these specs are
// run. If you want to run this in jasmine-browser-runner specs via `npm test`,
// you must uncomment the code, add the entry to this fixture's
// jasmine-browser.json and jasmine-browser.module-root-dir.json importMaps and
// adjust the expected output in the importMapSpec.js file. Note that for some
// packages, the correct map specifier may point to an index.mjs file.

// add "lodash-es": "https://cdn.jsdelivr.net/npm/lodash-es@4.17.21/+esm" to
// importMap in jasmine-browser.json for the following import
// import _ from "lodash-es";
// describe('when using using importMap with absolute URL specifier', () => {

//   it('should consume a CDN resource without erroring using default import', () => {
//     const result = _.has({aKey: 'a value'}, 'aKey');
//     expect(result).toBeTrue();
//   });

// });
