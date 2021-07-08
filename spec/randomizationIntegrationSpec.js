const { exec } = require('child_process');

describe('Randomization integration', function() {
  it(
    'reports the command to reproduce the random seed',
    async function() {
      const firstStdout = await run();
      expect(firstStdout).toContain(
        'Randomized with seed 1234' + ' (jasmine-browser runSpecs --seed=1234'
      );
      const secondStdout = await run();
      const firstWithoutPort = removeVariableParts(firstStdout);
      const secondWithoutPort = removeVariableParts(secondStdout);
      expect(secondWithoutPort).toEqual(firstWithoutPort);

      // Make sure the order reporter was installed. Otherwise the above assertion
      // is meaningless.
      expect(firstWithoutPort).toContain('spec started: 0');

      function removeVariableParts(output) {
        return output
          .replace(/Jasmine server is running here.*/, '')
          .replace(/Finished in .* seconds/, '');
      }

      function run() {
        return new Promise((resolve, reject) => {
          let timedOut = false;
          let timerId;
          const jasmineBrowserProcess = exec(
            'node ../../../bin/jasmine-browser-runner runSpecs --seed=1234',
            { cwd: 'spec/fixtures/random' },
            function(err, stdout, stderr) {
              try {
                if (timedOut) {
                  return;
                }

                clearTimeout(timerId);

                if (!err) {
                  resolve(stdout);
                } else {
                  // Some kind of unexpected failure happened. Include all the info
                  // that we have.
                  reject(
                    `Child suite failed with error:\n${err}\n\n` +
                      `stdout:\n${stdout}\n\n` +
                      `stderr:\n${stderr}`
                  );
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
    },
    30 * 1000
  );
});
