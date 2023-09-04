it('is running in new headless Chrome', function() {
  expect(window.chrome).withContext('window.chrome').toBeTruthy();
})