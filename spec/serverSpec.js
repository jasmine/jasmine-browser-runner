const path = require('path'),
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

  it('appends specified css files after Jasmines own', async function() {
    const server = new Server({
      projectBaseDir: path.resolve(__dirname, 'fixtures/sampleProject'),
      jasmineCore: this.fakeJasmine,
      srcDir: 'sources',
      cssFiles: ['other*.css', 'extra*.css'],
    });

    const files = await server.allCss();
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

  it('allows css files to be excluded', async function() {
    const server = new Server({
      projectBaseDir: path.resolve(__dirname, 'fixtures/sampleProject'),
      jasmineCore: this.fakeJasmine,
      srcDir: 'sources',
      cssFiles: ['other*.css', 'extra*.css', '!*1.css'],
    });

    const files = await server.allCss();
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

  it('handles css files not being specified', async function() {
    const server = new Server({
      projectBaseDir: path.resolve(__dirname, 'fixtures/sampleProject'),
      jasmineCore: this.fakeJasmine,
      srcDir: 'sources',
    });

    const files = await server.allCss();
    expect(files.length).toEqual(2);
    expect(files).toEqual(['/__jasmine__/css.css', '/__jasmine__/two.css']);
  });

  it('appends specified js files after Jasmines own', async function() {
    const server = new Server({
      projectBaseDir: path.resolve(__dirname, 'fixtures/sampleProject'),
      jasmineCore: this.fakeJasmine,
      srcDir: 'sources',
      srcFiles: ['thing2.js', '**/*.js'],
      specDir: 'specs',
      helpers: ['helpers/**/*.js'],
      specFiles: ['**/*[sS]pec.js'],
    });

    const files = await server.allJs();
    expect(files.length).toEqual(12);
    expect(files.slice(0, 5)).toEqual([
      '/__jasmine__/jazz.js',
      '/__jasmine__/min.js',
      '/__boot__/bootboot.js',
      '/__boot__/boot2.js',
      '/__src__/thing2.js',
    ]);
    expect(files.slice(5, 7)).toEqual(
      jasmine.arrayWithExactContents([
        '/__src__/thing1.js',
        '/__src__/nested/thing1.js',
      ])
    );
    expect(files.slice(7, 9)).toEqual(
      jasmine.arrayWithExactContents([
        '/__spec__/helpers/halp.js',
        '/__spec__/helpers/things/stuff.js',
      ])
    );
    expect(files.slice(9)).toEqual(
      jasmine.arrayWithExactContents([
        '/__spec__/iLikeSpec.js',
        '/__spec__/imAspec.js',
        '/__spec__/nested/specSpec.js',
      ])
    );
  });

  it('allows js files to be excluded', async function() {
    const server = new Server({
      projectBaseDir: path.resolve(__dirname, 'fixtures/sampleProject'),
      jasmineCore: this.fakeJasmine,
      srcDir: 'sources',
      srcFiles: ['**/*.js', '!nested/**'],
      specDir: 'specs',
      helpers: ['helpers/**/*.js', '!helpers/things/**'],
      specFiles: ['**/*[sS]pec.js', '!nested/**'],
    });

    const files = await server.allJs();
    expect(files.length).toEqual(9);
    expect(files.slice(0, 4)).toEqual([
      '/__jasmine__/jazz.js',
      '/__jasmine__/min.js',
      '/__boot__/bootboot.js',
      '/__boot__/boot2.js',
    ]);
    expect(files.slice(4, 6)).toEqual(
      jasmine.arrayWithExactContents([
        '/__src__/thing1.js',
        '/__src__/thing2.js',
      ])
    );
    expect(files.slice(6, 7)).toEqual(
      jasmine.arrayWithExactContents(['/__spec__/helpers/halp.js'])
    );
    expect(files.slice(7)).toEqual(
      jasmine.arrayWithExactContents([
        '/__spec__/iLikeSpec.js',
        '/__spec__/imAspec.js',
      ])
    );
  });

  it('handles js files not being specified', async function() {
    const server = new Server({
      projectBaseDir: path.resolve(__dirname, 'fixtures/sampleProject'),
      jasmineCore: this.fakeJasmine,
      srcDir: 'sources',
      specDir: 'specs',
    });

    const files = await server.allJs();
    expect(files.length).toEqual(4);
    expect(files).toEqual([
      '/__jasmine__/jazz.js',
      '/__jasmine__/min.js',
      '/__boot__/bootboot.js',
      '/__boot__/boot2.js',
    ]);
  });

  describe('starting the server', function() {
    beforeEach(async function() {
      this.server = new Server({
        projectBaseDir: path.resolve(__dirname, 'fixtures/sampleProject'),
        jasmineCore: this.fakeJasmine,
        srcDir: 'sources',
        cssFiles: ['other*.css', 'extra*.css'],
        srcFiles: ['thing2.js', '**/*.js'],
        specDir: 'specs',
        helpers: ['helpers/**/*.js'],
        specFiles: ['**/*[sS]pec.js'],
      });
      spyOn(console, 'log');
      this.httpServer = await this.server.start({ port: 0 });
    });

    afterEach(function(done) {
      this.httpServer.close(done);
    });

    it('finds a random open port when a `0` is specified', function() {
      expect(this.httpServer.address().port).not.toEqual(0);
    });

    it('starts a server and serves the Jasmine files', async function() {
      const baseUrl = `http://localhost:${this.httpServer.address().port}`;

      var jazz = await getFile(baseUrl + '/__jasmine__/jazz.js');
      expect(jazz).toEqual('Jazzy\n');

      var min = await getFile(baseUrl + '/__jasmine__/min.js');
      expect(min).toEqual('minified\n');

      var bootboot = await getFile(baseUrl + '/__boot__/bootboot.js');
      expect(bootboot).toEqual('booot\n');

      var boot2 = await getFile(baseUrl + '/__boot__/boot2.js');
      expect(boot2).toEqual('Boot the second\n');

      var css = await getFile(baseUrl + '/__jasmine__/css.css');
      expect(css).toEqual('CSS\n');

      var two = await getFile(baseUrl + '/__jasmine__/two.css');
      expect(two).toEqual('two csses\n');

      var image = await getFile(baseUrl + '/__images__/things.txt');
      expect(image).toEqual("pretend I'm an image\n");
    });

    it('starts a server and serves the project files', async function() {
      const baseUrl = `http://localhost:${this.httpServer.address().port}`;

      var thing1 = await getFile(baseUrl + '/__src__/thing1.js');
      expect(thing1).toEqual('thing the first\n');

      var spec = await getFile(baseUrl + '/__spec__/iLikeSpec.js');
      expect(spec).toEqual('I like specs\n');
    });

    it('serves an html file to run the specs', async function() {
      const baseUrl = `http://localhost:${this.httpServer.address().port}`;

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
      expect(html).not.toContain('/__support__');
    });

    it('can clear default reporters', async function() {
      this.server.clearReporters = true;

      const baseUrl = `http://localhost:${this.httpServer.address().port}`;

      var html = await getFile(baseUrl);
      expect(html).toContain('/__support__/clearReporters.js');
    });

    it('can add the batch reporter', async function() {
      this.server.batchReporter = true;

      const baseUrl = `http://localhost:${this.httpServer.address().port}`;

      var html = await getFile(baseUrl);
      expect(html).toContain('/__support__/batchReporter.js');
    });
  });
});
