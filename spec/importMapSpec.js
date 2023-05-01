// there are also import map-related specs in configSpec and serverSpec.

const { exec } = require('child_process');

describe('Import Map Sample Project', function() {
  beforeEach(function() {
    if (process.env.JASMINE_NO_BROWSER_TESTS) {
      pending('skipping because the JASMINE_NO_BROWSER_TESTS env var is set');
    }
  });

  it(
    'executes example specs',
    function(done) {
      let timedOut = false;
      let timerId;
      const jasmineBrowserProcess = exec(
        'node ../../../bin/jasmine-browser-runner runSpecs',
        // 'node ../../../bin/jasmine-browser-runner serve', // for debugging
        { cwd: 'spec/fixtures/importMap' },
        function(err, stdout, stderr) {
          try {
            if (timedOut) {
              return;
            }

            clearTimeout(timerId);

            if (!err) {
              expect(stdout).toContain('3 specs, 0 failures');
              done();
            } else {
              if (err.code !== 1 || stdout === '' || stderr !== '') {
                // Some kind of unexpected failure happened. Include all the info
                // that we have.
                done.fail(
                  `Child suite failed with error:\n${err}\n\n` +
                    `stdout:\n${stdout}\n\n` +
                    `stderr:\n${stderr}`
                );
              } else {
                // A normal suite failure. Just include the output.
                done.fail(`Child suite failed with output:\n${stdout}`);
              }
            }
          } catch (e) {
            done.fail(e);
          }
        }
      );

      timerId = setTimeout(function() {
        // Kill the child processs if we're about to time out, to free up
        // the port.
        timedOut = true;
        jasmineBrowserProcess.kill();
      }, 29 * 1000);
    },
    30 * 1000
  );

  it(
    'executes example specs with moduleRootDir',
    function(done) {
      let timedOut = false;
      let timerId;
      const jasmineBrowserProcess = exec(
        'node ../../../bin/jasmine-browser-runner runSpecs --config=spec/support/jasmine-browser.module-root-dir.json',
        // 'node ../../../bin/jasmine-browser-runner serve --config=spec/support/jasmine-browser.module-root-dir.json', // for debugging
        { cwd: 'spec/fixtures/importMap' },
        function(err, stdout, stderr) {
          try {
            if (timedOut) {
              return;
            }

            clearTimeout(timerId);

            if (!err) {
              expect(stdout).toContain('3 specs, 0 failures');
              done();
            } else {
              if (err.code !== 1 || stdout === '' || stderr !== '') {
                // Some kind of unexpected failure happened. Include all the info
                // that we have.
                done.fail(
                  `Child suite failed with error:\n${err}\n\n` +
                    `stdout:\n${stdout}\n\n` +
                    `stderr:\n${stderr}`
                );
              } else {
                // A normal suite failure. Just include the output.
                done.fail(`Child suite failed with output:\n${stdout}`);
              }
            }
          } catch (e) {
            done.fail(e);
          }
        }
      );
      timerId = setTimeout(function() {
        // Kill the child processs if we're about to time out, to free up
        // the port.
        timedOut = true;
        jasmineBrowserProcess.kill();
      }, 29 * 1000);
    },
    30 * 1000
  );
});
