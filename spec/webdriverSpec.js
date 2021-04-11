const buildWebdriver = require('../lib/webdriver').buildWebdriver;

describe('webdriver', function() {
  describe('buildWebdriver', function() {
    describe('When browserInfo is a string', function() {
      it('uses the string as the browser name', function() {
        const builder = new MockWebdriverBuilder();

        buildWebdriver('IE', builder);

        expect(builder.browserName).toEqual('IE');
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

    describe('When browserInfo is an object without useSauce=true', function() {
      it('uses browserInfo.name as the browser name', function() {
        const builder = new MockWebdriverBuilder();

        buildWebdriver({ name: 'IE' }, builder);

        expect(builder.browserName).toEqual('IE');
      });

      describe('When browserInfo.name is undefined', function() {
        it('defaults to firefox', function() {
          const builder = new MockWebdriverBuilder();

          buildWebdriver({}, builder);

          expect(builder.browserName).toEqual('firefox');
        });
      });

      it('does not use Sauce', function() {
        const builder = new MockWebdriverBuilder();

        buildWebdriver({ name: 'a browser name' }, builder);

        expect(builder.server).not.toMatch(/saucelabs/);
      });
    });
  });

  describe('When browserInfo is an object with useSauce=true', function() {
    it('uses browserInfo.name as the browser name', function() {
      const builder = new MockWebdriverBuilder();

      buildWebdriver({ useSauce: true, sauce: {}, name: 'IE' }, builder);

      expect(builder.capabilities.browserName).toEqual('IE');
    });

    describe('When browserInfo.name is undefined', function() {
      it('defaults to firefox', function() {
        const builder = new MockWebdriverBuilder();

        buildWebdriver({ useSauce: true, sauce: {} }, builder);

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

    it('uses JWP keys for old Safari versions, as required by Saucelabs', function() {
      const builder = new MockWebdriverBuilder();
      function makeSafari(version) {
        buildWebdriver(
          {
            useSauce: true,
            name: 'safari',
            sauce: { os: 'OS X someversion', browserVersion: version },
          },
          builder
        );
      }

      makeSafari('11');
      expect(builder.capabilities.platform).toEqual('OS X someversion');
      expect(builder.capabilities.version).toEqual('11');
      expect(builder.capabilities.platformName).toBeUndefined();
      expect(builder.capabilities.browserVersion).toBeUndefined();

      makeSafari('10');
      expect(builder.capabilities.platform).toEqual('OS X someversion');
      expect(builder.capabilities.version).toEqual('10');
      expect(builder.capabilities.platformName).toBeUndefined();
      expect(builder.capabilities.browserVersion).toBeUndefined();

      makeSafari('9');
      expect(builder.capabilities.platform).toEqual('OS X someversion');
      expect(builder.capabilities.version).toEqual('9');
      expect(builder.capabilities.platformName).toBeUndefined();
      expect(builder.capabilities.browserVersion).toBeUndefined();

      makeSafari('8');
      expect(builder.capabilities.platform).toEqual('OS X someversion');
      expect(builder.capabilities.version).toEqual('8');
      expect(builder.capabilities.platformName).toBeUndefined();
      expect(builder.capabilities.browserVersion).toBeUndefined();
    });

    it('uses W3C keys for everything except old Safari versions', function() {
      const builder = new MockWebdriverBuilder();
      function makeBrowser(name, version) {
        buildWebdriver(
          {
            useSauce: true,
            name: name,
            sauce: { os: 'MULTICS', browserVersion: version },
          },
          builder
        );
      }

      makeBrowser('safari', '12');
      expect(builder.capabilities.platformName).toEqual('MULTICS');
      expect(builder.capabilities.browserVersion).toEqual('12');
      expect(builder.capabilities.platform).toBeUndefined();
      expect(builder.capabilities.version).toBeUndefined();

      makeBrowser('firefox', '68');
      expect(builder.capabilities.platformName).toEqual('MULTICS');
      expect(builder.capabilities.browserVersion).toEqual('68');
      expect(builder.capabilities.platform).toBeUndefined();
      expect(builder.capabilities.version).toBeUndefined();

      makeBrowser('firefox', '');
      expect(builder.capabilities.platformName).toEqual('MULTICS');
      expect(builder.capabilities.browserVersion).toEqual('');
      expect(builder.capabilities.platform).toBeUndefined();
      expect(builder.capabilities.version).toBeUndefined();

      makeBrowser('chrome', '');
      expect(builder.capabilities.platformName).toEqual('MULTICS');
      expect(builder.capabilities.browserVersion).toEqual('');
      expect(builder.capabilities.platform).toBeUndefined();
      expect(builder.capabilities.version).toBeUndefined();

      makeBrowser('microsoftEdge', '');
      expect(builder.capabilities.platformName).toEqual('MULTICS');
      expect(builder.capabilities.browserVersion).toEqual('');
      expect(builder.capabilities.platform).toBeUndefined();
      expect(builder.capabilities.version).toBeUndefined();

      makeBrowser('internet explorer', '10');
      expect(builder.capabilities.platformName).toEqual('MULTICS');
      expect(builder.capabilities.browserVersion).toEqual('10');
      expect(builder.capabilities.platform).toBeUndefined();
      expect(builder.capabilities.version).toBeUndefined();
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
