const ConsoleReporter = require('jasmine').ConsoleReporter;
const util = require('util');

function DefaultReporter(options) {
  options = options || {};
  ConsoleReporter.call(this);

  this.setOptions({
    print: function() {
      process.stdout.write(util.format.apply(this, arguments));
    },
    randomSeedReproductionCmd: function(seed) {
      return 'jasmine-browser-runner runSpecs --seed=' + seed;
    },
    showColors: options.color === 'undefined' ? true : options.color,
  });
}

module.exports = DefaultReporter;
