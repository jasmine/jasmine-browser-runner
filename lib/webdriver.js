function buildWebdriver(browserInfo, webdriverBuilder) {
  const webdriver = require('selenium-webdriver'),
    Capability = webdriver.Capability;

  webdriverBuilder = webdriverBuilder || new webdriver.Builder();
  const remote = typeof browserInfo === 'object' && (browserInfo.useSauce || browserInfo.url);
  let browserName;

  if (typeof browserInfo === 'string') {
    browserName = browserInfo;
  } else if (browserInfo) {
    browserName = browserInfo.name || browserInfo.browserName;
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

  let url;
  let capabilities;
  if (browserInfo.url) {
    url = browserInfo.url;
    capabilities = {
      ...browserInfo,
      [Capability.BROWSER_NAME]: browserName,
    };
    delete capabilities.url;
  } else if (browserInfo.useSauce) {
    // handle legacy `sauce` object
    url = `http://${sauce.username}:${sauce.accessKey}@ondemand.saucelabs.com/wd/hub`;
    const sauce = browserInfo.sauce;
    capabilities = {
      [Capability.BROWSER_NAME]: browserName,
      build: sauce.build,
      tags: sauce.tags,
    };

    capabilities[Capability.PLATFORM_NAME] = sauce.os;
    capabilities[Capability.BROWSER_VERSION] = sauce.browserVersion;
    capabilities['sauce:options'] = {
      'tunnel-identifier': sauce.tunnelIdentifier,
    };
  } else {
    url = 'http://@localhost:4445/wd/hub';
  }

  return webdriverBuilder
    .withCapabilities(capabilities)
    .usingServer(url)
    .build();
}

module.exports = { buildWebdriver };
