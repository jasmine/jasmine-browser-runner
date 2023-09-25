const {
  runJasmine,
  expectSuccess,
  timeoutMs,
} = require('./integrationSupport');

describe('ESM integration', function() {
  it(
    'supports ES modules as specs, helpers, and sources',
    async function() {
      const result = await runJasmine('spec/fixtures/esmIntegration');
      expectSuccess(result, '3 specs, 0 failures');
    },
    timeoutMs
  );

  it(
    'optionally loads .js files as ES modules',
    async function() {
      const result = await runJasmine(
        'spec/fixtures/esmIntegrationJsExtension'
      );
      expectSuccess(result, '3 specs, 0 failures');
    },
    timeoutMs
  );

  it(
    'optionally supports top-level await',
    async function() {
      const result = await runJasmine('spec/fixtures/topLevelAwait');
      expectSuccess(result, '3 specs, 0 failures');
      // Verify that specs ran in the expected order
      expect(result.stdout).toContain(
        'Spec started: is a spec in aSpec.mjs\n' +
          '.Spec started: verifies that ES modules in helpers were awaited\n' +
          '.Spec started: is a spec in bSpec.js\n'
      );
    },
    timeoutMs
  );
});
