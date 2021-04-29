var express = require('express'),
  fg = require('fast-glob'),
  ejs = require('ejs'),
  path = require('path'),
  fs = require('fs');

class Server {
  constructor(options) {
    this.options = options;
    this.clearReporters = options.clearReporters || false;
    this.batchReporter = options.batchReporter || false;
    this.jsonDomReporter = options.jsonDomReporter || false;
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

  async allCss() {
    var urls = await this.getUrls(
      this.options.srcDir,
      this.options.cssFiles,
      '/__src__'
    );
    return this.jasmineCssFiles.concat(urls);
  }

  getUrls(baseDir, globs, urlRoot) {
    return fg(globs || [], {
      cwd: path.join(this.projectBaseDir, baseDir),
      transform: function(p) {
        return path.join(urlRoot, p);
      },
    });
  }

  getSupportFiles() {
    var result = ['/__support__/loadEsModule.js'];
    if (this.clearReporters) {
      result.push('/__support__/clearReporters.js');
    }

    if (this.batchReporter) {
      result.push('/__support__/batchReporter.js');
    }

    if (this.jsonDomReporter) {
      result.push('/__support__/jsonDomReporter.js');
    }

    return result;
  }

  jasmineJs() {
    return this.jasmineJsFiles.concat(this.getSupportFiles());
  }

  async userJs() {
    var $srcUrls = this.getUrls(
      this.options.srcDir,
      this.options.srcFiles,
      '/__src__'
    ).then(function(srcUrls) {
      return srcUrls.filter(function(url) {
        // Exclude ES modules. These will be loaded by other ES modules.
        return !url.endsWith('.mjs');
      });
    });
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
    return [].concat(urls[0], urls[1], urls[2]);
  }

  /**
   * Starts the server.
   * @param serverOptions
   * @return A promise that resolves upon successful start.
   */
  start(serverOptions) {
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
      Promise.all([self.userJs(), self.allCss()])
        .then(function([userJs, allCss]) {
          res.send(
            template({
              cssFiles: allCss,
              jasmineJsFiles: self.jasmineJs(),
              userJsFiles: userJs,
            })
          );
        })
        .catch(function(error) {
          res.status(500).send('An error occurred');
          console.error(error);
        });
    });

    var port = findPort(serverOptions.port, this.options.port);
    return new Promise(resolve => {
      this._httpServer = app.listen(port, () => {
        const runningPort = this._httpServer.address().port;
        console.log(
          `Jasmine server is running here: http://localhost:${runningPort}`
        );
        console.log(
          `Jasmine tests are here:         ${path.resolve(
            self.options.specDir
          )}`
        );
        console.log(
          `Source files are here:          ${path.resolve(self.options.srcDir)}`
        );
        resolve();
      });
    });
  }

  /**
   * Stops the server.
   * @return {Promise<undefined>}
   */
  stop() {
    if (!this._httpServer) {
      throw new Error("Can't stop a server that was never started");
    }

    return new Promise(resolve => {
      this._httpServer.close(resolve);
    });
  }

  port() {
    if (!this._httpServer) {
      throw new Error("Can't determine port before the server is started");
    }

    return this._httpServer.address().port;
  }
}

function findPort(serverPort, optionsPort) {
  if (typeof serverPort !== 'undefined') {
    return serverPort;
  }

  if (typeof optionsPort !== 'undefined') {
    return optionsPort;
  }

  return 8888;
}

module.exports = Server;
