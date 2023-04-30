await new Promise(function(resolve) {
  // 100ms is usually long enough to make the specs fail if top level await
  // isn't supported, but short enough not to be too obnoxious.
  // This is inherently non-deterministic but should at least consistently pass
  // if the code is correct.
  setTimeout(resolve, 100);
})

it('is a spec in aSpec.mjs', function() {});

it('verifies that ES modules in helpers were awaited', function() {
  expect(window._helperLoaded).toBeTrue();
});