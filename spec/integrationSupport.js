const { exec } = require('child_process');
const path = require('path');

const defaultTimeoutMs = 30 * 1000;

function runJasmine(cwd, { extraArgs, timeoutMs } = {}) {
  extraArgs ||= '';
  timeoutMs ||= defaultTimeoutMs;
  const jasmineBrowserPath = path
    .join(process.cwd(), 'bin/jasmine-browser-runner')
    .replace(/\\/g, '/'); // Windows compatibility

  return new Promise((resolve, reject) => {
    let timedOut = false;
    let timerId;
    const cmd = `node "${jasmineBrowserPath}" runSpecs ${extraArgs}`;
    jasmine.debugLog('Command: ' + cmd);
    jasmine.debugLog('Working directory: ' + cwd);
    const jasmineBrowserProcess = exec(cmd, { cwd }, function(
      err,
      stdout,
      stderr
    ) {
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
      } catch (e) {
        reject(e);
      }
    });

    timerId = setTimeout(function() {
      // Kill the child process if we're about to time out, to free up
      // the port.
      timedOut = true;
      jasmineBrowserProcess.kill();
    }, timeoutMs - 1000);
  });
}

function expectSuccess({ exitCode, stdout, stderr }, expectedOutput) {
  expect(exitCode).toEqual(0);
  expect(stdout).toContain(expectedOutput);
  jasmine.debugLog('stdout: ' + stdout);
  jasmine.debugLog('stderr: ' + stderr);
}

module.exports = { runJasmine, expectSuccess, timeoutMs: defaultTimeoutMs };
