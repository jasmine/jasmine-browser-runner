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

        let rawData = '';
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

// Note: various payload specs check for \r?\n instead of either \n or os.EOL
// because the payloads sometimes contains \r\n and sometimes \n on Windows.
// (TODO why?)

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
    it('includes both core files and -browser-runner additions', function() {
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
      expect(files).toEqual([
        '/__jasmine__/jazz.js',
        '/__jasmine__/min.js',
        '/__boot__/bootboot.js',
        '/__config__/config.js',
        '/__boot__/boot2.js',
        '/__support__/loaders.js',
        '/__support__/batchReporter.js',
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

    it('supports http and https URLs', function() {
      const server = new Server({
        projectBaseDir: path.resolve(__dirname, 'fixtures/sampleProject'),
        jasmineCore: this.fakeJasmine,
        srcDir: 'anything',
        srcFiles: [],
        specDir: 'anything',
        helpers: [],
        specFiles: ['http://localhost/foo', 'https://localhost/bar'],
      });

      expect(server.userJs()).toEqual([
        'http://localhost/foo',
        'https://localhost/bar',
      ]);
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
      await this.startServer({
        env: {
          someProp: 'someVal',
        },
      });
      const baseUrl = `http://localhost:${this.server.port()}`;

      const jazz = await getFile(baseUrl + '/__jasmine__/jazz.js');
      expect(jazz).toMatch(/^Jazzy\r?\n$/);

      const min = await getFile(baseUrl + '/__jasmine__/min.js');
      expect(min).toMatch(/^minified\r?\n$/);

      const bootboot = await getFile(baseUrl + '/__boot__/bootboot.js');
      expect(bootboot).toMatch(/^booot\r?\n$/);

      const config = await getFile(baseUrl + '/__config__/config.js');
      expect(config).toContain(
        'jasmine.getEnv().configure({"someProp":"someVal"})'
      );

      const boot2 = await getFile(baseUrl + '/__boot__/boot2.js');
      expect(boot2).toMatch(/^Boot the second\r?\n$/);

      const css = await getFile(baseUrl + '/__jasmine__/css.css');
      expect(css).toMatch(/^CSS\r?\n$/);

      const two = await getFile(baseUrl + '/__jasmine__/two.css');
      expect(two).toMatch(/^two csses\r?\n$/);

      const image = await getFile(baseUrl + '/__images__/things.txt');
      expect(image).toMatch(/^pretend I'm an image\r?\n$/);
    });

    it('uses an empty config when none is specified', async function() {
      await this.startServer({
        env: undefined,
      });

      const baseUrl = `http://localhost:${this.server.port()}`;

      const config = await getFile(baseUrl + '/__config__/config.js');
      expect(config).toContain('jasmine.getEnv().configure({})');
    });

    it('starts a server and serves the project files', async function() {
      await this.startServer();
      const baseUrl = `http://localhost:${this.server.port()}`;

      const thing1 = await getFile(baseUrl + '/__src__/thing1.js');
      expect(thing1).toMatch(/^thing the first\r?\n$/);

      const spec = await getFile(baseUrl + '/__spec__/iLikeSpec.js');
      expect(spec).toMatch(/^I like specs\r?\n$/);
    });

    it('serves an html file to run the specs', async function() {
      await this.startServer();
      const baseUrl = `http://localhost:${this.server.port()}`;

      const html = await getFile(baseUrl);
      expect(html).toContain('/__jasmine__/jazz.js');
      expect(html).toContain('/__jasmine__/min.js');
      expect(html).toContain('/__boot__/bootboot.js');
      expect(html).toContain('/__config__/config.js');
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

      const html = await getFile(baseUrl);
      expect(html).toContain('/__support__/loaders.js');
    });

    describe('loading specs and helpers', function() {
      function behavesLikeTopLevelAwaitDisabled() {
        it('loads .js files as regular scripts', async function() {
          await this.startServer(this.extraOptions);
          const baseUrl = `http://localhost:${this.server.port()}`;

          const html = await getFile(baseUrl);
          expect(html).toContain(
            '<script src="/__spec__/helpers/halp.js" type="text/javascript">'
          );
          expect(html).toContain(
            '<script src="/__spec__/imAspec.js" type="text/javascript">'
          );
        });

        it('loads .mjs files as ES modules', async function() {
          await this.startServer({
            ...this.extraOptions,
            srcFiles: ['**/*.mjs'],
            helpers: ['helpers/**/*.mjs'],
            specFiles: ['**/*[sS]pec.mjs'],
          });
          const baseUrl = `http://localhost:${this.server.port()}`;

          const html = await getFile(baseUrl);
          expect(html).toContain(
            '<script type="module">_jasmine_loadEsModule(\'/__spec__/helpers/esm.mjs\')</script>'
          );
          expect(html).toContain(
            '<script type="module">_jasmine_loadEsModule(\'/__spec__/esmSpec.mjs\')</script>'
          );
        });
      }

      describe('When enableTopLevelAwait is undefined', function() {
        beforeEach(function() {
          this.extraOptions = {};
        });

        behavesLikeTopLevelAwaitDisabled();
      });

      describe('When enableTopLevelAwait is false', function() {
        beforeEach(function() {
          this.extraOptions = { enableTopLevelAwait: false };
        });

        behavesLikeTopLevelAwaitDisabled();
      });

      describe('When enableTopLevelAwait is true', function() {
        it('uses _jasmine_loadWithTopLevelAwaitSupport', async function() {
          await this.startServer({
            enableTopLevelAwait: true,
            srcFiles: ['**/*.mjs'],
            helpers: ['helpers/**/*.?(m)js'],
            specFiles: ['**/*[sS]pec.?(m)js'],
          });
          const baseUrl = `http://localhost:${this.server.port()}`;

          const html = await getFile(baseUrl);

          expect(html).toContain('_jasmine_loadWithTopLevelAwaitSupport');

          expect(html).toContain('/__spec__/helpers/esm.mjs');
          expect(html).not.toContain(
            '<script src="/__spec__/helpers/halp.js" type="text/javascript">'
          );
          expect(html).toContain('/__spec__/imAspec.js');
          expect(html).not.toContain(
            '<script src="/__spec__/imAspec.js" type="text/javascript">'
          );
          expect(html).toContain('/__spec__/helpers/esm.mjs');
          expect(html).not.toContain(
            '<script type="module">_jasmine_loadEsModule(\'/__spec__/helpers/esm.mjs\')</script>'
          );
          expect(html).toContain('/__spec__/esmSpec.mjs');
          expect(html).not.toContain(
            '<script type="module">_jasmine_loadEsModule(\'/__spec__/esmSpec.mjs\')</script>'
          );
        });
      });
    });

    describe('loading sources', function() {
      it('loads .js files as regular scripts', async function() {
        await this.startServer();
        const baseUrl = `http://localhost:${this.server.port()}`;

        const html = await getFile(baseUrl);
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

        const html = await getFile(baseUrl);
        expect(html).not.toContain('/__src__/esm.mjs');
      });
    });

    describe('The useHtmlReporter option', function() {
      it('does not remove the HTML reporter when undefined', async function() {
        await this.startServer({});

        const baseUrl = `http://localhost:${this.server.port()}`;

        const html = await getFile(baseUrl);
        expect(html).not.toContain('/__support__/clearReporters.js');
      });

      it('does not remove the HTML reporter when true', async function() {
        await this.startServer({ useHtmlReporter: true });

        const baseUrl = `http://localhost:${this.server.port()}`;

        const html = await getFile(baseUrl);
        expect(html).not.toContain('/__support__/clearReporters.js');
      });

      it('removes the HTML reporter when false', async function() {
        await this.startServer({ useHtmlReporter: false });

        const baseUrl = `http://localhost:${this.server.port()}`;

        const html = await getFile(baseUrl);
        expect(html).toContain('/__support__/clearReporters.js');
      });
    });

    it('adds the batch reporter', async function() {
      await this.startServer({});

      const baseUrl = `http://localhost:${this.server.port()}`;

      const html = await getFile(baseUrl);
      expect(html).toContain('/__support__/batchReporter.js');
    });
  });

  describe('When an importMap is provided', function() {
    beforeEach(function() {
      spyOn(console, 'log');
    });

    it('includes an import map with both imports and scopes', async function() {
      const server = new Server({
        projectBaseDir: path.resolve(__dirname, 'fixtures/importMap'),
        jasmineCore: this.fakeJasmine,
        srcDir: 'src',
        srcFiles: ['**/*.mjs'],
        specDir: 'spec',
        specFiles: ['**/*[sS]pec.mjs'],
        importMap: {
          imports: {
            'some-lib': 'some-lib/path/to/index.mjs',
            'some-lib/': 'some-lib/path/',
            'absolute-lib':
              'https://fakecdn.whatever/absolute-lib/dist/index.mjs',
          },
          scopes: {
            '/someScope/': {
              'some-lib': 'some-lib/different/path/to/index.mjs',
              'some-lib/': 'some-lib/different/path/',
              'absolute-lib':
                'https://fakecdn.whatever/absolute-lib/dist/index.mjs',
            },
          },
        },
      });

      try {
        await server.start({ port: 0 });
        const baseUrl = `http://localhost:${server.port()}`;
        const html = await getFile(baseUrl);

        expect(html).toMatch(
          new RegExp(
            [
              /<script type="importmap">/,
              /\s*{/,
              /\s*"imports": {/,
              /\s*"some-lib": ".*some-lib\/path\/to\/index\.mjs",/,
              /\s*"some-lib\/": ".*some-lib\/path\/",/,
              /\s*"absolute-lib": "https:\/\/fakecdn\.whatever\/absolute-lib\/dist\/index.mjs"/,
              /\s*},/,
              /\s*"scopes": {/,
              /\s*"\/someScope\/": {/,
              /\s*"some-lib": ".*some-lib\/different\/path\/to\/index.mjs",/,
              /\s*"some-lib\/": ".*some-lib\/different\/path\/",/,
              /\s*"absolute-lib": "https:\/\/fakecdn\.whatever\/absolute-lib\/dist\/index\.mjs"/,
              /\s*}/,
              /\s*}/,
              /\s*}/,
              /\s*<\/script>/,
            ]
              .map(x => x.source)
              .join('')
          )
        );
      } finally {
        await server.stop();
      }
    });

    it('includes an import map with imports only', async function() {
      const server = new Server({
        projectBaseDir: path.resolve(__dirname, 'fixtures/importMap'),
        jasmineCore: this.fakeJasmine,
        srcDir: 'src',
        srcFiles: ['**/*.mjs'],
        specDir: 'spec',
        specFiles: ['**/*[sS]pec.mjs'],
        importMap: {
          imports: {
            'some-lib': 'some-lib/path/to/index.mjs',
            'some-lib/': 'some-lib/path/',
            'absolute-lib':
              'https://fakecdn.whatever/absolute-lib/dist/index.mjs',
          },
        },
      });

      try {
        await server.start({ port: 0 });
        const baseUrl = `http://localhost:${server.port()}`;
        const html = await getFile(baseUrl);

        expect(html).toMatch(
          new RegExp(
            [
              /<script type="importmap">/,
              /\s*{/,
              /\s*"imports": {/,
              /\s*"some-lib": ".*some-lib\/path\/to\/index\.mjs",/,
              /\s*"some-lib\/": ".*some-lib\/path\/",/,
              /\s*"absolute-lib": "https:\/\/fakecdn\.whatever\/absolute-lib\/dist\/index.mjs"/,
              /\s*}/,
              /\s*}/,
              /\s*<\/script>/,
            ]
              .map(x => x.source)
              .join('')
          )
        );
      } finally {
        await server.stop();
      }
    });

    it('includes an import map with scopes only', async function() {
      const server = new Server({
        projectBaseDir: path.resolve(__dirname, 'fixtures/importMap'),
        jasmineCore: this.fakeJasmine,
        srcDir: 'src',
        srcFiles: ['**/*.mjs'],
        specDir: 'spec',
        specFiles: ['**/*[sS]pec.mjs'],
        importMap: {
          scopes: {
            '/someScope/': {
              'some-lib': 'some-lib/different/path/to/index.mjs',
              'some-lib/': 'some-lib/different/path/',
              'absolute-lib':
                'https://fakecdn.whatever/absolute-lib/dist/index.mjs',
            },
          },
        },
      });

      try {
        await server.start({ port: 0 });
        const baseUrl = `http://localhost:${server.port()}`;
        const html = await getFile(baseUrl);

        expect(html).toMatch(
          new RegExp(
            [
              /<script type="importmap">/,
              /\s*{/,
              /\s*"scopes": {/,
              /\s*"\/someScope\/": {/,
              /\s*"some-lib": ".*some-lib\/different\/path\/to\/index.mjs",/,
              /\s*"some-lib\/": ".*some-lib\/different\/path\/",/,
              /\s*"absolute-lib": "https:\/\/fakecdn\.whatever\/absolute-lib\/dist\/index\.mjs"/,
              /\s*}/,
              /\s*}/,
              /\s*}/,
              /\s*<\/script>/,
            ]
              .map(x => x.source)
              .join('')
          )
        );
      } finally {
        await server.stop();
      }
    });
  });
});
