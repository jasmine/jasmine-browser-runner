it('can use middleware', async function() {
  const response = await fetch('/some-path/aFile.txt');
  expect(response.ok).toEqual(true);
  expect(await response.text()).toEqual('the contents of the file');
});