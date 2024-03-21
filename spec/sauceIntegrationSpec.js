const fs = require('fs');
const os = require('os');
const { runJasmine, expectSuccess } = require('./integrationSupport');

const timeoutMs = 240 * 1000;

describe('Sauce parameter handling', function() {
  // Test one browser+version+OS that's supported by both Jasmine and Saucelabs,
  // to make sure we pass those parameters correctly.
  // When more than one OS is supported, we use the older one to make sure that
  // the OS parameter is actually being passed correctly. (Saucelabs generally
  // defaults to the newest OS that has the requested browser version if the OS
  // is not specified.)
  // This test can be updated to use a different browser if we stop supporting
  // Firefox 115.
  const browser = 'firefox';
  const version = '115';
  const osName = 'Windows 10';
  const expectedUserAgentRegex = /Windows NT 10.0;.* Firefox\/115\.0$/;

  it(
    'passes browser, version, and OS correctly',
    async function() {
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

      const suiteDir = createSuite();
      console.log('Sauce test may take a minute or two');

      const result = await runJasmine(suiteDir, {
        extraArgs: '--config=jasmine-browser.json',
        timeoutMs,
      });

      expectSuccess(result, '1 spec, 0 failures');
    },
    timeoutMs
  );

  function createSuite() {
    const dir = fs.mkdtempSync(`${os.tmpdir()}/jasmine-browser-sauce-`);
    processTemplate(
      'spec/fixtures/sauceIntegration/jasmine-browser.json',
      `${dir}/jasmine-browser.json`,
      {
        JASMINE_BROWSER: browser,
        SAUCE_BROWSER_VERSION: version,
        SAUCE_OS: osName,
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
});
