module.exports = {
  "srcDir": "src",
  "srcFiles": [
    "moduleWithSideEffects.mjs",
    "scriptNeedsSideEffect.js"
  ],
  "specDir": "spec",
  "specFiles": [
    "aSpec.js"
  ],
  "random": false,
  "modulesWithSideEffectsInSrcFiles": true,
  "browser": {
    "name": "headlessChrome"
  },
  "importMap": {
    "imports": {
      "myPackage/moduleWithSideEffects.mjs": "./src/moduleWithSideEffects.mjs"
    }
  }
}
