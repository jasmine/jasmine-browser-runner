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
      it('prefers jasmine-browser.mjs over all others', async function() {
        const result = await loadConfig(
          'spec/fixtures/loadConfig/allThree',
          {}
        );
        expect(result.browser.name).toEqual(
          'the browser from jasmine-browser.mjs'
        );
      });

      it('prefers jasmine-browser.js over jasmine-browser.json', async function() {
        const result = await loadConfig(
          'spec/fixtures/loadConfig/jsAndJson',
          {}
        );
        expect(result.browser.name).toEqual(
          'the browser from jasmine-browser.js'
        );
      });

      it('loads jasmine-browser.json if it is the only config file', async function() {
        const result = await loadConfig('spec/fixtures/loadConfig/json', {});
        expect(result.browser.name).toEqual(
          'the browser from jasmine-browser.json'
        );
      });

      it('throws if no config file is found', async function() {
        await expectAsync(
          loadConfig('spec/fixtures/loadConfig/none', {})
        ).toBeRejectedWithError(
          /^Could not find configuration file.\r?\nTried:\r?\n\* .*spec[\\/]fixtures[\\/]loadConfig[\\/]none[\\/]spec[\\/]support[\\/]jasmine-browser.mjs\n\* .*spec[\\/]fixtures[\\/]loadConfig[\\/]none[\\/]spec[\\/]support[\\/]jasmine-browser.js\n\* .*spec[\\/]fixtures[\\/]loadConfig[\\/]none[\\/]spec[\\/]support[\\/]jasmine-browser.json/
        );
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
      const config = validConfig();
      delete config.specDir;

      expect(function() {
        validateConfig(config);
      }).toThrowError('Configuration is missing specDir');
    });

    it('throws if the specFiles property is not an array', function() {
      const config = validConfig();
      config.specFiles = 'just a string';

      expect(function() {
        validateConfig(config);
      }).toThrowError("Configuration's specFiles property is not an array");
    });

    it('throws if the srcDir property is missing', function() {
      const config = validConfig();
      delete config.srcDir;

      expect(function() {
        validateConfig(config);
      }).toThrowError('Configuration is missing srcDir');
    });

    it('throws if the srcFiles property is not an array', function() {
      const config = validConfig();
      config.srcFiles = 'just a string';

      expect(function() {
        validateConfig(config);
      }).toThrowError("Configuration's srcFiles property is not an array");
    });

    it('throws if the helpers property is not an array', function() {
      const config = validConfig();
      config.helpers = 'just a string';

      expect(function() {
        validateConfig(config);
      }).toThrowError("Configuration's helpers property is not an array");
    });

    describe('config.importMap', function() {
      it('throws if the importMap property is not an object', function() {
        const config = validConfig();
        config['importMap'] = 'just a string';

        expect(function() {
          validateConfig(config);
        }).toThrowError("Configuration's importMap property is not an object");
      });

      it('throws if the importMap property is set but has no imports or scopes', function() {
        const config = validConfig();
        config['importMap'] = {};

        expect(function() {
          validateConfig(config);
        }).toThrowError(
          "Configuration's importMap contains no imports or scopes"
        );
      });

      it('throws if the importMap.imports property is not an object', function() {
        const config = validConfig();
        config['importMap'] = {
          imports: 'just a string',
        };

        expect(function() {
          validateConfig(config);
        }).toThrowError(
          "Configuration's importMap.imports property is not an object"
        );
      });

      it('throws if the importMap.scopes property is not an object', function() {
        const config = validConfig();
        config['importMap'] = {
          scopes: 'just a string',
        };

        expect(function() {
          validateConfig(config);
        }).toThrowError(
          "Configuration's importMap.scopes property is not an object"
        );
      });

      it('throws if the importMap.imports is truthy but empty', function() {
        const config = validConfig();
        config['importMap'] = {
          imports: {},
        };

        expect(function() {
          validateConfig(config);
        }).toThrowError(
          "Configuration's importMap.imports map cannot be empty"
        );
      });

      it('throws if any importMap.scopes values are truthy but empty', function() {
        const config = validConfig();
        config['importMap'] = {
          scopes: {
            'some scope': {},
          },
        };

        expect(function() {
          validateConfig(config);
        }).toThrowError("Configuration's importMap.scopes map cannot be empty");
      });

      it('throws if any importMap.imports keys are empty strings', function() {
        const config = validConfig();
        config['importMap'] = {
          imports: {
            '': 'valid mapping value',
          },
        };

        expect(function() {
          validateConfig(config);
        }).toThrowError(
          "Configuration's importMap.imports map cannot contain empty string keys"
        );
      });

      it('throws if any importMap.scopes map keys are empty strings', function() {
        const config = validConfig();
        config['importMap'] = {
          scopes: {
            'valid scope': {
              '': 'valid mapping value',
            },
          },
        };

        expect(function() {
          validateConfig(config);
        }).toThrowError(
          "Configuration's importMap.scopes map cannot contain empty string keys"
        );
      });

      it('throws if any importMap.imports values are empty strings', function() {
        const config = validConfig();
        config['importMap'] = {
          imports: {
            'valid mapping key': '',
          },
        };

        expect(function() {
          validateConfig(config);
        }).toThrowError(
          "Configuration's importMap.imports map cannot contain empty string values"
        );
      });

      it('throws if any importMap.scopes map values are empty strings', function() {
        const config = validConfig();
        config['importMap'] = {
          scopes: {
            'valid scope': {
              'valid mapping key': '',
            },
          },
        };

        expect(function() {
          validateConfig(config);
        }).toThrowError(
          "Configuration's importMap.scopes map cannot contain empty string values"
        );
      });

      it('throws if any importMap.imports values are not strings', function() {
        const config = validConfig();
        config['importMap'] = {
          imports: {
            'valid mapping key': ['invalid', 'array', 'value'],
          },
        };

        expect(function() {
          validateConfig(config);
        }).toThrowError(
          "Configuration's importMap.imports map value is not a string"
        );
      });

      it('throws if any importMap.scopes map values are not strings', function() {
        const config = validConfig();
        config['importMap'] = {
          scopes: {
            'valid scope': {
              'valid mapping key': ['invalid', 'array', 'value'],
            },
          },
        };

        expect(function() {
          validateConfig(config);
        }).toThrowError(
          "Configuration's importMap.scopes map value is not a string"
        );
      });

      it('throws if the importMap.moduleRootDir starts with ../', function() {
        const config = validConfig();
        config['importMap'] = {
          moduleRootDir: '../some/upwards/path/traversal',
          imports: {
            'my-pkg': 'https://coolcdn/my-pkg/index.mjs',
          },
        };

        expect(function() {
          validateConfig(config);
        }).toThrowError(
          'Configuration.importMap.moduleRootDir cannot start with ../'
        );
      });

      it('throws if the importMap.moduleRootDir is empty string', function() {
        const config = validConfig();
        config['importMap'] = {
          moduleRootDir: '',
          imports: {
            'my-pkg': 'https://coolcdn/my-pkg/index.mjs',
          },
        };

        expect(function() {
          validateConfig(config);
        }).toThrowError(
          'Configuration.importMap.moduleRootDir cannot be an empty string'
        );
      });
    });
  });
});
