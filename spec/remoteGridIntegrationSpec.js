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
