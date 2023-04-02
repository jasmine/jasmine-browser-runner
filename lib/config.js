const path = require('path');
const fs = require('fs');
const ModuleLoader = require('./moduleLoader');

async function loadConfig(baseDir, cliOptions) {
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
}

function validateConfig(config) {
  for (const k of ['specDir', 'srcDir']) {
    if (!config[k]) {
      throw new Error('Configuration is missing ' + k);
    }
  }

  for (const k of ['specFiles', 'srcFiles', 'helpers']) {
    if (config[k] && !Array.isArray(config[k])) {
      throw new Error(`Configuration's ${k} property is not an array`);
    }
  }

  if (config['importMappings']) {
    // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type/importmap
    // todo: resolve how much testing should be validating import map itself, as a convenience helper for the user?

    const k = 'importMappings';

    const importMappings = config[k];
    if (typeof importMappings !== 'object') {
      throw new Error(`Configuration's ${k} property is not an object`);
    }
    if (!importMappings.imports && !importMappings.scopes) {
      throw new Error(`Configuration's ${k} contains no imports or scopes`);
    }
    if (importMappings.imports) {
      validateImports(`${k}.imports`, importMappings.imports);
    }
    if (importMappings.scopes) {
      for (const [kScope, vScope] of Object.entries(importMappings.scopes)) {
        if (kScope === '') {
          throw new Error(
            `Configuration's ${k}.scopes cannot contain empty keys`
          );
        }
        if (typeof vScope !== 'object') {
          throw new Error(
            `Configuration's ${k}.scopes property is not an object`
          );
        }
        validateImports(`${k}.scopes`, vScope);
      }
    }
  }
}

function defaultConfig() {
  return fs.readFileSync(require.resolve('./examples/default_config.json'), {
    encoding: 'utf8',
  });
}

function defaultEsmConfig() {
  return fs.readFileSync(
    require.resolve('./examples/default_esm_config.json'),
    {
      encoding: 'utf8',
    }
  );
}

/**
 * Both importMappings.imports and importMappings.scopes[k].value should be
 * an object with import mapping, hence this helper function for DRY.
 *
 * @param imports object of actual string -> string mappings
 * @param context `importMappings.imports` | `importMappings.scopes`
 */
function validateImports(context, imports) {
  if (typeof imports !== 'object') {
    throw new Error(`Configuration's ${context} property is not an object`);
  }
  if (Object.keys(imports).length === 0) {
    throw new Error(`Configuration's ${context} map cannot be empty`);
  }
  for (const [kImport, vImport] of Object.entries(imports)) {
    if (kImport === '') {
      throw new Error(
        `Configuration's ${context} map cannot contain empty string keys`
      );
    }
    if (vImport === '') {
      throw new Error(
        `Configuration's ${context} map cannot contain empty string values`
      );
    }
    if (typeof vImport !== 'string') {
      throw new Error(`Configuration's ${context} map value is not a string`);
    }
  }
}

module.exports = {
  loadConfig,
  validateConfig,
  defaultConfig,
  defaultEsmConfig,
};
