module.exports = {
  "srcDir": "src",
  "srcFiles": [],
  "specDir": "spec",
  "specFiles": [
    "aSpec.mjs",
    "bSpec.js"
  ],
  "helpers": [
    "helpers/aHelper.mjs"
  ],
  "enableTopLevelAwait": true,
  "random": false,
  "browser": {
    "name": "headlessChrome"
  },
  reporters: [
    {
      specStarted(event) {
        console.log('Spec started:', event.fullName);
      }
    }
  ],
  color: false
};
