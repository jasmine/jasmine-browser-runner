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
  // For security, bind only to localhost. You can also specify a different
  // hostname, or remove the hostname property entirely to bind to all network
  // interfaces.
  hostname: "localhost",
  browser: {
    name: "firefox"
  }
};
