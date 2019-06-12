function getBatch(driver) {
  return driver.executeScript(
    'var results = batchReporter.getBatch();\n' +
      'for (var i = 0; i < results.length; i++) {\n' +
      'var expectations = results[i][1].failedExpectations || [];\n' +
      'if (results[i][1].passedExpectations) {\n' +
      'expectations = expectations.concat(results[i][1].passedExpectations);\n' +
      '}\n' +
      'for (var j = 0; j < expectations.length; j++) {\n' +
      'var expectation = expectations[j];\n' +
      "try { JSON.stringify(expectation.expected); } catch (e) { expectation.expected = '<circular expected>'; }\n" +
      "try { JSON.stringify(expectation.actual); } catch (e) { expectation.actual = '<circular actual>'; }\n" +
      '}\n' +
      '}\n' +
      'return results;'
  );
}

function proxyToReporter(batch, reporter) {
  batch.forEach(function(result) {
    if (reporter[result[0]]) {
      reporter[result[0]](result[1]);
    }
  });
}

function isDone(batch) {
  return batch.some(function(result) {
    return result[0] === 'jasmineDone';
  });
}

function runTillEnd(webdriver, reporter) {
  return new Promise(function(resolve, reject) {
    const intervalId = setInterval(async function() {
      const batch = await getBatch(webdriver);
      proxyToReporter(batch, reporter);
      if (isDone(batch)) {
        clearInterval(intervalId);
        resolve(runDetails(batch));
      }
    }, 250);
  });
}

function runDetails(batch) {
  const jasmineDone = batch.find(function(item) {
    return item[0] === 'jasmineDone';
  });

  if (!jasmineDone) {
    throw new Error('No `jasmineDone` event found');
  }

  return jasmineDone[1];
}

function Runner(options) {
  this.run = async function() {
    await options.webdriver.get(options.host);
    var batch1 = await getBatch(options.webdriver);
    proxyToReporter(batch1, options.reporter);
    if (isDone(batch1)) {
      return runDetails(batch1);
    } else {
      return await runTillEnd(options.webdriver, options.reporter);
    }
  };
}

module.exports = Runner;
