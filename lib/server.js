var express = require('express'),
  fg = require('fast-glob'),
  ejs = require('ejs'),
  path = require('path'),
  fs = require('fs');

function Server(options) {
  this.options = options;
  this.clearReporters = options.clearReporters || false;
  this.batchReporter = options.batchReporter || false;
  this.projectBaseDir = options.projectBaseDir || path.resolve();
  this.jasmineCore = options.jasmineCore || require('jasmine-core');
  this.jasmineCssFiles = this.jasmineCore.files.cssFiles.map(function(
    fileName
  ) {
    return path.join('/__jasmine__', fileName);
  });
  this.jasmineJsFiles = this.jasmineCore.files.jsFiles
    .map(function(fileName) {
      return path.join('/__jasmine__', fileName);
    })
    .concat(
      this.jasmineCore.files.bootFiles.map(function(fileName) {
        return path.join('/__boot__', fileName);
      })
    );
}

Server.prototype.allCss = async function() {
  var urls = await this.getUrls(
    this.options.srcDir,
    this.options.cssFiles,
    '/__src__'
  );
  return this.jasmineCssFiles.concat(urls);
};

Server.prototype.getUrls = function getUrls(baseDir, globs, urlRoot) {
  return fg(globs || [], {
    cwd: path.join(this.projectBaseDir, baseDir),
    transform: function(p) {
      return path.join(urlRoot, p);
    },
  });
};

Server.prototype.getSupportFiles = function() {
  var result = [];
  if (this.clearReporters) {
    result.push('/__support__/clearReporters.js');
  }

  if (this.batchReporter) {
    result.push('/__support__/batchReporter.js');
  }

  if (this.isIe_()) {
    // This makes things significantly slower, so don't do it
    // unless we need it.
    result.push('/__support__/ieCompat.js');
  }

  return result;
};

Server.prototype.isIe_ = function() {
  return (
    this.options.browser && this.options.browser.name === 'internet explorer'
  );
};

Server.prototype.allJs = async function() {
  var $srcUrls = this.getUrls(
    this.options.srcDir,
    this.options.srcFiles,
    '/__src__'
  );
  var $helperUrls = this.getUrls(
    this.options.specDir,
    this.options.helpers,
    '/__spec__'
  );
  var $specUrls = this.getUrls(
    this.options.specDir,
    this.options.specFiles,
    '/__spec__'
  );
  var urls = await Promise.all([$srcUrls, $helperUrls, $specUrls]);
  var supportFiles = this.getSupportFiles();
  return this.jasmineJsFiles.concat(supportFiles, urls[0], urls[1], urls[2]);
};

function findPort(serverPort, optionsPort) {
  if (typeof serverPort !== 'undefined') {
    return serverPort;
  }

  if (typeof optionsPort !== 'undefined') {
    return optionsPort;
  }

  return 8888;
}

Server.prototype.start = function(serverOptions) {
  serverOptions = serverOptions || {};
  var app = express();

  app.use('/__jasmine__', express.static(this.jasmineCore.files.path));
  app.use('/__boot__', express.static(this.jasmineCore.files.bootDir));
  app.use('/__images__', express.static(this.jasmineCore.files.imagesDir));
  app.use('/__support__', express.static(path.join(__dirname, 'support')));
  app.use(
    '/__spec__',
    express.static(path.join(this.projectBaseDir, this.options.specDir))
  );
  app.use(
    '/__src__',
    express.static(path.join(this.projectBaseDir, this.options.srcDir))
  );

  var template = ejs.compile(
    fs.readFileSync(path.resolve(__dirname, '../run.html.ejs')).toString()
  );

  var self = this;
  app.get('/', function(req, res) {
    Promise.all([self.allJs(), self.allCss()]).then(
      function([allJs, allCss]) {
        res.send(
          template({
            cssFiles: allCss,
            jsFiles: allJs,
          })
        );
      },
      function() {
        res.status(500).send('An error occurred');
      }
    );
  });

  var port = findPort(serverOptions.port, this.options.port);
  return new Promise(function(resolve) {
    var httpServer = app.listen(port, function() {
      const runningPort = httpServer.address().port;
      console.log(
        `Jasmine server is running here: http://localhost:${runningPort}`
      );
      console.log(
        `Jasmine tests are here:         ${path.resolve(self.options.specDir)}`
      );
      console.log(
        `Source files are here:          ${path.resolve(self.options.srcDir)}`
      );
    });
    resolve(httpServer);
  });
};

module.exports = Server;
