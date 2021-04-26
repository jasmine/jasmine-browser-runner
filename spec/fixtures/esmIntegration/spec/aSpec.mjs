import {awesomeize} from '../__src__/aModule.mjs';

it('can use other ES modules', function() {
  expect(awesomeize('es modules')).toEqual('ES MODULES');
});

it('verifies that ES modules in sources are not automatically loaded', function() {
  expect(window._moduleWithSideEffectLoaded).toBeUndefined();
});

it('verifies that ES modules in helpers loaded', function() {
  expect(window._helperLoaded).toBeTrue();
});