const ModuleLoader = require('../lib/moduleLoader');

describe('ModuleLoader', function() {
  it('loads json files using require', async function() {
    const requireShim = jasmine.createSpy('requireShim');
    const importShim = jasmine.createSpy('importShim');
    const subject = new ModuleLoader({ requireShim, importShim });
    const result = { the: 'payload' };
    requireShim.and.returnValue(result);

    await expectAsync(subject.load('foo.json')).toBeResolvedTo(result);
    expect(requireShim).toHaveBeenCalledWith('foo.json');
    expect(importShim).not.toHaveBeenCalled();
  });

  it('loads non-json files using import', async function() {
    const requireShim = jasmine.createSpy('requireShim');
    const importShim = jasmine.createSpy('importShim');
    const subject = new ModuleLoader({ requireShim, importShim });
    const result = { the: 'payload' };
    importShim.and.returnValue(Promise.resolve({ default: result }));

    await expectAsync(subject.load('foo.js')).toBeResolvedTo(result);
    expect(importShim).toHaveBeenCalledWith('foo.js');
    expect(requireShim).not.toHaveBeenCalled();
  });

  describe('When a non-json file has an absolute path', function() {
    it('converts the path to a URL', async function() {
      const requireShim = jasmine.createSpy('requireShim');
      const importShim = jasmine.createSpy('importShim');
      const subject = new ModuleLoader({ requireShim, importShim });
      importShim.and.returnValue(new Promise(function() {}));

      subject.load('/path/to/foo.js');

      expect(importShim).toHaveBeenCalledWith('file:///path/to/foo.js');
    });
  });
});
