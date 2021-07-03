const loadConfig = require('../lib/loadConfig');

describe('loadConfig', function() {
  it('uses a specified config file', async function() {
    const result = await loadConfig('.', {
      config: 'spec/fixtures/loadConfig/json/spec/support/jasmine-browser.json',
    });
    expect(result.browser.name).toEqual(
      'the browser from jasmine-browser.json'
    );
  });

  it('can load a config file that is an ES module', async function() {
    const result = await loadConfig('spec/fixtures/loadConfig/esm', {});
    expect(result.browser.name).toEqual(
      'the browser from the es module config'
    );
  });

  it('throws if the specified config file is missing', async function() {
    await expectAsync(
      loadConfig('.', { config: 'no/such.json' })
    ).toBeRejectedWithError(
      /^Could not find configuration file.\nTried:\n\* .*no\/such.json/gm
    );
  });

  describe('When there is no specified config file', function() {
    describe('and spec/support/jasmine-browser.js is present', function() {
      it('loads spec/support/jasmine-browser.js', async function() {
        const result = await loadConfig('spec/fixtures/loadConfig/both', {});
        expect(result.browser.name).toEqual(
          'the browser from jasmine-browser.js'
        );
      });
    });

    describe('and spec/support/jasmine-browser.js is absent', function() {
      it('loads spec/support/jasmine-browser.json', async function() {
        const result = await loadConfig('spec/fixtures/loadConfig/json', {});
        expect(result.browser.name).toEqual(
          'the browser from jasmine-browser.json'
        );
      });

      describe('and spec/support/jasmine-browser.json is also absent', function() {
        it('thorws an error', async function() {
          await expectAsync(
            loadConfig('spec/fixtures/loadConfig/none', {})
          ).toBeRejectedWithError(
            /^Could not find configuration file.\nTried:\n\* .*spec\/fixtures\/loadConfig\/none\/spec\/support\/jasmine-browser.js\n\* .*spec\/fixtures\/loadConfig\/none\/spec\/support\/jasmine-browser.json/
          );
        });
      });
    });
  });
});
