const util = require('util'),
  path = require('path'),
  Writable = require('stream').Writable,
  Command = require('../lib/command');

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

  describe('serve', () => {
    it('starts a server', function() {
      const fakeJasmineBrowser = jasmine.createSpyObj('jasmineBrowser', [
          'startServer',
        ]),
        command = new Command({
          jasmineBrowser: fakeJasmineBrowser,
          console: this.console,
          baseDir: path.resolve(__dirname, 'fixtures/sampleProject'),
        });

      command.run(['serve', '--config=sampleConfig.json']);

      const options = require(path.join(
        __dirname,
        'fixtures/sampleProject/sampleConfig.json'
      ));

      expect(fakeJasmineBrowser.startServer).toHaveBeenCalledWith(options);
    });

    it('finds a default config when serving', function() {
      const fakeJasmineBrowser = jasmine.createSpyObj('jasmineBrowser', [
          'startServer',
        ]),
        command = new Command({
          jasmineBrowser: fakeJasmineBrowser,
          console: this.console,
          baseDir: path.resolve(__dirname, 'fixtures/sampleProject'),
        });

      command.run(['serve']);

      const options = require(path.join(
        __dirname,
        'fixtures/sampleProject/spec/support/jasmine-browser.json'
      ));

      expect(fakeJasmineBrowser.startServer).toHaveBeenCalledWith(options);
    });

    it('allows CLI args to override config file when serving', function() {
      const fakeJasmineBrowser = jasmine.createSpyObj('jasmineBrowser', [
          'startServer',
        ]),
        command = new Command({
          jasmineBrowser: fakeJasmineBrowser,
          console: this.console,
          baseDir: path.resolve(__dirname, 'fixtures/sampleProject'),
        });

      command.run(['serve', '--config=sampleConfig.json', '--port=2345']);

      const options = require(path.join(
        __dirname,
        'fixtures/sampleProject/sampleConfig.json'
      ));

      options.port = 2345;

      expect(fakeJasmineBrowser.startServer).toHaveBeenCalledWith(options);
    });

    it('propagates errors', async () => {
      const error = new Error('nope'),
        fakeJasmineBrowser = jasmine.createSpyObj('jasmineBrowser', ['startServer']),
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
        fakeJasmineBrowser = jasmine.createSpyObj('jasmineBrowser', ['runSpecs']),
        command = new Command({
          jasmineBrowser: fakeJasmineBrowser,
          console: this.console,
          baseDir: path.resolve(__dirname, 'fixtures/sampleProject'),
        });

      fakeJasmineBrowser.runSpecs.and.callFake(() => Promise.reject(error));

      await expectAsync(command.run(['runSpecs'])).toBeRejectedWith(error);
    });
  });
});
