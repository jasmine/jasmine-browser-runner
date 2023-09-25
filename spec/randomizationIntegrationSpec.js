const { runJasmine, timeoutMs } = require('./integrationSupport');

describe('Randomization integration', function() {
  it(
    'reports the command to reproduce the random seed',
    async function() {
      const firstStdout = await run();
      expect(firstStdout).toContain(
        'Randomized with seed 1234' +
          ' (jasmine-browser-runner runSpecs --seed=1234'
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

      async function run() {
        const { exitCode, stdout, stderr } = await runJasmine(
          'spec/fixtures/random',
          {
            extraArgs: '--seed=1234',
          }
        );
        expect(exitCode).toEqual(0);
        jasmine.debugLog('stdout: ' + stdout);
        jasmine.debugLog('stderr: ' + stderr);
        return stdout;
      }
    },
    timeoutMs
  );
});
