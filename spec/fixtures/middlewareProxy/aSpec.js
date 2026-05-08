it('can proxy or stub API requests', async function() {
  const response = await fetch('/api/test');
  expect(response.ok).toBe(true);
  const data = await response.json();
  expect(data).toEqual({ status: "ok" });
});
