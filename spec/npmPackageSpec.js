const path = require('path');
const fs = require('fs');
const os = require('os');
const child_process = require('child_process');

describe('npm package', function() {
  beforeAll(function() {
    const prefix = path.join(os.tmpdir(), 'jasmine-npm-package');
    this.tmpDir = fs.mkdtempSync(prefix);
    const packOutput = child_process.execSync('npm pack', {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    this.tarball = packOutput.split('\n')[0];
    child_process.execSync(`tar -xzf ${this.tarball} -C ${this.tmpDir}`, {
      encoding: 'utf8',
    });
  });

  afterAll(function() {
    if (this.tarball) {
      fs.unlinkSync(this.tarball);
    }

    fs.rmSync(this.tmpDir, { recursive: true });
  });

  it('does not have any unexpected files in the package directory', function() {
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
    const files = fs.readdirSync(path.resolve(this.tmpDir, 'package/bin'));
    files.sort();
    expect(files).toEqual(['jasmine-browser-runner']);
  });

  it('only has JS files and default config in the lib dir', function() {
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
