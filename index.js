const ConsoleReporter = require('jasmine').ConsoleReporter,
  util = require('util'),
  Server = require('./lib/server'),
  Runner = require('./lib/runner');

module.exports = {
  startServer: function(options, serverOptions) {
    const server = new Server(options);
    return server.start(serverOptions || {});
  },
  runSpecs: async function(options, webdriver) {
    options.batchReporter = true;
    options.clearReporters = true;
    const server = new Server(options);

    const reporter = new ConsoleReporter();
    reporter.setOptions({
      print: function() {
        process.stdout.write(util.format.apply(this, arguments));
      },
      showColors: true,
    });

    const httpServer = await server.start({ port: 0 });
    const host = `http://localhost:${httpServer.address().port}`;
    const runner = new Runner({ webdriver, reporter, host });

    console.log('Running tests in the browser...');
    return runner
      .run()
      .catch(function(err) {
        console.log(err);
      })
      .then(async function(details) {
        await new Promise(function(resolve) {
          httpServer.close(function() {
            resolve();
          });
        });
        return details;
      });
  },
  Server,
  Runner,
};
