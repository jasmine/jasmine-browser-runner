const { runJasmine, timeoutMs } = require('./integrationSupport');

describe('Exit code integration', function() {
  it(
    'exits 0 on success',
    async function() {
      const exitCode = await run('spec/fixtures/exit/success');
      expect(exitCode).toEqual(0);
    },
    timeoutMs
  );

  it(
    'exits 1 when there are load errors',
    async function() {
      const exitCode = await run('spec/fixtures/exit/loadError');
      expect(exitCode).toEqual(1);
    },
    timeoutMs
  );

  it(
    'exits 2 when there are focused specs/suites but no failures',
    async function() {
      const exitCode = await run('spec/fixtures/exit/focused');
      expect(exitCode).toEqual(2);
    },
    timeoutMs
  );

  it(
    'exits 3 when all specs run but fail',
    async function() {
      const exitCode = await run('spec/fixtures/exit/failure');
      expect(exitCode).toEqual(3);
    },
    timeoutMs
  );
});

async function run(cwd = '') {
  const { exitCode, stdout, stderr } = await runJasmine(cwd, {
    extraArgs: '--config=jasmine-browser.json',
  });
  jasmine.debugLog('stdout: ' + stdout);
  jasmine.debugLog('stderr: ' + stderr);
  jasmine.debugLog('exit code: ' + exitCode);
  return exitCode;
}
