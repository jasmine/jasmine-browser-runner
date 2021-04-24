const querystring = require('querystring');

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

async function jsDomReporterResults(webdriver) {
  const resultsEl = await new Promise(function(resolve) {
    function poll() {
      webdriver.findElement({ id: 'jasmine-jsonDomReporter-done' }).then(
        el => resolve(el),
        () => setTimeout(poll, 1000)
      );
    }

    poll();
  });

  const text = await resultsEl.getText();
  return JSON.parse(text);
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

function urlParams(runOptions) {
  return (
    '?' +
    querystring.stringify(
      filterUndefined({
        random: runOptions.random,
        seed: runOptions.seed,
        failFast: runOptions.failFast,
        throwFailures: runOptions.stopOnFailure,
        spec: runOptions.filter,
      })
    )
  );
}

function filterUndefined(obj) {
  const result = {};

  Object.keys(obj).forEach(function(k) {
    if (obj[k] !== undefined) {
      result[k] = obj[k];
    }
  });

  return result;
}

function Runner(options) {
  this.run = async function(runOptions) {
    runOptions = runOptions || {};
    await options.webdriver.get(options.host + urlParams(runOptions));

    if (runOptions.jsonDomReporter) {
      console.log(
        "Note: Results won't be shown until the entire suite has finished running."
      );
      let results = await jsDomReporterResults(options.webdriver);
      proxyToReporter(results, options.reporter);

      if (!isDone(results)) {
        throw new Error("Didn't find a jasmineDone event");
      }

      return runDetails(results);
    } else {
      let batch1 = await getBatch(options.webdriver);
      proxyToReporter(batch1, options.reporter);
      if (isDone(batch1)) {
        return runDetails(batch1);
      } else {
        return await runTillEnd(options.webdriver, options.reporter);
      }
    }
  };
}

module.exports = Runner;
