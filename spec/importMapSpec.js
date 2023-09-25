// there are also import map-related specs in configSpec and serverSpec.

const { runJasmine } = require('./integrationSupport');

describe('Import Map Sample Project', function() {
  it('executes example specs', async function() {
    const { exitCode, stdout, stderr } = await runJasmine(
      'spec/fixtures/importMap'
    );

    if (exitCode === 0) {
      expect(stdout).toContain('3 specs, 0 failures');
    } else if (exitCode === 3) {
      // A normal suite failure. Just include the output.
      fail(`Child suite failed with output:\n${stdout}`);
    } else {
      // Some kind of unexpected failure happened. Include all the info
      // that we have.
      fail(
        `Child suite failed with exit code:\n${exitCode}\n\n` +
          `stdout:\n${stdout}\n\n` +
          `stderr:\n${stderr}`
      );
    }
  });

  it(
    'executes example specs with moduleRootDir',
    async function() {
      const { exitCode, stdout, stderr } = await runJasmine(
        'spec/fixtures/importMap',
        {
          extraArgs:
            '--config=spec/support/jasmine-browser.module-root-dir.json',
        }
      );

      if (exitCode === 0) {
        expect(stdout).toContain('3 specs, 0 failures');
      } else if (exitCode === 3) {
        // A normal suite failure. Just include the output.
        fail(`Child suite failed with output:\n${stdout}`);
      } else {
        // Some kind of unexpected failure happened. Include all the info
        // that we have.
        fail(
          `Child suite failed with exit code:\n${exitCode}\n\n` +
            `stdout:\n${stdout}\n\n` +
            `stderr:\n${stderr}`
        );
      }
    },
    30 * 1000
  );
});
