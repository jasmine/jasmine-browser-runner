const {
  runJasmine,
  expectSuccess,
  timeoutMs,
} = require('./integrationSupport');

describe('ESM in Specs', function() {
  it(
    'optionally loads ESM files in spec',
    async function() {
      const result = await runJasmine(
        'spec/fixtures/modulesWithSideEffectsInSrcFiles'
      );
      expectSuccess(result, '2 specs, 0 failures');
    },
    timeoutMs
  );
});
