const fs = require('fs');
const os = require('os');
const { exec } = require('child_process');

describe('remote grid parameter handling', function() {
  // To reduce the amount of output that devs have to scroll past, pend a single
  // spec and don't create the rest if Sauce isn't available.
  if (
    !(
      process.env.USE_SAUCE &&
      process.env.SAUCE_USERNAME &&
      process.env.SAUCE_ACCESS_KEY
    )
  ) {
    it('passes params to Saucelabs correctly', function() {
      pending(
        "Can't run remote grid integration tests unless USE_SAUCE, SAUCE_USERNAME, and SAUCE_ACCESS_KEY are set"
      );
    });
    return;
  }

  // These specs use browser+version+OS combos that are supported by Saucelabs.
  // When more than one OS is supported, we use the older one to make sure that
  // the OS parameter is actually being passed correctly. (Saucelabs generally
  // defaults to the newest OS that has the requested browser version if the OS
  // is not specified.)

  createSpec('firefox', '', '', /Gecko\/[0-9]+ Firefox\/[0-9.]+$/);
  createSpec(
    'firefox',
    '102',
    'Windows 10',
    /Windows NT 10.0;.* Firefox\/102\.0$/
  );
  createSpec('chrome', '', '', /\(KHTML, like Gecko\) Chrome\/[0-9]+[0-9.]+/);
  createSpec(
    'safari',
    '15',
    'macOS 12',
    // Safari on 12.x reports the OS as 10_15_7
    /Mac OS X 10_15.*Version\/15[0-9.]+ Safari/
  );
  createSpec(
    'safari',
    '16',
    'macOS 12',
    // Safari on 12.x reports the OS as 10_15_7
    /Mac OS X 10_15.*Version\/16[0-9.]+ Safari/
  );
  createSpec(
    'MicrosoftEdge',
    '',
    'Windows 10',
    /Windows NT 10\.0.*Edg\/[0-9]+\.[0-9.]+$/
  );

  function createSpec(browser, version, sauceOS, expectedUserAgentRegex) {
    const displayVersion = version
      ? `version ${version}`
      : 'unspecified version';
    const displayOS = sauceOS ? `OS ${sauceOS}` : 'unspecified OS';
    it(
      `passes browser ${browser}, ${displayVersion}, and ${displayOS} correctly`,
      function(done) {
        const suiteDir = createSuite();
        const jasmineBrowserDir = process.cwd();
        let timedOut = false;
        let timerId;
        console.log('Sauce test may take a minute or two');

        const jasmineBrowserProcess = exec(
          `"${jasmineBrowserDir}/bin/jasmine-browser-runner" runSpecs --config=jasmine-browser.json`,
          { cwd: suiteDir },
          function(err, stdout, stderr) {
            try {
              if (timedOut) {
                return;
              }

              clearTimeout(timerId);

              if (!err) {
                expect(stdout).toContain('1 spec, 0 failures');
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
        }, 239 * 1000);
      },
      240 * 1000
    );

    function createSuite() {
      const dir = fs.mkdtempSync(`${os.tmpdir()}/jasmine-browser-sauce-`);
      processTemplate(
        'spec/fixtures/remoteGridIntegration/jasmine-browser.json',
        `${dir}/jasmine-browser.json`,
        {
          JASMINE_BROWSER: browser,
          SAUCE_BROWSER_VERSION: version,
          SAUCE_OS: sauceOS,
          SAUCE_TUNNEL_IDENTIFIER: process.env.SAUCE_TUNNEL_IDENTIFIER || '',
          SAUCE_USERNAME: process.env.SAUCE_USERNAME,
          SAUCE_ACCESS_KEY: process.env.SAUCE_ACCESS_KEY,
        }
      );
      processTemplate(
        'spec/fixtures/remoteGridIntegration/remoteGridParamsSpec.js',
        `${dir}/remoteGridParamsSpec.js`,
        { EXPECTED: expectedUserAgentRegex }
      );
      return dir;
    }

    function processTemplate(inPath, outPath, vars) {
      const template = fs.readFileSync(inPath, { encoding: 'utf8' });

      const output = Object.keys(vars).reduce(function(prev, k) {
        return prev.replace(`<< ${k} >>`, vars[k]);
      }, template);

      fs.writeFileSync(outPath, output);
    }
  }
});
