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
            '--headless=new',
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
