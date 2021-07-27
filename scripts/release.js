const shell = require('shelljs'),
  pkg = require('../package.json');

const coreVersion = pkg.dependencies['jasmine-core'];

if (coreVersion.indexOf('git') !== -1 || coreVersion.indexOf('file:') !== -1) {
  console.log('Incorrect jasmine-core version:', coreVersion);
  process.exit(1);
}

function exec(string) {
  const result = shell.exec(string);

  if (result.code !== 0) {
    const message = 'Command `' + string + '` failed with: ' + result.code;
    throw new Error([message, result.stdout, result.stderr].join('\n'));
  }
}

exec(`git tag v${pkg.version}`);
exec('git push origin main --tags');
exec('npm publish');
