export default {
  srcDir: "src",
  // srcFiles should usually be left empty when using ES modules, because you'll
  // explicitly import sources from your specs.
  srcFiles: [],
  specDir: ".",
  specFiles: [
    "spec/**/*[sS]pec.?(m)js"
  ],
  helpers: [
    "spec/helpers/**/*.?(m)js"
  ],
  esmFilenameExtension: ".mjs",
  // Allows the use of top-level await in src/spec/helper files. This is off by
  // default because it makes files load more slowly.
  enableTopLevelAwait: false,
  env: {
    stopSpecOnExpectationFailure: false,
    stopOnSpecFailure: false,
    random: true
  },
  browser: {
    name: "firefox"
  }
};
