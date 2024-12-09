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
  // Needed because of _jasmine_loadEsModule wrapper
  "enableTopLevelAwait": true,
  "browser": {
    "name": "headlessChrome"
  }
}
