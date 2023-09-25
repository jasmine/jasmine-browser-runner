const {
  runJasmine,
  expectSuccess,
  timeoutMs,
} = require('./integrationSupport');

describe('Headless Chrome integration', function() {
  it(
    'uses the new headless mode (--headless=new)',
    async function() {
      const result = await runJasmine('spec/fixtures/headlessChrome', {
        extraArgs: '--config=jasmine-browser.json',
      });
      expectSuccess(result, '1 spec, 0 failures');
    },
    timeoutMs
  );
});
