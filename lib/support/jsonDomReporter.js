/* eslint-env browser, jasmine */

// This is mainly intended for use with IE. When controlling IE,
// webdriver.executeScript is unreliable. It tends to fail if too
// much JS is running on the page when it's called or if the return
// value of the executed JS is non-tiny. Both of these are common
// conditions in Jasmine. JsonDomReporter works around the problem
// by exposing all data through the DOM, so that the runner can
// entirely avoid calling webdriver.executeScript. The drawback is
// that results can't be shown until all specs have finished.
function JsonDomReporter() {
  var events = [];

  this.jasmineStarted = function(info) {
    events.push(['jasmineStarted', info]);
  };

  this.suiteStarted = function(info) {
    events.push(['suiteStarted', info]);
  };

  this.specStarted = function(info) {
    events.push(['specStarted', info]);
  };

  this.jasmineDone = function(info) {
    events.push(['jasmineDone', info]);

    var resultsEl = document.createElement('div');
    resultsEl.id = 'jasmine-jsonDomReporter-done';
    resultsEl.textContent = JSON.stringify(events);
    document.body.appendChild(resultsEl);
  };

  this.suiteDone = function(info) {
    events.push(['suiteDone', info]);
  };

  this.specDone = function(info) {
    events.push(['specDone', info]);
  };
}

window.jsonDomReporter = new JsonDomReporter();
jasmine.getEnv().addReporter(window.jsonDomReporter);
