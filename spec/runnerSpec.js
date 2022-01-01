const querystring = require('querystring'),
  Runner = require('../lib/runner.js');

function fakeReporter() {
  return jasmine.createSpyObj('reporter', [
    'jasmineStarted',
    'suiteStarted',
    'specStarted',
    'jasmineDone',
    'suiteDone',
    'specDone',
  ]);
}

describe('Runner', function() {
  beforeEach(function() {
    jasmine.clock().install();
  });

  afterEach(function() {
    jasmine.clock().uninstall();
  });

  it('loads the page and passes info to the reporter', async function() {
    const getPromise = Promise.resolve(),
      closePromise = Promise.resolve(),
      batchPromise = Promise.resolve([
        ['jasmineStarted', { things: 'stuff' }],
        ['suiteStarted', { fullName: 'top' }],
        ['suiteStarted', { fullName: 'inner' }],
        ['specStarted', { fullName: 'inner spec' }],
        ['specDone', { fullName: 'inner spec', status: 'passed' }],
        ['suiteDone', { fullName: 'inner', status: 'failed' }],
        ['specStarted', { fullName: 'top spec' }],
        ['specDone', { fullName: 'top spec', status: 'failed' }],
        ['suiteDone', { fullName: 'top', status: 'passed' }],
        ['jasmineDone', { overallStatus: 'complete' }],
      ]),
      driver = jasmine.createSpyObj('webdriver', {
        get: getPromise,
        executeScript: batchPromise,
        close: closePromise,
      }),
      reporter = fakeReporter(),
      runner = new Runner({
        webdriver: driver,
        reporters: [reporter],
        host: 'things',
      });

    runner.run({ batchReporter: true });
    expect(driver.get).toHaveBeenCalledWith('things?');
    await getPromise;

    expect(driver.executeScript).toHaveBeenCalledWith(
      jasmine.stringMatching('batchReporter.getBatch()')
    );
    await batchPromise;

    expect(reporter.jasmineStarted).toHaveBeenCalledWith({ things: 'stuff' });
    expect(reporter.suiteStarted).toHaveBeenCalledWith({ fullName: 'top' });
    expect(reporter.suiteStarted).toHaveBeenCalledWith({ fullName: 'inner' });
    expect(reporter.specStarted).toHaveBeenCalledWith({
      fullName: 'inner spec',
    });
    expect(reporter.specDone).toHaveBeenCalledWith({
      fullName: 'inner spec',
      status: 'passed',
    });
    expect(reporter.suiteDone).toHaveBeenCalledWith({
      fullName: 'inner',
      status: 'failed',
    });
    expect(reporter.specStarted).toHaveBeenCalledWith({
      fullName: 'top spec',
    });
    expect(reporter.specDone).toHaveBeenCalledWith({
      fullName: 'top spec',
      status: 'failed',
    });
    expect(reporter.suiteDone).toHaveBeenCalledWith({
      fullName: 'top',
      status: 'passed',
    });
    expect(reporter.jasmineDone).toHaveBeenCalledWith({
      overallStatus: 'complete',
    });

    driver.executeScript.calls.reset();
    jasmine.clock().tick(1000);
    expect(driver.executeScript).not.toHaveBeenCalled();
  });

  it('polls until a batch includes jasmineDone', async function() {
    const getPromise = Promise.resolve(),
      closePromise = Promise.resolve(),
      batch1Promise = Promise.resolve([
        ['jasmineStarted', { things: 'stuff' }],
        ['suiteStarted', { fullName: 'top' }],
      ]),
      batch2Promise = Promise.resolve([
        ['suiteStarted', { fullName: 'inner' }],
        ['specStarted', { fullName: 'inner spec' }],
        ['specDone', { fullName: 'inner spec', status: 'passed' }],
        ['suiteDone', { fullName: 'inner', status: 'failed' }],
      ]),
      batch3Promise = Promise.resolve([
        ['specStarted', { fullName: 'top spec' }],
        ['specDone', { fullName: 'top spec', status: 'failed' }],
        ['suiteDone', { fullName: 'top', status: 'passed' }],
      ]),
      batch4Promise = Promise.resolve([
        ['jasmineDone', { overallStatus: 'complete' }],
      ]),
      driver = jasmine.createSpyObj('webdriver', {
        get: getPromise,
        executeScript: null,
        close: closePromise,
      }),
      reporter = fakeReporter(),
      runner = new Runner({
        webdriver: driver,
        reporters: [reporter],
        host: 'things',
      });

    driver.executeScript.and.returnValues(
      batch1Promise,
      batch2Promise,
      batch3Promise,
      batch4Promise
    );

    runner.run({ batchReporter: true });
    expect(driver.get).toHaveBeenCalledWith('things?');
    await getPromise;

    expect(driver.executeScript).toHaveBeenCalledWith(
      jasmine.stringMatching('batchReporter.getBatch()')
    );
    await batch1Promise;

    expect(reporter.jasmineStarted).toHaveBeenCalledWith({ things: 'stuff' });
    expect(reporter.suiteStarted).toHaveBeenCalledWith({ fullName: 'top' });

    driver.executeScript.calls.reset();
    jasmine.clock().tick(250);
    expect(driver.executeScript).toHaveBeenCalledWith(
      jasmine.stringMatching('batchReporter.getBatch()')
    );
    await batch2Promise;

    expect(reporter.suiteStarted).toHaveBeenCalledWith({ fullName: 'inner' });
    expect(reporter.specStarted).toHaveBeenCalledWith({
      fullName: 'inner spec',
    });
    expect(reporter.specDone).toHaveBeenCalledWith({
      fullName: 'inner spec',
      status: 'passed',
    });
    expect(reporter.suiteDone).toHaveBeenCalledWith({
      fullName: 'inner',
      status: 'failed',
    });

    driver.executeScript.calls.reset();
    jasmine.clock().tick(250);
    expect(driver.executeScript).toHaveBeenCalledWith(
      jasmine.stringMatching('batchReporter.getBatch()')
    );
    await batch3Promise;

    expect(reporter.specStarted).toHaveBeenCalledWith({
      fullName: 'top spec',
    });
    expect(reporter.specDone).toHaveBeenCalledWith({
      fullName: 'top spec',
      status: 'failed',
    });
    expect(reporter.suiteDone).toHaveBeenCalledWith({
      fullName: 'top',
      status: 'passed',
    });

    driver.executeScript.calls.reset();
    jasmine.clock().tick(250);
    expect(driver.executeScript).toHaveBeenCalledWith(
      jasmine.stringMatching('batchReporter.getBatch()')
    );
    await batch4Promise;

    expect(reporter.jasmineDone).toHaveBeenCalledWith({
      overallStatus: 'complete',
    });

    driver.executeScript.calls.reset();
    jasmine.clock().tick(1000);
    expect(driver.executeScript).not.toHaveBeenCalled();
  });

  it("handles errors from the webdriver's executeScript method in runTillEnd", async function() {
    const driver = jasmine.createSpyObj('webdriver', {
        get: Promise.resolve(),
        executeScript: null,
        close: Promise.resolve(),
      }),
      reporter = fakeReporter(),
      runner = new Runner({
        webdriver: driver,
        reporters: [reporter],
        host: 'things',
      });

    driver.executeScript.and.callFake(function() {
      return Promise.reject(new Error('nope'));
    });

    const resultPromise = runner.run({ batchReporter: true });

    expect(driver.get).toHaveBeenCalled();
    await Promise.resolve();
    jasmine.clock().tick(250);
    expect(driver.executeScript).toHaveBeenCalledTimes(1);
    await expectAsync(resultPromise).toBeRejectedWithError('nope');

    // Should not fetch another batch after the failure
    jasmine.clock().tick(250);
    expect(driver.executeScript).toHaveBeenCalledTimes(1);
  });

  it('does not fetch another batch while fetching', async function() {
      let resolve;
      const executePromise = new Promise(res => (resolve = res)),
        driver = jasmine.createSpyObj('webdriver', {
          get: Promise.resolve(),
          executeScript: executePromise,
          close: Promise.resolve(),
        }),
        reporter = fakeReporter(),
        runner = new Runner({
          webdriver: driver,
          reporters: [reporter],
          host: 'things',
        });

      const resultPromise = runner.run({ batchReporter: true });

      expect(driver.get).toHaveBeenCalled();
      await Promise.resolve();
      expect(driver.executeScript).toHaveBeenCalledTimes(1);
      jasmine.clock().tick(250);
      // Should not have polled again while waiting
      expect(driver.executeScript).toHaveBeenCalledTimes(1);

      resolve([['jasmineDone', { overallStatus: 'complete' }]]);
      await resultPromise;
    });

  it('passes runtime options through to the browser', async function() {
    const getPromise = new Promise(function() {}),
      driver = jasmine.createSpyObj('webdriver', {
        get: getPromise,
      }),
      reporter = fakeReporter(),
      runner = new Runner({
        webdriver: driver,
        reporters: [reporter],
        host: 'things',
      });

    runner.run({
      random: true,
      seed: 435,
      filter: 'specs and things',
    });
    expect(driver.get).toHaveBeenCalledWith(
      jasmine.stringMatching(/^things\?/)
    );
    const urlParams = querystring.parse(
      driver.get.calls.mostRecent().args[0].split('?')[1]
    );

    expect(urlParams).toEqual({
      random: 'true',
      seed: '435',
      spec: 'specs and things',
    });
  });

  it('supports multiple reporters', async function() {
    let resolve;
    const executePromise = new Promise(res => (resolve = res)),
      driver = jasmine.createSpyObj('webdriver', {
        get: Promise.resolve(),
        executeScript: executePromise,
        close: Promise.resolve(),
      }),
      reporters = [fakeReporter(), fakeReporter()],
      runner = new Runner({
        webdriver: driver,
        reporters,
      });

    const resultPromise = runner.run({ batchReporter: true });

    expect(driver.get).toHaveBeenCalled();
    await Promise.resolve();
    expect(driver.executeScript).toHaveBeenCalled();
    resolve([['jasmineDone', { overallStatus: 'complete' }]]);
    await resultPromise;

    expect(reporters[0].jasmineDone)
      .withContext('first reporter')
      .toHaveBeenCalled();
    expect(reporters[1].jasmineDone)
      .withContext('second reporter')
      .toHaveBeenCalled();
  });
});
