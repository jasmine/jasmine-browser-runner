[![Build Status](https://circleci.com/gh/jasmine/jasmine-browser.svg?style=shield)](https://circleci.com/gh/jasmine/jasmine-browser)


This is still a bit of a work in progress, working towards making this package usable by more than just Jasmine itself.

# Getting started

```bash
npm install --save-dev jasmine-browser-runner
```

or

```bash
yarn add -D jasmine-browser-runner
```

Add a `spec/support/jasmine-browser.json`. For example:

```json
{
  "srcDir": "src",
  "srcFiles": [
    "**/*.?(m)js"
  ],
  "specDir": "spec",
  "specFiles": [
    "**/*[Ss]pec.?(m)js"
  ],
  "helpers": [
    "helpers/asyncAwait.js"
  ],
  "random": true
}
```

You can also use the `--config` option to specify a different file. This file can be a JSON file or a javascript file that exports a object that looks like the JSON above.

Start the server:

```
npx jasmine-browser-runner serve
```

Run the tests in a browser (defaults to Firefox)

```
npx jasmine-browser-runner runSpecs
```

## ES module support

If a source, spec, or helper file's name ends in `.mjs`, it will be loaded as
an ES module rather than a regular script. Note that ES modules are not 
available in all browsers supported by jasmine-browser. Currently, 
jasmine-browser does not try to determine whether the browser supports ES
modules. ES modules will silently fail to load in browsers that don't
support them. Other kinds of load-time errors are detected and reported as suite
errors.

## Want more control?

```javascript
var path = require('path'),
  jasmineBrowser = require('jasmine-browser-runner'),
  jasmineCore = require('../../lib/jasmine-core.js');

var config = require(path.resolve('spec/support/jasmine-browser.json'));
config.projectBaseDir = path.resolve('some/path');

jasmineBrowser.startServer(config, { port: 4321 });
```



