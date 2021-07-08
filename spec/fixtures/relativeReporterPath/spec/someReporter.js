function SomeReporter() {}

SomeReporter.prototype.jasmineDone = function() {
  console.log('relativeReporterPath/spec/someReporter was used');
};

module.exports = SomeReporter;