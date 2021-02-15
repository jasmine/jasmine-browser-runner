function buildWebdriver(browserInfo, webdriverBuilder) {
  const webdriver = require('selenium-webdriver'),
    Capability = webdriver.Capability;

  webdriverBuilder = webdriverBuilder || new webdriver.Builder();

  if (typeof browserInfo === 'string' || !browserInfo.useSauce) {
    const browserName =
      typeof browserInfo === 'string' ? browserInfo : browserInfo.name;
    return webdriverBuilder.forBrowser(browserName).build();
  }

  const sauce = browserInfo.sauce;
  return webdriverBuilder
    .withCapabilities({
      name: sauce.name,
      [Capability.PLATFORM]: sauce.os,
      [Capability.BROWSER_NAME]: browserInfo.name,
      [Capability.VERSION]: sauce.browserVersion,
      build: sauce.build,
      tags: sauce.tags,
      'tunnel-identifier': sauce.tunnelIdentifier,
    })
    .usingServer(
      browserInfo.useSauce
        ? `http://${sauce.username}:${sauce.accessKey}@ondemand.saucelabs.com/wd/hub`
        : 'http://@localhost:4445/wd/hub'
    )
    .build();
}

module.exports = {buildWebdriver};