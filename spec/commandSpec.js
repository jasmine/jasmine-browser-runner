const util = require('util'),
  path = require('path'),
  Writable = require('stream').Writable,
  Command = require('../lib/command'),
  defaultConfig = require('../lib/default_config'),
  fs = require('fs'),
  os = require('os');

function StringWriter(options) {
  if (!(this instanceof StringWriter)) {
    return new StringWriter(options);
  }
  Writable.call(this, options);
  this.output = '';

  this._write = function(chunk, encoding, callback) {
    this.output = this.output + chunk.toString();
    callback();
  };
}
util.inherits(StringWriter, Writable);

describe('Command', function() {
  beforeEach(function() {
    this.writer = new StringWriter();
    this.console = new console.Console(this.writer);
  });

  describe('With no subcommand specified', function() {
    it('runs the serve subcommand', async function() {
      const fakeJasmineBrowser = jasmine.createSpyObj('jasmineBrowser', [
          'startServer',
        ]),
        command = new Command({
          jasmineBrowser: fakeJasmineBrowser,
          console: this.console,
          baseDir: path.resolve(__dirname, 'fixtures/sampleProject'),
        });

      await command.run([]);

      expect(fakeJasmineBrowser.startServer).toHaveBeenCalled();
    });
  });

  describe('serve', () => {
    it('starts a server', async function() {
      const fakeJasmineBrowser = jasmine.createSpyObj('jasmineBrowser', [
          'startServer',
        ]),
        command = new Command({
          jasmineBrowser: fakeJasmineBrowser,
          console: this.console,
          baseDir: path.resolve(__dirname, 'fixtures/sampleProject'),
        });

      await command.run(['serve', '--config=sampleConfig.json']);

      const options = require(path.join(
        __dirname,
        'fixtures/sampleProject/sampleConfig.json'
      ));

      expect(fakeJasmineBrowser.startServer).toHaveBeenCalledWith(options);
    });

    it('finds a default config when serving', async function() {
      const fakeJasmineBrowser = jasmine.createSpyObj('jasmineBrowser', [
          'startServer',
        ]),
        command = new Command({
          jasmineBrowser: fakeJasmineBrowser,
          console: this.console,
          baseDir: path.resolve(__dirname, 'fixtures/sampleProject'),
        });

      await command.run(['serve']);

      const options = require(path.join(
        __dirname,
        'fixtures/sampleProject/spec/support/jasmine-browser.json'
      ));

      expect(fakeJasmineBrowser.startServer).toHaveBeenCalledWith(options);
    });

    it('allows CLI args to override config file when serving', async function() {
      const fakeJasmineBrowser = jasmine.createSpyObj('jasmineBrowser', [
          'startServer',
        ]),
        command = new Command({
          jasmineBrowser: fakeJasmineBrowser,
          console: this.console,
          baseDir: path.resolve(__dirname, 'fixtures/sampleProject'),
        });

      await command.run(['serve', '--config=sampleConfig.json', '--port=2345']);

      const options = require(path.join(
        __dirname,
        'fixtures/sampleProject/sampleConfig.json'
      ));

      options.port = 2345;

      expect(fakeJasmineBrowser.startServer).toHaveBeenCalledWith(options);
    });

    it('propagates errors', async () => {
      const error = new Error('nope'),
        fakeJasmineBrowser = jasmine.createSpyObj('jasmineBrowser', [
          'startServer',
        ]),
        command = new Command({
          jasmineBrowser: fakeJasmineBrowser,
          console: this.console,
          baseDir: path.resolve(__dirname, 'fixtures/sampleProject'),
        });

      fakeJasmineBrowser.startServer.and.callFake(() => Promise.reject(error));

      await expectAsync(command.run(['serve'])).toBeRejectedWith(error);
    });
  });

  describe('runSpecs', function() {
    it('propagates errors', async () => {
      const error = new Error('nope'),
        fakeJasmineBrowser = jasmine.createSpyObj('jasmineBrowser', [
          'runSpecs',
        ]),
        command = new Command({
          jasmineBrowser: fakeJasmineBrowser,
          console: this.console,
          baseDir: path.resolve(__dirname, 'fixtures/sampleProject'),
        });

      fakeJasmineBrowser.runSpecs.and.callFake(() => Promise.reject(error));

      await expectAsync(command.run(['runSpecs'])).toBeRejectedWith(error);
    });
  });

  describe('version', function() {
    it('reports the version number', async function() {
      const jasmineBrowserVersion = require('../package.json').version;
      const command = new Command({
        jasmineBrowser: {},
        jasmineCore: { version: () => '17.42' },
        console: this.console,
      });

      await command.run(['version']);

      expect(this.writer.output).toContain('jasmine-core v17.42');
      expect(this.writer.output).toContain(
        'jasmine-browser-runner v' + jasmineBrowserVersion
      );
    });
  });

  describe('init', function() {
    beforeEach(function() {
      const tempDir = fs.mkdtempSync(`${os.tmpdir()}/jasmine-browser-command-`);
      this.prevDir = process.cwd();
      process.chdir(tempDir);
    });

    afterEach(function() {
      process.chdir(this.prevDir);
    });

    describe('When spec/support/jasmine-browser.json does not exist', function() {
      it('creates the file', async function() {
        const command = new Command({
          jasmineBrowser: {},
          jasmineCore: {},
          console: this.console,
        });

        await command.run(['init']);

        const actualContents = fs.readFileSync(
          'spec/support/jasmine-browser.json',
          { encoding: 'utf8' }
        );
        expect(actualContents).toEqual(defaultConfig);
      });
    });

    describe('When spec/support/jasmine-browser.json already exists', function() {
      it('does not create the file', async function() {
        const command = new Command({
          jasmineBrowser: {},
          jasmineCore: {},
          console: this.console,
        });
        fs.mkdirSync('spec/support', { recursive: true });
        fs.writeFileSync(
          'spec/support/jasmine-browser.json',
          'initial contents'
        );

        await command.run(['init']);

        const actualContents = fs.readFileSync(
          'spec/support/jasmine-browser.json',
          { encoding: 'utf8' }
        );
        expect(actualContents).toEqual('initial contents');
      });
    });
  });

  describe('help', function() {
    it('wraps the help text to 80 columns', async function() {
      const command = new Command({
        jasmineBrowser: {},
        jasmineCore: {},
        console: this.console,
      });

      await command.run(['help']);

      const lines = this.writer.output.split('\n');
      expect(lines.length).toBeGreaterThan(0);

      for (const line of lines) {
        expect(line.length).toBeLessThanOrEqual(80);
      }
    });
  });
});
