const { exec } = require('child_process');

describe('Headless Chrome integration', function() {
  it(
    'uses the new headless mode (--headless=new)',
    async function() {
      const { exitCode, stdout, stderr } = await run(
        'spec/fixtures/headlessChrome',
        '--config=jasmine-browser.json'
      );
      expect(exitCode).toEqual(0);
      expect(stdout).toContain('1 spec, 0 failures');
      jasmine.debugLog('stdout: ' + stdout);
      jasmine.debugLog('stderr: ' + stderr);
    },
    30 * 1000
  );

  function run(cwd, extraArgs = '') {
    return new Promise((resolve, reject) => {
      let timedOut = false;
      let timerId;
      jasmine.debugLog(
        'node ../../../bin/jasmine-browser-runner runSpecs ' + extraArgs
      );
      const jasmineBrowserProcess = exec(
        'node ../../../bin/jasmine-browser-runner runSpecs ' + extraArgs,
        { cwd },
        function(err, stdout, stderr) {
          try {
            if (timedOut) {
              return;
            }

            clearTimeout(timerId);
            resolve({
              exitCode: err ? err.code : 0,
              stdout,
              stderr,
            });
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
});
