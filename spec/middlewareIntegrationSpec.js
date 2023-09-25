const { runJasmine, timeoutMs } = require('./integrationSupport');

describe('Middleware integration', function() {
  it(
    'supports arbitrary Express middleware',
    async function() {
      const { exitCode, stdout, stderr } = await runJasmine(
        'spec/fixtures/middleware',
        {
          extraArgs: '--config=jasmine-browser.js',
        }
      );
      jasmine.debugLog('stdout: ' + stdout);
      jasmine.debugLog('stderr: ' + stderr);
      expect(exitCode).toEqual(0);
    },
    timeoutMs
  );
});
