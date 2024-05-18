const path = require('path'),
  temp = require('temp').track(),
  fs = require('fs'),
  shell = require('shelljs');

describe('npm package', function() {
  beforeAll(function() {
    this.hasTar = shell.exec('tar --help', { silent: true }).code === 0;

    if (!this.hasTar) {
      return;
    }

    const pack = shell.exec('npm pack', { silent: true });

    this.tarball = pack.stdout.split('\n')[0];
    this.tmpDir = temp.mkdirSync(); // automatically deleted on exit

    const untar = shell.exec(
      'tar -xzf ' + this.tarball + ' -C ' + this.tmpDir,
      {
        silent: true,
      }
    );
    expect(untar.code).toBe(0);
  });

  afterAll(function() {
    if (this.tarball) {
      fs.unlinkSync(this.tarball);
    }
  });

  it('does not have any unexpected files in the package directory', function() {
    if (!this.hasTar) {
      pending('System does not appear to have a tar command');
    }

    const files = fs.readdirSync(path.resolve(this.tmpDir, 'package'));
    files.sort();
    expect(files).toEqual([
      'MIT.LICENSE',
      'README.md',
      'bin',
      'config.js.ejs',
      'index.js',
      'lib',
      'package.json',
      'run.html.ejs',
    ]);
  });

  it('only has jasmine-browser-runner in the bin dir', function() {
    if (!this.hasTar) {
      pending('System does not appear to have a tar command');
    }

    const files = fs.readdirSync(path.resolve(this.tmpDir, 'package/bin'));
    files.sort();
    expect(files).toEqual(['jasmine-browser-runner']);
  });

  it('only has JS files and default config in the lib dir', function() {
    if (!this.hasTar) {
      pending('System does not appear to have a tar command');
    }

    const files = [];

    function getFiles(dir) {
      const dirents = fs.readdirSync(dir, { withFileTypes: true });

      for (const dirent of dirents) {
        if (dirent.isDirectory()) {
          getFiles(path.resolve(dir, dirent.name));
        } else {
          files.push(path.resolve(dir, dirent.name));
        }
      }
    }

    getFiles(path.resolve(this.tmpDir, 'package/lib'));

    for (const file of files) {
      expect(file).toMatch(/(\.(js|css)|[/\\]default.*_config.mjs)$/);
    }
  });
});
