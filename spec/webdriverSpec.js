const buildWebdriver = require('../lib/webdriver').buildWebdriver;
const Capability = require('selenium-webdriver').Capability;

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

      expect(builder.browserName).toEqual('IE');
    });

    describe('When browserInfo.name is undefined', function() {
      it('defaults to firefox', function() {
        const builder = new MockWebdriverBuilder();

        buildWebdriver({ useSauce: true, sauce: {} }, builder);

        expect(builder.browserName).toEqual('firefox');
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
  });
});

class MockWebdriverBuilder {
  withCapabilities(caps) {
    this.browserName = caps[Capability.BROWSER_NAME];
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
