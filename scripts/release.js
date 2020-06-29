const shell = require('shelljs'),
  pkg = require('../package.json');

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
