const { exec } = require('child_process');

describe('Exit code integration', function() {
  it(
    'exits 0 on success',
    async function() {
      const exitCode = await run('spec/fixtures/exit/success');
      expect(exitCode).toEqual(0);
    },
    30 * 1000
  );

  it(
    'exits 1 when there are load errors',
    async function() {
      const exitCode = await run('spec/fixtures/exit/loadError');
      expect(exitCode).toEqual(1);
    },
    30 * 1000
  );

  it(
    'exits 2 when there are focused specs/suites but no failures',
    async function() {
      const exitCode = await run('spec/fixtures/exit/focused');
      expect(exitCode).toEqual(2);
    },
    30 * 1000
  );

  it(
    'exits 3 when all specs run but fail',
    async function() {
      const exitCode = await run('spec/fixtures/exit/failure');
      expect(exitCode).toEqual(3);
    },
    30 * 1000
  );
});

function run(cwd, extraArgs = '') {
  return new Promise((resolve, reject) => {
    let timedOut = false;
    let timerId;
    const jasmineBrowserProcess = exec(
      'node ../../../../bin/jasmine-browser-runner runSpecs --config=jasmine-browser.json',
      { cwd },
      function(err, stdout, stderr) {
        try {
          if (timedOut) {
            return;
          }

          clearTimeout(timerId);

          if (err) {
            resolve(err.code);
          } else {
            resolve(0);
          }
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

