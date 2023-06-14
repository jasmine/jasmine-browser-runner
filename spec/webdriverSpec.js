const buildWebdriver = require('../lib/webdriver').buildWebdriver;

describe('webdriver', function() {
  describe('buildWebdriver', function() {
    describe('When browserInfo is a string', function() {
      it('uses the string as the browser name', function() {
        const builder = new MockWebdriverBuilder();

        buildWebdriver('IE', builder);

        expect(builder.browserName).toEqual('IE');
      });

      it('handles headlessChrome as a special case', function() {
        const builder = new MockWebdriverBuilder();

        buildWebdriver('headlessChrome', builder);

        expect(builder.browserName).toEqual('chrome');
        expect(builder.capabilities.get('goog:chromeOptions')).toEqual({
          args: [
            '--headless',
            '--no-sandbox',
            'window-size=1024,768',
            '--disable-gpu',
            '--disable-dev-shm-usage',
          ],
        });
      });

      it('handles headlessFirefox as a special case', function() {
        const builder = new MockWebdriverBuilder();

        buildWebdriver('headlessFirefox', builder);

        expect(builder.browserName).toEqual('firefox');
        expect(builder.capabilities.get('moz:firefoxOptions')).toEqual({
          args: ['--headless', '--width=1024', '--height=768'],
        });
      });

      it('does not use Sauce', function() {
        const builder = new MockWebdriverBuilder();

        buildWebdriver('a browser name', builder);

        expect(builder.server).not.toMatch(/saucelabs/);
      });
    });

    describe('When browserInfo is undefined', function() {
      it('defaults to firefox', function() {
        const builder = new MockWebdriverBuilder();

        buildWebdriver(undefined, builder);

        expect(builder.browserName).toEqual('firefox');
      });
    });

    describe('When browserInfo is an object with useRemoteSeleniumGrid set to true', function() {
      it('uses browserInfo.name as the browser name', function() {
        const builder = new MockWebdriverBuilder();

        buildWebdriver({ name: 'IE', useRemoteSeleniumGrid: true }, builder);

        expect(builder.capabilities.browserName).toEqual('IE');
      });

      describe('When browserInfo.name is undefined', function() {
        it('defaults to firefox', function() {
          const builder = new MockWebdriverBuilder();

          buildWebdriver(
            { useRemoteSeleniumGrid: true, remoteSeleniumGrid: {} },
            builder
          );

          expect(builder.capabilities.browserName).toEqual('firefox');
        });
      });

      it('does not use Sauce', function() {
        const builder = new MockWebdriverBuilder();

        buildWebdriver(
          {
            name: 'a browser name',
            useRemoteSeleniumGrid: true,
            remoteSeleniumGrid: {
              url: 'a url to use',
            },
          },
          builder
        );

        expect(builder.server).toMatch(/(a url to use)/);
      });

      it('will use localhost grid hub url if no url specified', function() {
        const builder = new MockWebdriverBuilder();

        buildWebdriver(
          {
            name: 'a browser name',
            useRemoteSeleniumGrid: true,
            remoteSeleniumGrid: {
              'sauce:options': {
                username: 'a user',
                accessKey: 'a key',
              },
            },
          },
          builder
        );

        expect(builder.server).toEqual('http://localhost:4445/wd/hub');
      });

      it('can also use Saucelabs', function() {
        const builder = new MockWebdriverBuilder();

        buildWebdriver(
          {
            name: 'a browser name',
            useRemoteSeleniumGrid: true,
            remoteSeleniumGrid: {
              url: 'https://ondemand.saucelabs.com/wd/hub',
            },
          },
          builder
        );

        expect(builder.server).toMatch(/saucelabs/);
      });
    });
  });

  describe('When browserInfo is an object with useSauce set to true', function() {
    it('uses browserInfo.name as the browser name', function() {
      const builder = new MockWebdriverBuilder();

      buildWebdriver({ useSauce: true, sauce: {}, name: 'IE' }, builder);

      expect(builder.capabilities.browserName).toEqual('IE');
    });

    it('uses browserInfo.name as the browser name', function() {
      const builder = new MockWebdriverBuilder();

      buildWebdriver({ useSauce: true, name: 'IE' }, builder);

      expect(builder.capabilities.browserName).toEqual('IE');
    });

    describe('When browserInfo.name is undefined', function() {
      it('defaults to firefox', function() {
        const builder = new MockWebdriverBuilder();

        buildWebdriver({ useSauce: true, sauce: {} }, builder);

        expect(builder.capabilities.browserName).toEqual('firefox');
      });
    });

    describe('When browserInfo.name is undefined', function() {
      it('defaults to firefox', function() {
        const builder = new MockWebdriverBuilder();

        buildWebdriver({ useSauce: true }, builder);

        expect(builder.capabilities.browserName).toEqual('firefox');
      });
    });

    it('uses Sauce', function() {
      const builder = new MockWebdriverBuilder();

      buildWebdriver(
        { useSauce: true, sauce: {}, name: 'a browser name' },
        builder
      );

      expect(builder.server).toMatch(/saucelabs/);
    });

    const configMode = [
      {
        mode: makeBrowser,
        description: 'config format containing remoteSeleniumGrid object',
      },
      {
        mode: makeLegacyModeBrowser,
        description: 'config format containing sauce object',
      },
    ];
    configMode.forEach(modeObj => {
      it(`uses W3C keys when using ${modeObj.description}`, function() {
        const builder = new MockWebdriverBuilder();

        modeObj.mode('safari', '12', builder);
        expect(builder.capabilities.platformName).toEqual('MULTICS');
        expect(builder.capabilities.browserVersion).toEqual('12');
        expect(builder.capabilities['sauce:options']).toEqual({
          'tunnel-identifier': 'a tunnel id',
        });
        expect(builder.capabilities.platform).toBeUndefined();
        expect(builder.capabilities.version).toBeUndefined();
        expect(builder.capabilities.tunnelIdentifier).toBeUndefined();

        modeObj.mode('firefox', '68', builder);
        expect(builder.capabilities.platformName).toEqual('MULTICS');
        expect(builder.capabilities.browserVersion).toEqual('68');
        expect(builder.capabilities['sauce:options']).toEqual({
          'tunnel-identifier': 'a tunnel id',
        });
        expect(builder.capabilities.platform).toBeUndefined();
        expect(builder.capabilities.version).toBeUndefined();
        expect(builder.capabilities.tunnelIdentifier).toBeUndefined();

        modeObj.mode('firefox', '', builder);
        expect(builder.capabilities.platformName).toEqual('MULTICS');
        expect(builder.capabilities.browserVersion).toEqual('');
        expect(builder.capabilities['sauce:options']).toEqual({
          'tunnel-identifier': 'a tunnel id',
        });
        expect(builder.capabilities.platform).toBeUndefined();
        expect(builder.capabilities.version).toBeUndefined();
        expect(builder.capabilities.tunnelIdentifier).toBeUndefined();

        modeObj.mode('chrome', '', builder);
        expect(builder.capabilities.platformName).toEqual('MULTICS');
        expect(builder.capabilities.browserVersion).toEqual('');
        expect(builder.capabilities['sauce:options']).toEqual({
          'tunnel-identifier': 'a tunnel id',
        });
        expect(builder.capabilities.platform).toBeUndefined();
        expect(builder.capabilities.version).toBeUndefined();
        expect(builder.capabilities.tunnelIdentifier).toBeUndefined();

        modeObj.mode('microsoftEdge', '', builder);
        expect(builder.capabilities.platformName).toEqual('MULTICS');
        expect(builder.capabilities.browserVersion).toEqual('');
        expect(builder.capabilities['sauce:options']).toEqual({
          'tunnel-identifier': 'a tunnel id',
        });
        expect(builder.capabilities.platform).toBeUndefined();
        expect(builder.capabilities.version).toBeUndefined();
        expect(builder.capabilities.tunnelIdentifier).toBeUndefined();
      });
    });

    function makeBrowser(name, version, builder) {
      buildWebdriver(
        {
          name: name,
          useRemoteSeleniumGrid: true,
          remoteSeleniumGrid: {
            url: 'https://ondemand.saucelabs.com/wd/hub',
            platformName: 'MULTICS',
            browserVersion: version,
            'sauce:options': {
              'tunnel-identifier': 'a tunnel id',
            },
          },
        },
        builder
      );
    }

    function makeLegacyModeBrowser(name, version, builder) {
      buildWebdriver(
        {
          useSauce: true,
          name: name,
          sauce: {
            os: 'MULTICS',
            browserVersion: version,
            tunnelIdentifier: 'a tunnel id',
          },
        },
        builder
      );
    }
  });
});

class MockWebdriverBuilder {
  withCapabilities(caps) {
    this.capabilities = caps;
    return this;
  }

  forBrowser(browser) {
    this.browserName = browser;
    return this;
  }

  usingServer(server) {
    this.server = server;
    return this;
  }

  build() {}
}
