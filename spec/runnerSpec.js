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

  describe('When the browser is not IE', function() {
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
          reporter: reporter,
          host: 'things',
        });

      runner.run();
      expect(driver.get).toHaveBeenCalledWith('things');
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
          reporter: reporter,
          host: 'things',
        });

      driver.executeScript.and.returnValues(
        batch1Promise,
        batch2Promise,
        batch3Promise,
        batch4Promise
      );

      runner.run();
      expect(driver.get).toHaveBeenCalledWith('things');
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
  });

  describe('When the browser is IE', function() {
    beforeEach(function() {
      spyOn(console, 'log');
    });

    it('passes events to the reporter after the jsDomReporter signals completion', async function() {
      const events = [
        ['jasmineStarted', { things: 'stuff' }],
        ['suiteStarted', { fullName: 'top' }],
        ['specStarted', { fullName: 'inner spec' }],
        ['specDone', { fullName: 'inner spec', status: 'passed' }],
        ['suiteDone', { fullName: 'top', status: 'passed' }],
        ['jasmineDone', { overallStatus: 'complete' }],
      ];
      const resultsEL = {
        getText: function() {
          return Promise.resolve(JSON.stringify(events));
        },
      };
      const driver = jasmine.createSpyObj('driver', [
        'findElement',
        'executeScript',
        'get',
      ]);
      let done = false;
      driver.findElement.and.callFake(function() {
        if (done) {
          return Promise.resolve(resultsEL);
        } else {
          return Promise.reject();
        }
      });
      driver.get.and.returnValue(Promise.resolve());
      const reporter = fakeReporter();
      const runner = new Runner({
        webdriver: driver,
        reporter: reporter,
      });

      const runPromise = runner.run({
        browser: {
          name: 'internet explorer',
        },
      });

      await Promise.resolve();
      expect(driver.findElement).toHaveBeenCalledWith({
        id: 'jasmine-jsonDomReporter-done',
      });
      driver.findElement.calls.reset();
      await Promise.resolve();
      jasmine.clock().tick(1000);
      expect(driver.findElement).toHaveBeenCalledWith({
        id: 'jasmine-jsonDomReporter-done',
      });
      driver.findElement.calls.reset();

      [
        'jasmineStarted',
        'suiteStarted',
        'specStarted',
        'specDone',
        'suiteDone',
        'jasmineDone',
      ].forEach(function(event) {
        expect(reporter[event]).not.toHaveBeenCalled();
      });

      done = true;
      await Promise.resolve();
      jasmine.clock().tick(1000);
      expect(driver.findElement).toHaveBeenCalledWith({
        id: 'jasmine-jsonDomReporter-done',
      });

      const result = await runPromise;
      expect(result).toEqual({ overallStatus: 'complete' });

      expect(reporter.jasmineStarted).toHaveBeenCalledWith({ things: 'stuff' });
      expect(reporter.suiteStarted).toHaveBeenCalledWith({ fullName: 'top' });
      expect(reporter.specStarted).toHaveBeenCalledWith({
        fullName: 'inner spec',
      });
      expect(reporter.specDone).toHaveBeenCalledWith({
        fullName: 'inner spec',
        status: 'passed',
      });
      expect(reporter.suiteDone).toHaveBeenCalledWith({
        fullName: 'top',
        status: 'passed',
      });
      expect(reporter.jasmineDone).toHaveBeenCalledWith({
        overallStatus: 'complete',
      });

      // executeScript is very unreliable on IE,
      // so make sure that we didn't use it.
      expect(driver.executeScript).not.toHaveBeenCalled();
    });
  });

  it('passes runtime options through to the browser', async function() {
    const getPromise = new Promise(function() {}),
      driver = jasmine.createSpyObj('webdriver', {
        get: getPromise,
      }),
      reporter = fakeReporter(),
      runner = new Runner({
        webdriver: driver,
        reporter: reporter,
        host: 'things',
      });

    runner.run({
      random: true,
      seed: 435,
      failFast: false,
      stopOnFailure: false,
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
      failFast: 'false',
      throwFailures: 'false',
      spec: 'specs and things',
    });
  });
});
