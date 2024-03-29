/*
 * This is an example exported member of a library that the import map will
 * point to via a root export (importmap key points to specific file, usually
 * the "root" index file).
 *
 * @example
 *
 * importMap entry in jasmine-browser.json:
 *   "some-lib": "./node_modules/some-lib/dist/index.mjs"
 *
 * or importMap with moduleRootdir set to 'node_modules' in jasmine-browser.json:
 *   "some-lib": "some-lib/dist/index.mjs"
 *
 * consumed import in file:
 *   import { libMultiply } from 'some-lib';
 */
export function libMultiply(a, b) {
  return a * b;
}
