[![Build Status](https://travis-ci.org/jasmine/jasmine-browser.svg?branch=master)](https://travis-ci.org/jasmine/jasmine-browser)

This is still a bit of a work in progress, working towards making this package usable by more than just Jasmine itself.

# Getting started

```bash
npm install --save-dev jasmine-browser
```

or

```bash
yarn add -D jasmine-browser
```

Add a `spec/support/jasmine-browser.json`. For example:

```json
{
  "srcDir": "src",
  "srcFiles": [
    "**/*.js"
  ],
  "specDir": "spec",
  "specFiles": [
    "**/*[Ss]pec.js"
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
npx jasmine-browser serve
```

Run the tests in a browser (defaults to Firefox)

```
npx jasmine-browser runSpecs
```

## Want more control?

```javascript
var path = require('path'),
  jasmineBrowser = require('jasmine-browser'),
  jasmineCore = require('../../lib/jasmine-core.js');

var config = require(path.resolve('spec/support/jasmine-browser.json'));
config.projectBaseDir = path.resolve('some/path');

jasmineBrowser.startServer(config, { port: 4321 });
```



