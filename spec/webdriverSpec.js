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

    describe('When browserInfo is an object without url', function() {
      it('uses browserInfo.browserName as the browser name', function() {
        const builder = new MockWebdriverBuilder();

        buildWebdriver({ browserName: 'IE' }, builder);

        expect(builder.browserName).toEqual('IE');
      });

      describe('When browserInfo.browserName is undefined', function() {
        it('defaults to firefox', function() {
          const builder = new MockWebdriverBuilder();

          buildWebdriver({}, builder);

          expect(builder.browserName).toEqual('firefox');
        });
      });

      it('does not use Sauce', function() {
        const builder = new MockWebdriverBuilder();

        buildWebdriver({ browserName: 'a browser name' }, builder);

        expect(builder.server).not.toMatch(/saucelabs/);
      });
    });
  });

  describe('When browserInfo is an object with url set to some value', function() {
    it('uses browserInfo.browserName as the browser name', function() {
      const builder = new MockWebdriverBuilder();

      buildWebdriver({
        url: 'https://ondemand.saucelabs.com/wd/hub',
        browserName: 'IE',
      }, builder);

      expect(builder.capabilities.browserName).toEqual('IE');
    });

    describe('When browserInfo.browserName is undefined', function() {
      it('defaults to firefox', function() {
        const builder = new MockWebdriverBuilder();

        buildWebdriver({
          url: 'https://ondemand.saucelabs.com/wd/hub',
        }, builder);

        expect(builder.capabilities.browserName).toEqual('firefox');
      });
    });

    it('uses Sauce', function() {
      const builder = new MockWebdriverBuilder();

      buildWebdriver(
        {
          url: 'https://ondemand.saucelabs.com/wd/hub',
          browserName: 'a browser name',
        },
        builder
      );

      expect(builder.server).toMatch(/saucelabs/);
    });

    it('uses W3C keys', function() {
      const builder = new MockWebdriverBuilder();
      function makeBrowser(name, version) {
        buildWebdriver(
          {
            url: 'https://ondemand.saucelabs.com/wd/hub',
            browserName: name,
            platformName: 'MULTICS',
            browserVersion: version,
            'sauce:options': {
              'tunnel-identifier': 'a tunnel id',
            },
          },
          builder
        );
      }

      makeBrowser('safari', '12');
      expect(builder.capabilities.platformName).toEqual('MULTICS');
      expect(builder.capabilities.browserVersion).toEqual('12');
      expect(builder.capabilities['sauce:options']).toEqual({
        'tunnel-identifier': 'a tunnel id',
      });
      expect(builder.capabilities.platform).toBeUndefined();
      expect(builder.capabilities.version).toBeUndefined();
      expect(builder.capabilities.tunnelIdentifier).toBeUndefined();

      makeBrowser('firefox', '68');
      expect(builder.capabilities.platformName).toEqual('MULTICS');
      expect(builder.capabilities.browserVersion).toEqual('68');
      expect(builder.capabilities['sauce:options']).toEqual({
        'tunnel-identifier': 'a tunnel id',
      });
      expect(builder.capabilities.platform).toBeUndefined();
      expect(builder.capabilities.version).toBeUndefined();
      expect(builder.capabilities.tunnelIdentifier).toBeUndefined();

      makeBrowser('firefox', '');
      expect(builder.capabilities.platformName).toEqual('MULTICS');
      expect(builder.capabilities.browserVersion).toEqual('');
      expect(builder.capabilities['sauce:options']).toEqual({
        'tunnel-identifier': 'a tunnel id',
      });
      expect(builder.capabilities.platform).toBeUndefined();
      expect(builder.capabilities.version).toBeUndefined();
      expect(builder.capabilities.tunnelIdentifier).toBeUndefined();

      makeBrowser('chrome', '');
      expect(builder.capabilities.platformName).toEqual('MULTICS');
      expect(builder.capabilities.browserVersion).toEqual('');
      expect(builder.capabilities['sauce:options']).toEqual({
        'tunnel-identifier': 'a tunnel id',
      });
      expect(builder.capabilities.platform).toBeUndefined();
      expect(builder.capabilities.version).toBeUndefined();
      expect(builder.capabilities.tunnelIdentifier).toBeUndefined();

      makeBrowser('microsoftEdge', '');
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
