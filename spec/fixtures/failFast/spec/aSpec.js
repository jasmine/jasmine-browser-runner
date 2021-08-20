it('fails twice', function() {
  expect(1).toBe(2);
  throw new Error('first test failure');
});

it('fails last', function() {
  throw new Error('second test failure');
});