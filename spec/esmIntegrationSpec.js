const { exec } = require('child_process');

describe('ESM integration', function() {
  it(
    'supports ES modules as specs, helpers, and sources',
    function(done) {
      let timedOut = false;
      let timerId;
      const jasmineBrowserProcess = exec(
        '../../../bin/jasmine-browser runSpecs',
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
});
