const { loadConfig, validateConfig } = require('../lib/config');

describe('config', function() {
  describe('loadConfig', function() {
    it('uses a specified config file', async function() {
      const result = await loadConfig('.', {
        config:
          'spec/fixtures/loadConfig/json/spec/support/jasmine-browser.json',
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
        /^Could not find configuration file.\r?\nTried:\r?\n\* .*no[/\\]such.json/gm
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
          it('throws an error', async function() {
            await expectAsync(
              loadConfig('spec/fixtures/loadConfig/none', {})
            ).toBeRejectedWithError(
              /^Could not find configuration file.\r?\nTried:\r?\n\* .*spec[\\/]fixtures[\\/]loadConfig[\\/]none[\\/]spec[\\/]support[\\/]jasmine-browser.js\n\* .*spec[\\/]fixtures[\\/]loadConfig[\\/]none[\\/]spec[\\/]support[\\/]jasmine-browser.json/
            );
          });
        });
      });
    });
  });

  describe('validateConfig', function() {
    function validConfig() {
      return {
        srcDir: 'src',
        srcFiles: ['**/*.?(m)js'],
        specDir: 'spec',
        specFiles: ['**/*[sS]pec.?(m)js'],
        helpers: ['helpers/**/*.?(m)js'],
        random: true,
        browser: {
          name: 'firefox',
        },
      };
    }

    it('accepts a valid configuration', function() {
      expect(function() {
        validateConfig(validConfig());
      }).not.toThrow();
    });

    it('throws if the specDir property is missing', function() {
      expect(function() {
        const config = validConfig();
        delete config.specDir;
        validateConfig(config);
      }).toThrowError('Configuration is missing specDir');
    });

    it('throws if the specFiles property is not an array', function() {
      expect(function() {
        const config = validConfig();
        config.specFiles = 'just a string';
        validateConfig(config);
      }).toThrowError("Configuration's specFiles property is not an array");
    });

    it('throws if the srcDir property is missing', function() {
      expect(function() {
        const config = validConfig();
        delete config.srcDir;
        validateConfig(config);
      }).toThrowError('Configuration is missing srcDir');
    });

    it('throws if the srcFiles property is not an array', function() {
      expect(function() {
        const config = validConfig();
        config.srcFiles = 'just a string';
        validateConfig(config);
      }).toThrowError("Configuration's srcFiles property is not an array");
    });

    it('throws if the helpers property is not an array', function() {
      expect(function() {
        const config = validConfig();
        config.helpers = 'just a string';
        validateConfig(config);
      }).toThrowError("Configuration's helpers property is not an array");
    });
  });
});
