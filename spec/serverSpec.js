const path = require('path'),
  os = require('os'),
  http = require('http'),
  Server = require('../lib/server');

function getFile(url) {
  return new Promise(function(resolve, reject) {
    http
      .get(url, function(response) {
        if (response.statusCode !== 200) {
          reject(
            new Error(`${url} failed with status code ${response.statusCode}`)
          );
        }

        var rawData = '';
        response.on('data', function(chunk) {
          rawData += chunk;
        });
        response.on('end', function() {
          resolve(rawData);
        });
      })
      .on('error', reject);
  });
}

describe('server', function() {
  beforeEach(function() {
    this.fakeJasmine = {
      files: {
        path: path.resolve(__dirname, 'fixtures/fakeJasmine'),
        cssFiles: ['css.css', 'two.css'],
        jsFiles: ['jazz.js', 'min.js'],
        bootDir: path.resolve(__dirname, 'fixtures/fakeJasmine/boots'),
        bootFiles: ['bootboot.js', 'boot2.js'],
        imagesDir: path.resolve(__dirname, 'fixtures/images'),
      },
    };
  });

  it('looks in the current path by default', function() {
    const server = new Server({ jasmineCore: this.fakeJasmine });

    expect(server.projectBaseDir).toEqual(path.resolve());
  });

  it('appends specified css files after Jasmines own', function() {
    const server = new Server({
      projectBaseDir: path.resolve(__dirname, 'fixtures/sampleProject'),
      jasmineCore: this.fakeJasmine,
      srcDir: 'sources',
      cssFiles: ['other*.css', 'extra*.css'],
    });

    const files = server.allCss();
    expect(files.length).toEqual(5);
    expect(files.slice(0, 2)).toEqual([
      '/__jasmine__/css.css',
      '/__jasmine__/two.css',
    ]);
    expect(files.slice(2)).toEqual(
      jasmine.arrayWithExactContents([
        '/__src__/extra.css',
        '/__src__/other1.css',
        '/__src__/other2.css',
      ])
    );
  });

  it('allows css files to be excluded', function() {
    const server = new Server({
      projectBaseDir: path.resolve(__dirname, 'fixtures/sampleProject'),
      jasmineCore: this.fakeJasmine,
      srcDir: 'sources',
      cssFiles: ['other*.css', 'extra*.css', '!*1.css'],
    });

    const files = server.allCss();
    expect(files.length).toEqual(4);
    expect(files.slice(0, 2)).toEqual([
      '/__jasmine__/css.css',
      '/__jasmine__/two.css',
    ]);
    expect(files.slice(2)).toEqual(
      jasmine.arrayWithExactContents([
        '/__src__/extra.css',
        '/__src__/other2.css',
      ])
    );
  });

  it('handles css files not being specified', function() {
    const server = new Server({
      projectBaseDir: path.resolve(__dirname, 'fixtures/sampleProject'),
      jasmineCore: this.fakeJasmine,
      srcDir: 'sources',
    });

    const files = server.allCss();
    expect(files.length).toEqual(2);
    expect(files).toEqual(['/__jasmine__/css.css', '/__jasmine__/two.css']);
  });

  describe('#jasmineJs', function() {
    it('includes both core files and the ES module aware script loader', function() {
      const server = new Server({
        projectBaseDir: path.resolve(__dirname, 'fixtures/sampleProject'),
        jasmineCore: this.fakeJasmine,
        srcDir: 'sources',
        srcFiles: [],
        specDir: 'specs',
        helpers: [],
        specFiles: [],
      });

      const files = server.jasmineJs();
      expect(files.length).toEqual(5);
      expect(files).toEqual([
        '/__jasmine__/jazz.js',
        '/__jasmine__/min.js',
        '/__boot__/bootboot.js',
        '/__boot__/boot2.js',
        '/__support__/loadEsModule.js',
      ]);
    });
  });

  describe('#userJs', function() {
    it('includes source files followed by helpers, in glob order', function() {
      const server = new Server({
        projectBaseDir: path.resolve(__dirname, 'fixtures/sampleProject'),
        jasmineCore: this.fakeJasmine,
        srcDir: 'sources',
        srcFiles: ['thing2.js', '**/*.js'],
        specDir: 'specs',
        helpers: ['helpers/**/*.js'],
        specFiles: ['**/*[sS]pec.js'],
      });

      const files = server.userJs();
      expect(files.length).toEqual(8);
      expect(files.slice(0, 1)).toEqual(['/__src__/thing2.js']);
      expect(files.slice(1, 3)).toEqual(
        jasmine.arrayWithExactContents([
          '/__src__/thing1.js',
          '/__src__/nested/thing1.js',
        ])
      );
      expect(files.slice(3, 5)).toEqual(
        jasmine.arrayWithExactContents([
          '/__spec__/helpers/halp.js',
          '/__spec__/helpers/things/stuff.js',
        ])
      );
      expect(files.slice(5)).toEqual(
        jasmine.arrayWithExactContents([
          '/__spec__/iLikeSpec.js',
          '/__spec__/imAspec.js',
          '/__spec__/nested/specSpec.js',
        ])
      );
    });

    it('allows js files to be excluded', function() {
      const server = new Server({
        projectBaseDir: path.resolve(__dirname, 'fixtures/sampleProject'),
        jasmineCore: this.fakeJasmine,
        srcDir: 'sources',
        srcFiles: ['**/*.js', '!nested/**'],
        specDir: 'specs',
        helpers: ['helpers/**/*.js', '!helpers/things/**'],
        specFiles: ['**/*[sS]pec.js', '!nested/**'],
      });

      const files = server.userJs();
      expect(files.length).toEqual(5);
      expect(files.slice(0, 2)).toEqual(
        jasmine.arrayWithExactContents([
          '/__src__/thing1.js',
          '/__src__/thing2.js',
        ])
      );
      expect(files.slice(2, 3)).toEqual(
        jasmine.arrayWithExactContents(['/__spec__/helpers/halp.js'])
      );
      expect(files.slice(3)).toEqual(
        jasmine.arrayWithExactContents([
          '/__spec__/iLikeSpec.js',
          '/__spec__/imAspec.js',
        ])
      );
    });

    it('allows js files to be excluded via pattern and later included', function() {
      const server = new Server({
        projectBaseDir: path.resolve(__dirname, 'fixtures/excludeInclude'),
        jasmineCore: this.fakeJasmine,
        srcDir: 'sources',
        srcFiles: ['[^a].js', 'a.js'],
        specDir: 'specs',
      });

      const files = server.userJs();

      expect(files).toEqual(['/__src__/b.js', '/__src__/a.js']);
    });

    it('handles js files not being specified', function() {
      const server = new Server({
        projectBaseDir: path.resolve(__dirname, 'fixtures/sampleProject'),
        jasmineCore: this.fakeJasmine,
        srcDir: 'sources',
        specDir: 'specs',
      });

      const files = server.userJs();
      expect(files).toEqual([]);
    });
  });

  describe('starting the server', function() {
    beforeEach(function() {
      spyOn(console, 'log');
      this.startServer = async function(extraOptions) {
        const options = Object.assign(
          {
            projectBaseDir: path.resolve(__dirname, 'fixtures/sampleProject'),
            jasmineCore: this.fakeJasmine,
            srcDir: 'sources',
            cssFiles: ['other*.css', 'extra*.css'],
            srcFiles: ['thing2.js', '**/*.js'],
            specDir: 'specs',
            helpers: ['helpers/**/*.js'],
            specFiles: ['**/*[sS]pec.js'],
          },
          extraOptions
        );
        this.server = new Server(options);
        await this.server.start({ port: 0 });
      };
    });

    afterEach(async function() {
      await this.server.stop();
    });

    it('finds a random open port when a `0` is specified', async function() {
      await this.startServer();
      expect(this.server.port()).not.toEqual(0);
    });

    it('starts a server and serves the Jasmine files', async function() {
      await this.startServer();
      const baseUrl = `http://localhost:${this.server.port()}`;

      var jazz = await getFile(baseUrl + '/__jasmine__/jazz.js');
      expect(jazz).toEqual('Jazzy' + os.EOL);

      var min = await getFile(baseUrl + '/__jasmine__/min.js');
      expect(min).toEqual('minified' + os.EOL);

      var bootboot = await getFile(baseUrl + '/__boot__/bootboot.js');
      expect(bootboot).toEqual('booot' + os.EOL);

      var boot2 = await getFile(baseUrl + '/__boot__/boot2.js');
      expect(boot2).toEqual('Boot the second' + os.EOL);

      var css = await getFile(baseUrl + '/__jasmine__/css.css');
      expect(css).toEqual('CSS' + os.EOL);

      var two = await getFile(baseUrl + '/__jasmine__/two.css');
      expect(two).toEqual('two csses' + os.EOL);

      var image = await getFile(baseUrl + '/__images__/things.txt');
      expect(image).toEqual("pretend I'm an image" + os.EOL);
    });

    it('starts a server and serves the project files', async function() {
      await this.startServer();
      const baseUrl = `http://localhost:${this.server.port()}`;

      var thing1 = await getFile(baseUrl + '/__src__/thing1.js');
      expect(thing1).toEqual('thing the first' + os.EOL);

      var spec = await getFile(baseUrl + '/__spec__/iLikeSpec.js');
      expect(spec).toEqual('I like specs' + os.EOL);
    });

    it('serves an html file to run the specs', async function() {
      await this.startServer();
      const baseUrl = `http://localhost:${this.server.port()}`;

      var html = await getFile(baseUrl);
      expect(html).toContain('/__jasmine__/jazz.js');
      expect(html).toContain('/__jasmine__/min.js');
      expect(html).toContain('/__boot__/bootboot.js');
      expect(html).toContain('/__boot__/boot2.js');
      expect(html).toContain('/__jasmine__/css.css');
      expect(html).toContain('/__jasmine__/two.css');
      expect(html).toContain('/__src__/thing1.js');
      expect(html).toContain('/__src__/other1.css');
      expect(html).toContain('/__spec__/iLikeSpec.js');
    });

    it('includes the ES module loader', async function() {
      await this.startServer();
      const baseUrl = `http://localhost:${this.server.port()}`;

      var html = await getFile(baseUrl);
      expect(html).toContain('/__support__/loadEsModule.js');
    });

    describe('loading specs and helpers', function() {
      it('loads .js files as regular scripts', async function() {
        await this.startServer();
        const baseUrl = `http://localhost:${this.server.port()}`;

        var html = await getFile(baseUrl);
        expect(html).toContain(
          '<script src="/__spec__/helpers/halp.js" type="text/javascript">'
        );
        expect(html).toContain(
          '<script src="/__spec__/imAspec.js" type="text/javascript">'
        );
      });

      it('loads .mjs files as ES modules', async function() {
        await this.startServer({
          srcFiles: ['**/*.mjs'],
          helpers: ['helpers/**/*.mjs'],
          specFiles: ['**/*[sS]pec.mjs'],
        });
        const baseUrl = `http://localhost:${this.server.port()}`;

        var html = await getFile(baseUrl);
        expect(html).toContain(
          '<script type="module">_jasmine_loadEsModule(\'/__spec__/helpers/esm.mjs\')</script>'
        );
        expect(html).toContain(
          '<script type="module">_jasmine_loadEsModule(\'/__spec__/esmSpec.mjs\')</script>'
        );
      });
    });

    describe('loading sources', function() {
      it('loads .js files as regular scripts', async function() {
        await this.startServer();
        const baseUrl = `http://localhost:${this.server.port()}`;

        var html = await getFile(baseUrl);
        expect(html).toContain(
          '<script src="/__src__/thing1.js" type="text/javascript">'
        );
      });

      it('does not load .mjs files', async function() {
        // ES modules in sources will normally be imported by the specs
        // or by each other, so we don't load them automatically.
        await this.startServer({
          srcFiles: ['**/*.mjs'],
          helpers: ['helpers/**/*.mjs'],
          specFiles: ['**/*[sS]pec.mjs'],
        });
        const baseUrl = `http://localhost:${this.server.port()}`;

        var html = await getFile(baseUrl);
        expect(html).not.toContain('/__src__/esm.mjs');
      });
    });

    it('can clear default reporters', async function() {
      await this.startServer();
      this.server.clearReporters = true;

      const baseUrl = `http://localhost:${this.server.port()}`;

      var html = await getFile(baseUrl);
      expect(html).toContain('/__support__/clearReporters.js');
    });

    it('can add the batch reporter', async function() {
      await this.startServer({ batchReporter: true });

      const baseUrl = `http://localhost:${this.server.port()}`;

      var html = await getFile(baseUrl);
      expect(html).toContain('/__support__/batchReporter.js');
    });

    it('can add the json dom reporter', async function() {
      await this.startServer({ jsonDomReporter: true });

      const baseUrl = `http://localhost:${this.server.port()}`;

      var html = await getFile(baseUrl);
      expect(html).toContain('/__support__/jsonDomReporter.js');
    });
  });
});
