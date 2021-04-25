const fs = require('fs');
const os = require('os');
const { exec } = require('child_process');

describe('Sauce parameter handling', function() {
  // These specs use browser+version+OS combos that are supported by Saucelabs.
  // When more than one OS is supported, we use the older one to make sure that
  // the OS parameter is actually being passed correctly. (Saucelabs generally
  // defaults to the newest OS that has the requested browser version if the OS
  // is not specified.)

  createSpec(
    'internet explorer',
    '11',
    'Windows 8.1',
    /Windows NT 6.3;.*Trident\/7\.0.*rv:11\.0/
  );
  createSpec(
    'internet explorer',
    '10',
    'Windows 8',
    /MSIE 10\.0;.*Windows NT 6\.2;.*Trident\/6\.0/
  );
  createSpec('firefox', '', '', /Gecko\/[0-9]+ Firefox\/[0-9.]+$/);
  createSpec(
    'firefox',
    '78',
    'Windows 10',
    /Windows NT 10.0;.* Firefox\/78\.0$/
  );
  createSpec(
    'firefox',
    '68',
    'Windows 10',
    /Windows NT 10.0;.*Firefox\/68\.0$/
  );
  createSpec('chrome', '', '', /\(KHTML, like Gecko\) Chrome\/[0-9]+[0-9.]+/);
  createSpec(
    'safari',
    '14',
    'OS X 11.00',
    // Safari on 11.0 reports the OS as 10.15
    /Mac OS X 10_15.*Version\/14[0-9.]+ Safari/
  );
  createSpec(
    'safari',
    '13',
    'OS X 10.15',
    /Mac OS X 10_15.*Version\/13[0-9.]+ Safari/
  );
  createSpec(
    'safari',
    '12',
    'OS X 10.13',
    /Mac OS X 10_13.*Version\/12[0-9.]+ Safari/
  );
  createSpec(
    'safari',
    '11',
    'OS X 10.12',
    /Mac OS X 10_12.*Version\/11[0-9.]+ Safari/
  );
  createSpec(
    'safari',
    '10',
    'OS X 10.11',
    /Mac OS X 10_11.*Version\/10[0-9.]+ Safari/
  );
  createSpec(
    'safari',
    '9',
    'OS X 10.11',
    /Mac OS X 10_11.*Version\/9[0-9.]+ Safari/
  );
  createSpec(
    'safari',
    '8',
    'OS X 10.10',
    /Mac OS X 10_10.*Version\/8\.0[0-9.]+ Safari/
  );
  createSpec(
    'MicrosoftEdge',
    '',
    'Windows 10',
    /Windows NT 10\.0.*Edg\/90\.[0-9.]+$/
  );

  function createSpec(browser, version, sauceOS, expectedUserAgentRegex) {
    const displayVersion = version
      ? `version ${version}`
      : 'unspecified version';
    const displayOS = sauceOS ? `OS ${sauceOS}` : 'unspecified OS';
    it(
      `passes browser ${browser}, ${displayVersion}, and ${displayOS} correctly`,
      function(done) {
        requireSauceEnv();
        const suiteDir = createSuite();
        const jasmineBrowserDir = process.cwd();
        let timedOut = false;
        let timerId;
        console.log('Sauce test may take a minute or two');

        const jasmineBrowserProcess = exec(
          `"${jasmineBrowserDir}/bin/jasmine-browser" runSpecs --config=jasmine-browser.json`,
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
        }, 59 * 1000);
      },
      60 * 1000
    );

    function createSuite() {
      const dir = fs.mkdtempSync(`${os.tmpdir()}/jasmine-browser-sauce-`);
      processTemplate(
        'spec/fixtures/sauceIntegration/jasmine-browser.json',
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
        'spec/fixtures/sauceIntegration/sauceParamsSpec.js',
        `${dir}/sauceParamsSpec.js`,
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

    function requireSauceEnv() {
      if (
        !(
          process.env.USE_SAUCE &&
          process.env.SAUCE_USERNAME &&
          process.env.SAUCE_ACCESS_KEY
        )
      ) {
        pending(
          "Can't run Sauce integration tests unless USE_SAUCE, SAUCE_USERNAME, and SAUCE_ACCESS_KEY are set"
        );
      }
    }
  }
});
