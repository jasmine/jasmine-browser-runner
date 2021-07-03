function OrderReporter() {
}

OrderReporter.prototype.specStarted = function(event) {
  console.log('spec started:', event.fullName);
};

module.exports = OrderReporter;