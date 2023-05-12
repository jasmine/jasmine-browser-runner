const { exec } = require('child_process');

describe('ESM integration', function() {
  beforeEach(function() {
    if (process.env.JASMINE_NO_BROWSER_TESTS) {
      pending('skipping because the JASMINE_NO_BROWSER_TESTS env var is set');
    }
  });

  it(
    'supports ES modules as specs, helpers, and sources',
    function(done) {
      let timedOut = false;
      let timerId;
      const jasmineBrowserProcess = exec(
        'node ../../../bin/jasmine-browser-runner runSpecs',
        { cwd: 'spec/fixtures/esmIntegration' },
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
    'optionally loads .js files as ES modules',
    function(done) {
      let timedOut = false;
      let timerId;
      const jasmineBrowserProcess = exec(
        'node ../../../bin/jasmine-browser-runner runSpecs',
        { cwd: 'spec/fixtures/esmIntegrationJsExtension' },
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
    'optionally supports top-level await',
    function(done) {
      let timedOut = false;
      let timerId;
      const jasmineBrowserProcess = exec(
        'node ../../../bin/jasmine-browser-runner runSpecs',
        { cwd: 'spec/fixtures/topLevelAwait' },
        function(err, stdout, stderr) {
          try {
            if (timedOut) {
              return;
            }

            clearTimeout(timerId);

            if (!err) {
              expect(stdout).toContain('3 specs, 0 failures');
              // Verify that specs ran in the expected order
              expect(stdout).toContain(
                'Spec started: is a spec in aSpec.mjs\n' +
                  '.Spec started: verifies that ES modules in helpers were awaited\n' +
                  '.Spec started: is a spec in bSpec.js\n'
              );
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
