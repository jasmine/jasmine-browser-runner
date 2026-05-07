const serveStatic = require('serve-static');

module.exports = {
  "srcDir": ".",
  "srcFiles": [],
  "specDir": ".",
  "specFiles": ["aSpec.js"],
  "helpers": [],
  "browser": {
    "name": "headlessChrome"
  },
  "middleware": {
    "/some-path": serveStatic('static')
  }
}