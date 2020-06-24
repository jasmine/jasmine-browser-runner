const ConsoleReporter = require('jasmine').ConsoleReporter,
  util = require('util'),
  Server = require('./lib/server'),
  Runner = require('./lib/runner');

function buildWebdriver(browserInfo) {
  const webdriver = require('selenium-webdriver'),
    Capability = webdriver.Capability;

  if (typeof browserInfo === 'string' || !browserInfo.useSauce) {
    const browserName =
      typeof browserInfo === 'string' ? browserInfo : browserInfo.name;
    return new webdriver.Builder().forBrowser(browserName).build();
  }

  const sauce = browserInfo.sauce;
  return new webdriver.Builder()
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

function createReporter(options) {
  if (options.reporter) {
    try {
      var Report = require(options.reporter);
      return new Report();
    } catch (e) {
      console.log(
        'failed to register reporter "' + options.reporter + '" using default'
      );
      console.log(e.message);
      console.log(e.stack);
    }
  }

  const reporter = new ConsoleReporter();
  reporter.setOptions({
    print: function() {
      process.stdout.write(util.format.apply(this, arguments));
    },
    showColors: options.color === 'undefined' ? true : options.color,
  });
  return reporter;
}

module.exports = {
  startServer: function(options, serverOptions) {
    const server = new Server(options);
    return server.start(serverOptions || {});
  },
  runSpecs: async function(options) {
    options.batchReporter = true;
    const server = new Server(options);
    const webdriver = buildWebdriver(options.browser);

    const reporter = createReporter(options);
    const portRequest = options.browser.useSauce ? 5555 : 0;
    const httpServer = await server.start({ port: portRequest });
    const host = `http://localhost:${httpServer.address().port}`;
    const runner = new Runner({ webdriver, reporter, host });

    console.log('Running tests in the browser...');
    return runner
      .run(options)
      .catch(function(err) {
        console.error(err);
      })
      .then(async function(details) {
        process.exitCode =
          details && details.overallStatus === 'passed' ? 0 : 1;
        await new Promise(function(resolve) {
          httpServer.close(function() {
            resolve();
          });
        });

        if (options.browser.useSauce) {
          await webdriver.executeScript(
            `sauce:job-result=${process.exitCode === 0}`
          );
        }

        await webdriver.close();
        return details;
      });
  },
  Server,
  Runner,
};
