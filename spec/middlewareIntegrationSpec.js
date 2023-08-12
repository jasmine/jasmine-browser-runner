const { exec } = require('child_process');

describe('Middleware integration', function() {
  it(
    'supports arbitrary Express middleware',
    async function() {
      const exitCode = await run('spec/fixtures/middleware');
      expect(exitCode).toEqual(0);
    },
    30 * 1000
  );
});

function run(cwd, extraArgs = '') {
  return new Promise((resolve, reject) => {
    let timedOut = false;
    let timerId;
    const jasmineBrowserProcess = exec(
      'node ../../../bin/jasmine-browser-runner runSpecs --config=jasmine-browser.js',
      { cwd },
      function(err, stdout, stderr) {
        try {
          if (timedOut) {
            return;
          }

          clearTimeout(timerId);
          jasmine.debugLog('stdout: ' + stdout);
          jasmine.debugLog('stderr: ' + stdout);
          resolve(err ? err.code : 0);
        } catch (e) {
          reject(e);
        }
      }
    );

    timerId = setTimeout(function() {
      // Kill the child processs if we're about to time out, to free up
      // the port.
      timedOut = true;
      jasmineBrowserProcess.kill();
    }, 29 * 1000);
  });
}
