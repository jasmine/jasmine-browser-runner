const ModuleLoader = require('../lib/moduleLoader');
const url = require('url');

describe('ModuleLoader', function() {
  it('loads json files using require', async function() {
    const requireShim = jasmine.createSpy('requireShim');
    const importShim = jasmine.createSpy('importShim');
    const subject = new ModuleLoader('', { requireShim, importShim });
    const result = { the: 'payload' };
    requireShim.and.returnValue(result);

    await expectAsync(subject.load('foo.json')).toBeResolvedTo(result);
    expect(requireShim).toHaveBeenCalledWith('foo.json');
    expect(importShim).not.toHaveBeenCalled();
  });

  describe('Loading non-json files', function() {
    it('uses import', async function() {
      const requireShim = jasmine.createSpy('requireShim');
      const importShim = jasmine.createSpy('importShim');
      const subject = new ModuleLoader('', { requireShim, importShim });
      const result = { the: 'payload' };
      importShim.and.returnValue(Promise.resolve({ default: result }));

      await expectAsync(subject.load('foo.js')).toBeResolvedTo(result);
      expect(importShim).toHaveBeenCalledWith('foo.js');
      expect(requireShim).not.toHaveBeenCalled();
    });

    describe('with an absolute path', function() {
      it('converts the path to a URL', async function() {
        const requireShim = jasmine.createSpy('requireShim');
        const importShim = jasmine.createSpy('importShim');
        const subject = new ModuleLoader('/some/dir', {
          requireShim,
          importShim,
        });
        importShim.and.returnValue(new Promise(function() {}));

        subject.load('/path/to/foo.js');

        expect(importShim).toHaveBeenCalledWith(
          url.pathToFileURL('/path/to/foo.js')
        );
      });
    });

    describe('With a path starting in ./', function() {
      it('resolves the path relative to the specified parent dir', async function() {
        const requireShim = jasmine.createSpy('requireShim');
        const importShim = jasmine.createSpy('importShim');
        const subject = new ModuleLoader('/some/dir', {
          requireShim,
          importShim,
        });
        importShim.and.returnValue(new Promise(function() {}));

        subject.load('./some/module.js');

        expect(importShim).toHaveBeenCalledWith(
          url.pathToFileURL('/some/dir/some/module.js')
        );
      });
    });

    describe('With a path starting in ../', function() {
      it('resolves the path relative to the specified parent dir', async function() {
        const requireShim = jasmine.createSpy('requireShim');
        const importShim = jasmine.createSpy('importShim');
        const subject = new ModuleLoader('/some/dir', {
          requireShim,
          importShim,
        });
        importShim.and.returnValue(new Promise(function() {}));

        subject.load('../a/module.js');

        expect(importShim).toHaveBeenCalledWith(
          url.pathToFileURL('/some/a/module.js')
        );
      });
    });

    describe('With a non-absolute path that does not start with ./ or ../', function() {
      it('imports the path as-is', function() {
        const requireShim = jasmine.createSpy('requireShim');
        const importShim = jasmine.createSpy('importShim');
        const subject = new ModuleLoader('', { requireShim, importShim });
        importShim.and.returnValue(new Promise(function() {}));

        subject.load('jasmine-core');

        expect(importShim).toHaveBeenCalledWith('jasmine-core');
      });
    });
  });
});
