const path = require('path');
const fs = require('fs');
const ModuleLoader = require('./moduleLoader');

module.exports = async function loadConfig(baseDir, cliOptions) {
  const options = { ...cliOptions };
  const specifiedConfigFile = options.config;
  delete options.config;
  delete options.unknown;

  Object.keys(options).forEach(function(opt) {
    const camelCase = opt.replace(/-./g, function(input) {
      return input[1].toUpperCase();
    });
    if (camelCase !== opt) {
      options[camelCase] = options[opt];
      delete options[opt];
    }
  });

  const candidates = (specifiedConfigFile
    ? [specifiedConfigFile]
    : ['spec/support/jasmine-browser.js', 'spec/support/jasmine-browser.json']
  )
    .filter(name => !!name)
    .map(name => path.resolve(baseDir, name));

  const fullPath = candidates.find(p => fs.existsSync(p));

  if (!fullPath) {
    const msg =
      'Could not find configuration file.\nTried:\n' +
      candidates.map(p => `* ${p}`).join('\n');
    throw new Error(msg);
  }

  const moduleLoader = new ModuleLoader();
  return Object.assign({}, await moduleLoader.load(fullPath), options);
};
