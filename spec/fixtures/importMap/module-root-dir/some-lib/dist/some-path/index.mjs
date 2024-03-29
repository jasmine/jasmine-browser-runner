/*
 * This is an example exported member of a library that the import map
 * will point to via a path (entry key/value each with a trailing slash)
 *
 * @example
 *
 * importMap entry in jasmine-browser.json:
 *   "some-lib/": "node_modules/some-lib/dist/"
 *
 * or importMap with moduleRootdir set to 'node_modules' in jasmine-browser.json:
 *   "some-lib/": "some-lib/dist/"
 *
 * consumed import in file:
 *   import { libPathedPlusOne } from 'some-lib/some-path/index.mjs';
 */
export function libPathedPlusOne(a) {
  return a + 1;
}