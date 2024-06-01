export default {
  srcDir: "src",
  srcFiles: [
    "**/*.js"
  ],
  specDir: "spec",
  specFiles: [
    "**/*[sS]pec.js"
  ],
  helpers: [
    "helpers/**/*.js"
  ],
  env: {
    stopSpecOnExpectationFailure: false,
    stopOnSpecFailure: false,
    random: true
  },
  browser: {
    name: "firefox"
  }
};
