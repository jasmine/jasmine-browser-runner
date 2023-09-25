const {
  runJasmine,
  expectSuccess,
  timeoutMs,
} = require('./integrationSupport');

describe('Reporter integration', function() {
  it(
    'evaluates relative reporter paths in config files relative to the CWD',
    async function() {
      const result = await runJasmine('spec/fixtures/relativeReporterPath');
      expectSuccess(result, 'relativeReporterPath/spec/someReporter was used');
    },
    timeoutMs
  );
});
