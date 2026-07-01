const http = require('http');
const { runJasmine, timeoutMs } = require('./integrationSupport');

describe('Middleware integration', function() {
  it(
    'supports serving arbitrary files',
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

  it(
    'supports custom response headers',
    async function() {
      const { exitCode, stdout, stderr } = await runJasmine(
        'spec/fixtures/middlewareHeaders',
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

  it(
    'supports proxy-style middleware',
    async function() {
      const backend = http.createServer(function(req, res) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok' }));
      });
      await new Promise(resolve => backend.listen(18900, resolve));

      try {
        const { exitCode, stdout, stderr } = await runJasmine(
          'spec/fixtures/middlewareProxy',
          {
            extraArgs: '--config=jasmine-browser.js',
          }
        );
        jasmine.debugLog('stdout: ' + stdout);
        jasmine.debugLog('stderr: ' + stderr);
        expect(exitCode).toEqual(0);
      } finally {
        await new Promise(resolve => backend.close(resolve));
      }
    },
    timeoutMs
  );
});
