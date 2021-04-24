const ConsoleReporter = require('jasmine').ConsoleReporter,
  webdriverModule = require('./lib/webdriver'),
  util = require('util'),
  Server = require('./lib/server'),
  Runner = require('./lib/runner');

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
  runSpecs: async function(options, deps) {
    options = options || {};
    if (options.browser && options.browser.name === 'internet explorer') {
      options.jsonDomReporter = true;
    } else {
      options.batchReporter = true;
    }

    deps = deps || {};
    const ServerClass = deps.Server || Server;
    const RunnerClass = deps.Runner || Runner;
    const buildWebdriver =
      deps.buildWebdriver || webdriverModule.buildWebdriver;
    const setExitCode = deps.setExitCode || (code => (process.exitCode = code));
    const server = new ServerClass(options);
    const webdriver = buildWebdriver(options.browser);

    const reporter = createReporter(options);
    const useSauce = options.browser && options.browser.useSauce;
    const portRequest = useSauce ? 5555 : 0;
    await server.start({ port: portRequest });
    const host = `http://localhost:${server.port()}`;
    const runner = new RunnerClass({ webdriver, reporter, host });

    console.log('Running tests in the browser...');

    try {
      const details = await runner.run(options);

      if (details.overallStatus === 'passed') {
        setExitCode(0);
      } else if (details.overallStatus === 'incomplete') {
        setExitCode(2);
      } else {
        setExitCode(1);
      }

      return details;
    } finally {
      await server.stop();

      if (useSauce) {
        await webdriver.executeScript(
          `sauce:job-result=${process.exitCode === 0}`
        );
      }

      await webdriver.close();
    }
  },
  Server,
  Runner,
};
