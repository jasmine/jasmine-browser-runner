const express = require('express');

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
    "/some-path": express.static('static')
  }
}