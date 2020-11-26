/* eslint-env browser, jasmine */

window.loadJasmineBrowserScript = function(src) {
  var script = document.createElement('script');

  if (src.match(/\.mjs$/)) {
    script.type = 'module';

    // Safari reports syntax errors in ES modules as a script element error
    // event rather than a global error event. Rethrow so that Jasmine can
    // pick it up and fail the suite.
    script.addEventListener('error', function(event) {
      var msg =
        'An error occurred while loading ' +
        src +
        '. Check the browser console for details.';
      throw new Error(msg);
    });
  } else {
    script.type = 'text/javascript';
  }

  script.src = src;
  document.head.appendChild(script);
};
