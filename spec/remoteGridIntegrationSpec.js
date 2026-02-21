const fs = require('fs');
const os = require('os');
const { runJasmine, expectSuccess } = require('./integrationSupport');

const timeoutMs = 240 * 1000;

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
  createSpec(
    'firefox',
    '115',
    'Windows 10',
    /Windows NT 10.0;.* Firefox\/115\.0$/
  );
  createSpec(
    'firefox',
    '128',
    'Windows 10',
    /Windows NT 10.0;.* Firefox\/128\.0$/
  );
  // As of 2023-09-30, Chrome latest on the default Linux is broken on
  // Saucelabs. Use Mac OS for now instead.
  createSpec(
    'chrome',
    '',
    'macOS 12',
    /\(KHTML, like Gecko\) Chrome\/[0-9]+[0-9.]+/
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
      async function() {
        const suiteDir = createSuite();
        console.log('remote grid test may take a minute or two');

        const result = await runJasmine(suiteDir, {
          extraArgs: '--config=jasmine-browser.json',
          timeoutMs,
        });

        expectSuccess(result, '1 spec, 0 failures');
      },
      timeoutMs
    );

    function createSuite() {
      const dir = fs.mkdtempSync(`${os.tmpdir()}/jasmine-browser-remote-grid-`);
      processTemplate(
        'spec/fixtures/remoteGridIntegration/jasmine-browser.json',
        `${dir}/jasmine-browser.json`,
        {
          JASMINE_BROWSER: browser,
          SAUCE_BROWSER_VERSION: version,
          SAUCE_OS: sauceOS,
          SAUCE_TUNNEL_NAME: process.env.SAUCE_TUNNEL_NAME,
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
