const loadConfig = require('../lib/loadConfig');

describe('loadConfig', function() {
  it('uses a specified config file', function() {
    const result = loadConfig('.', {
      config: 'spec/fixtures/loadConfig/json/spec/support/jasmine-browser.json',
    });
    expect(result.browser.name).toEqual(
      'the browser from jasmine-browser.json'
    );
  });

  it('throws if the specified config file is missing', function() {
    expect(function() {
      loadConfig('.', { config: 'no/such.json' });
    }).toThrowError(
      /^Could not find configuration file.\nTried:\n\* .*no\/such.json/gm
    );
  });

  describe('When there is no specified config file', function() {
    describe('and spec/support/jasmine-browser.js is present', function() {
      it('loads spec/support/jasmine-browser.js', function() {
        const result = loadConfig('spec/fixtures/loadConfig/both', {});
        expect(result.browser.name).toEqual(
          'the browser from jasmine-browser.js'
        );
      });
    });

    describe('and spec/support/jasmine-browser.js is absent', function() {
      it('loads spec/support/jasmine-browser.json', function() {
        const result = loadConfig('spec/fixtures/loadConfig/json', {});
        expect(result.browser.name).toEqual(
          'the browser from jasmine-browser.json'
        );
      });

      describe('and spec/support/jasmine-browser.json is also absent', function() {
        it('thorws an error', function() {
          expect(function() {
            loadConfig('spec/fixtures/loadConfig/none', {});
          }).toThrowError(
            /^Could not find configuration file.\nTried:\n\* .*spec\/fixtures\/loadConfig\/none\/spec\/support\/jasmine-browser.js\n\* .*spec\/fixtures\/loadConfig\/none\/spec\/support\/jasmine-browser.json/
          );
        });
      });
    });
  });
});
