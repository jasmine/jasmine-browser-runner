function buildWebdriver(browserInfo, webdriverBuilder) {
  const webdriver = require('selenium-webdriver'),
    Capability = webdriver.Capability;

  webdriverBuilder = webdriverBuilder || new webdriver.Builder();
  const useSauce = typeof browserInfo === 'object' && browserInfo.useSauce;
  let browserName;

  if (typeof browserInfo === 'string') {
    browserName = browserInfo;
  } else if (browserInfo) {
    browserName = browserInfo.name;
  }

  browserName = browserName || 'firefox';

  if (!useSauce) {
    return webdriverBuilder.forBrowser(browserName).build();
  }

  const sauce = browserInfo.sauce;
  const capabilities = {
    name: sauce.name,
    [Capability.BROWSER_NAME]: browserName,
    build: sauce.build,
    tags: sauce.tags,
    'tunnel-identifier': sauce.tunnelIdentifier,
  };

  if (sauceRequiresLegacyJWPProps(browserName, sauce.browserVersion)) {
    capabilities.platform = sauce.os;
    capabilities.version = sauce.browserVersion;
  } else {
    capabilities[Capability.PLATFORM_NAME] = sauce.os;
    capabilities[Capability.BROWSER_VERSION] = sauce.browserVersion;
  }

  return webdriverBuilder
    .withCapabilities(capabilities)
    .usingServer(
      browserInfo.useSauce
        ? `http://${sauce.username}:${sauce.accessKey}@ondemand.saucelabs.com/wd/hub`
        : 'http://@localhost:4445/wd/hub'
    )
    .build();
}

function sauceRequiresLegacyJWPProps(browserName, browserVersion) {
  // Saucelabs supports W3C capability property names for most browsers,
  // but requires legacy JWP property names for some older browsers.
  // See <https://wiki.saucelabs.com/display/DOCS/W3C+Capabilities+Support>.
  // Of the browsers that Jasmine supports, only Safari <12 need JWP names.
  return browserName === 'safari' && parseInt(browserVersion, 10) < 12;
}

module.exports = { buildWebdriver };
