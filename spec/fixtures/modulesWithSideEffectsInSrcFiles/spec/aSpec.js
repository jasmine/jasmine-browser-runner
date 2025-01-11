it('verifies that ES modules in sources are automatically loaded in the correct order', function() {
  expect(window._moduleWithSyncSideEffectLoaded).withContext('window._moduleWithSyncSideEffectLoaded').toBe(true);
  expect(window._scriptSyncSuccess).withContext('window._scriptSyncSuccess').toBe(true);
});
