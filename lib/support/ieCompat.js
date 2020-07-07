/* eslint-env browser, jasmine */
(function() {
  var env = jasmine.getEnv();

  if (env.enableSlowIeSeleniumCompat_) {
    env.enableSlowIeSeleniumCompat_();
  }
})();
