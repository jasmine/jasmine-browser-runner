function buildWebdriver(browserInfo, webdriverBuilder) {
  const webdriver = require('selenium-webdriver');

  webdriverBuilder = webdriverBuilder || new webdriver.Builder();
  const remote = typeof browserInfo === 'object' && browserInfo.url;
  let browserName;

  if (typeof browserInfo === 'string') {
    browserName = browserInfo;
  } else if (browserInfo) {
    browserName = browserInfo.browserName;
  }

  browserName = browserName || 'firefox';

  if (!remote) {
    if (browserName === 'headlessChrome') {
      const caps = webdriver.Capabilities.chrome();
      caps.set('goog:chromeOptions', {
        args: [
          '--headless',
          '--no-sandbox',
          'window-size=1024,768',
          '--disable-gpu',
          '--disable-dev-shm-usage', // flag needed to avoid issues within docker https://stackoverflow.com/questions/56218242/headless-chromium-on-docker-fails
        ],
      });
      return webdriverBuilder
        .forBrowser('chrome')
        .withCapabilities(caps)
        .build();
    } else if (browserName === 'headlessFirefox') {
      const caps = webdriver.Capabilities.firefox();
      caps.set('moz:firefoxOptions', {
        args: ['--headless', '--width=1024', '--height=768'],
      });
      return webdriverBuilder
        .forBrowser('firefox')
        .withCapabilities(caps)
        .build();
    } else {
      return webdriverBuilder.forBrowser(browserName).build();
    }
  }

  const url = browserInfo.url;
  const capabilities = {...browserInfo, browserName};
  delete capabilities.url;

  return webdriverBuilder
    .withCapabilities(capabilities)
    .usingServer(url)
    .build();
}

module.exports = { buildWebdriver };
