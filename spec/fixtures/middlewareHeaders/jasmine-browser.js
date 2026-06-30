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
    "/": function(req, res, next) {
      res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
      res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
      next();
    }
  }
}
