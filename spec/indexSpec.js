const { runSpecs, ConsoleReporter } = require('../');
const CustomReporter = require('./fixtures/custom_reporter');

describe('index', function() {
  beforeEach(function() {
    spyOn(console, 'log');
  });

  describe('runSpecs', function() {
    describe('Specifying the port', function() {
      beforeEach(function() {
        const server = (this.server = jasmine.createSpyObj('Server', [
          'start',
          'stop',
          'port',
          'scheme',
          'hostname',
        ]));
        server.start.and.callFake(() => Promise.reject(new Error('stop here')));
        const runner = jasmine.createSpyObj('Runner', ['run']);
        const buildWebdriver = jasmine
          .createSpy('buildWebdriver')
          .and.callFake(buildStubWebdriver);
        this.deps = {
          Server: function() {
            return server;
          },
          Runner: function() {
            return runner;
          },
          buildWebdriver,
          setExitCode: () => {},
        };

        this.waitForServerStart = async function(promise) {
          await expectAsync(promise).toBeRejectedWithError('stop here');
        };
      });

      describe('When not using or remote grid', function() {
        it('uses the specified port', async function() {
          const promise = runSpecs({ port: 12345 }, this.deps);
          await this.waitForServerStart(promise);

          expect(this.server.start).toHaveBeenCalledWith({ port: 12345 });
        });

        it('tells the server to pick a port if nothing is specified', async function() {
          const promise = runSpecs({}, this.deps);
          await this.waitForServerStart(promise);

          expect(this.server.start).toHaveBeenCalledWith({ port: 0 });
        });
      });

      describe('When using remote grid', function() {
        it('uses port 5555', async function() {
          const promise = runSpecs(
            {
              browser: {
                useRemoteSeleniumGrid: true,
              },
            },
            this.deps
          );
          await this.waitForServerStart(promise);

          expect(this.server.start).toHaveBeenCalledWith({ port: 5555 });
        });

        it('uses the specified port', async function() {
          spyOn(console, 'warn');
          const promise = runSpecs(
            {
              browser: {
                useRemoteSeleniumGrid: true,
              },
              port: 1234,
            },
            this.deps
          );
          await this.waitForServerStart(promise);

          expect(this.server.start).toHaveBeenCalledWith({ port: 1234 });
        });
      });
    });

    describe('Specifying the reporter that reports to the user', function() {
      it('uses the ConsoleReporter by default', async function() {
        const Runner = jasmine.createSpy('RunnerCtor').and.returnValue({
          run: async () => ({}),
        });
        const MockConsoleReporter = jasmine
          .createSpy('MockConsoleReporter')
          .and.returnValue(jasmine.createSpyObj('reporter', ['setOptions']));

        await runSpecs(
          { color: false, alwaysListPendingSpecs: false },
          {
            Runner,
            ConsoleReporter: MockConsoleReporter,
            Server: buildSpyServer,
            buildWebdriver: buildStubWebdriver,
          }
        );

        expect(Runner).toHaveBeenCalled();
        expect(MockConsoleReporter).toHaveBeenCalled();
        const reporter = MockConsoleReporter.calls.first().returnValue;
        expect(Runner.calls.argsFor(0)[0].reporters).toEqual([reporter]);
        expect(reporter.setOptions).toHaveBeenCalledWith({
          color: false,
          alwaysListPendingSpecs: false,
        });
      });

      describe('When custom reporters are specified', function() {
        it('includes them as well as the ConsoleReporter by default', async function() {
          const Runner = jasmine.createSpy('RunnerCtor').and.returnValue({
            run: async () => ({}),
          });

          await runSpecs(
            { reporters: ['./spec/fixtures/custom_reporter.js'] },
            {
              Runner,
              Server: buildSpyServer,
              buildWebdriver: buildStubWebdriver,
            }
          );

          expect(Runner).toHaveBeenCalled();
          expect(Runner.calls.argsFor(0)[0].reporters).toEqual([
            jasmine.any(ConsoleReporter),
            jasmine.any(CustomReporter),
          ]);
        });

        it('omits the console reporter when useConsoleReporter is false', async function() {
          const Runner = jasmine.createSpy('RunnerCtor').and.returnValue({
            run: async () => ({}),
          });

          await runSpecs(
            {
              reporters: ['./spec/fixtures/custom_reporter.js'],
              useConsoleReporter: false,
            },
            {
              Runner,
              Server: buildSpyServer,
              buildWebdriver: buildStubWebdriver,
            }
          );

          expect(Runner).toHaveBeenCalled();
          expect(Runner.calls.argsFor(0)[0].reporters).toEqual([
            jasmine.any(CustomReporter),
          ]);
        });
      });

      it('throws if useConsoleReporter is false but there are no custom reporters', async function() {
        const Runner = jasmine.createSpy('RunnerCtor').and.returnValue({
          run: async () => ({}),
        });

        const withNoReporters = runSpecs(
          {
            useConsoleReporter: false,
          },
          { Runner, Server: buildSpyServer, buildWebdriver: buildStubWebdriver }
        );
        const withEmptyReporters = runSpecs(
          {
            reporters: [],
            useConsoleReporter: false,
          },
          { Runner, Server: buildSpyServer, buildWebdriver: buildStubWebdriver }
        );

        await expectAsync(withNoReporters).toBeRejectedWithError(
          'No reporters were specified. Either add a reporter or remove ' +
            '`useConsoleReporter: false`.'
        );
        await expectAsync(withEmptyReporters).toBeRejectedWithError(
          'No reporters were specified. Either add a reporter or remove ' +
            '`useConsoleReporter: false`.'
        );
      });

      it('supports reporters that are ES modules', async function() {
        const Runner = jasmine.createSpy('RunnerCtor').and.returnValue({
          run: async () => ({}),
        });

        await runSpecs(
          {
            reporters: ['./spec/fixtures/esmReporter/reporter.js'],
          },
          { Runner, Server: buildSpyServer, buildWebdriver: buildStubWebdriver }
        );

        expect(Runner).toHaveBeenCalled();
        expect(Runner.calls.argsFor(0)[0].reporters).toEqual([
          jasmine.any(ConsoleReporter),
          jasmine.objectContaining({ isEsmReporter: true }),
        ]);
      });

      it('resolves reporters relative to the current working directory', async function() {
        const Runner = jasmine.createSpy('RunnerCtor').and.returnValue({
          run: async () => ({}),
        });

        process.chdir('spec');
        try {
          await runSpecs(
            {
              reporters: ['./fixtures/esmReporter/reporter.js'],
            },
            {
              Runner,
              Server: buildSpyServer,
              buildWebdriver: buildStubWebdriver,
            }
          );
        } finally {
          process.chdir('..');
        }

        expect(Runner).toHaveBeenCalled();
        expect(Runner.calls.argsFor(0)[0].reporters).toEqual([
          jasmine.any(ConsoleReporter),
          jasmine.objectContaining({ isEsmReporter: true }),
        ]);
      });

      it('rejects the promise when a reporter cannot be instantiated', async function() {
        const Runner = jasmine.createSpy('RunnerCtor').and.returnValue({
          run: async () => ({}),
        });

        const promise = runSpecs(
          {
            reporters: ['./no/such/module'],
          },
          { Runner, Server: buildSpyServer, buildWebdriver: buildStubWebdriver }
        );

        await expectAsync(promise).toBeRejectedWithError(
          /Failed to register reporter \.\/no\/such\/module: Cannot find module/
        );
      });

      it('supports passing an already-instantiated reporter', async function() {
        const reporter = {};
        const Runner = jasmine.createSpy('RunnerCtor').and.returnValue({
          run: async () => ({}),
        });

        await runSpecs(
          {
            reporters: [reporter],
          },
          { Runner, Server: buildSpyServer, buildWebdriver: buildStubWebdriver }
        );

        expect(Runner).toHaveBeenCalled();
        expect(Runner.calls.argsFor(0)[0].reporters[1]).toBe(reporter);
      });
    });

    describe('When the run completes', function() {
      it('resolves the returned promise to the run details', async function() {
        const server = buildSpyServer();
        server.start.and.returnValue(Promise.resolve(server));
        server.stop.and.returnValue(Promise.resolve());
        server.port.and.returnValue(0);
        const runner = jasmine.createSpyObj('Runner', ['run']);
        const details = {};
        runner.run.and.returnValue(Promise.resolve(details));

        const promise = runSpecs(
          {},
          {
            Server: function() {
              return server;
            },
            Runner: function() {
              return runner;
            },
            buildWebdriver: buildStubWebdriver,
            setExitCode: () => {},
          }
        );

        await expectAsync(promise).toBeResolvedTo(details);
      });

      it('sets the exit code to 0 when the run passes', async function() {
        const server = buildSpyServer();
        const runner = jasmine.createSpyObj('Runner', ['run']);
        runner.run.and.returnValue(
          Promise.resolve({ overallStatus: 'passed' })
        );
        const setExitCode = jasmine.createSpy('setExitCode');

        await runSpecs(
          {},
          {
            Server: function() {
              return server;
            },
            Runner: function() {
              return runner;
            },
            buildWebdriver: buildStubWebdriver,
            setExitCode,
          }
        );

        expect(setExitCode).toHaveBeenCalledWith(0);
      });

      it('sets the exit code to 3 when the run fails', async function() {
        const server = buildSpyServer();
        const runner = jasmine.createSpyObj('Runner', ['run']);
        runner.run.and.returnValue(
          Promise.resolve({ overallStatus: 'failed' })
        );
        const setExitCode = jasmine.createSpy('setExitCode');

        await runSpecs(
          {},
          {
            Server: function() {
              return server;
            },
            Runner: function() {
              return runner;
            },
            buildWebdriver: buildStubWebdriver,
            setExitCode,
          }
        );

        expect(setExitCode).toHaveBeenCalledWith(3);
      });

      it('sets the exit code to 1 when there are load errors', async function() {
        const server = buildSpyServer();
        const runner = jasmine.createSpyObj('Runner', ['run']);
        runner.run.and.returnValue(
          Promise.resolve({
            overallStatus: 'incomplete',
            failedExpectations: [
              { passed: false, globalErrorType: 'something else' },
              { passed: false, globalErrorType: 'load' },
            ],
          })
        );
        const setExitCode = jasmine.createSpy('setExitCode');

        await runSpecs(
          {},
          {
            Server: function() {
              return server;
            },
            Runner: function() {
              return runner;
            },
            buildWebdriver: buildStubWebdriver,
            setExitCode,
          }
        );

        expect(setExitCode).toHaveBeenCalledWith(1);
      });

      it('sets the exit code to 2 when the run is incomplete', async function() {
        const server = buildSpyServer();
        const runner = jasmine.createSpyObj('Runner', ['run']);
        runner.run.and.returnValue(
          Promise.resolve({ overallStatus: 'incomplete' })
        );
        const setExitCode = jasmine.createSpy('setExitCode');

        await runSpecs(
          {},
          {
            Server: function() {
              return server;
            },
            Runner: function() {
              return runner;
            },
            buildWebdriver: buildStubWebdriver,
            setExitCode,
          }
        );

        expect(setExitCode).toHaveBeenCalledWith(2);
      });

      describe('Sending the result to Saucelabs', function() {
        function hasSaucelabsResultReporting(browserConfig) {
          it('sets sauce:job-result to true when the run passes', async function() {
            const webdriver = await runWithSauceWithOverallStatus('passed');
            expect(webdriver.executeScript).toHaveBeenCalledWith(
              'sauce:job-result=true'
            );
          });

          it('sets sauce:job-result to false when the run fails', async function() {
            const webdriver = await runWithSauceWithOverallStatus('failed');
            expect(webdriver.executeScript).toHaveBeenCalledWith(
              'sauce:job-result=false'
            );
          });

          it('sets sauce:job-result to false when the run is incomplete', async function() {
            const webdriver = await runWithSauceWithOverallStatus('incomplete');
            expect(webdriver.executeScript).toHaveBeenCalledWith(
              'sauce:job-result=false'
            );
          });

          async function runWithSauceWithOverallStatus(overallStatus) {
            const server = buildSpyServer();
            const runner = jasmine.createSpyObj('Runner', ['run']);
            runner.run.and.returnValue(Promise.resolve({ overallStatus }));
            const webdriver = jasmine.createSpyObj('webdriver', [
              'close',
              'executeScript',
            ]);
            webdriver.close.and.returnValue(Promise.resolve());
            webdriver.executeScript.and.returnValue(Promise.resolve());
            await runSpecs(
              { browser: browserConfig },
              {
                Server: function() {
                  return server;
                },
                Runner: function() {
                  return runner;
                },
                buildWebdriver: () => webdriver,
              }
            );

            return webdriver;
          }
        }

        function doesNotHaveSaucelabsResultReporting(browserConfig) {
          it('does not set sauce:job-result', async function() {
            const server = buildSpyServer();
            const runner = jasmine.createSpyObj('Runner', ['run']);
            runner.run.and.returnValue(
              Promise.resolve({ overallStatus: 'passed' })
            );
            const webdriver = jasmine.createSpyObj('webdriver', [
              'close',
              'executeScript',
            ]);
            webdriver.close.and.returnValue(Promise.resolve());
            webdriver.executeScript.and.returnValue(Promise.resolve());
            await runSpecs(
              { browser: browserConfig },
              {
                Server: function() {
                  return server;
                },
                Runner: function() {
                  return runner;
                },
                buildWebdriver: () => webdriver,
              }
            );

            expect(webdriver.executeScript).not.toHaveBeenCalledWith(
              jasmine.stringContaining('sauce:job-result')
            );
          });
        }

        describe('When the remote grid URL includes saucelabs.com', function() {
          hasSaucelabsResultReporting({
            useRemoteSeleniumGrid: true,
            remoteSeleniumGrid: {
              url: 'https://ondemand.saucelabs.com/wd/hub',
            },
          });
        });

        describe('When the remote grid URL does not include saucelabs.com', function() {
          doesNotHaveSaucelabsResultReporting({
            useRemoteSeleniumGrid: true,
            remoteSeleniumGrid: {
              url: 'https://some-other-grid.example.com/',
            },
          });
        });

        describe('In all other cases', function() {
          doesNotHaveSaucelabsResultReporting({});
        });
      });

      it('stops the server', async function() {
        const server = buildSpyServer();
        const runner = jasmine.createSpyObj('Runner', ['run']);
        let rejectRun;
        runner.run.and.returnValue(
          new Promise((res, rej) => (rejectRun = rej))
        );

        const promise = runSpecs(
          {},
          {
            Server: function() {
              return server;
            },
            Runner: function() {
              return runner;
            },
            buildWebdriver: buildStubWebdriver,
            setExitCode: () => {},
          }
        );

        expect(server.stop).not.toHaveBeenCalled();
        await expectAsync(promise).toBePending();
        const error = new Error('nope');
        rejectRun(error);
        await expectAsync(promise).toBeRejectedWithError('nope');
        expect(server.stop).toHaveBeenCalled();
      });
    });

    describe('When the run fails to complete', function() {
      it('stops the server', async function() {
        const server = jasmine.createSpyObj('Server', [
          'start',
          'stop',
          'port',
          'scheme',
          'hostname',
        ]);
        server.start.and.returnValue(Promise.resolve(server));
        server.stop.and.returnValue(Promise.resolve());
        server.port.and.returnValue(0);
        const runner = jasmine.createSpyObj('Runner', ['run']);
        let rejectRun;
        runner.run.and.returnValue(
          new Promise((res, rej) => (rejectRun = rej))
        );

        const promise = runSpecs(
          {},
          {
            Server: function() {
              return server;
            },
            Runner: function() {
              return runner;
            },
            buildWebdriver: buildStubWebdriver,
            setExitCode: () => {},
          }
        );

        expect(server.stop).not.toHaveBeenCalled();
        await expectAsync(promise).toBePending();
        const error = new Error('nope');
        rejectRun(error);
        await expectAsync(promise).toBeRejectedWithError('nope');
        expect(server.stop).toHaveBeenCalled();
      });
    });

    it('does not launch a browser if the server fails to start', async function() {
      const server = jasmine.createSpyObj('Server', [
        'start',
        'stop',
        'port',
        'scheme',
        'hostname',
      ]);
      server.start.and.returnValue(Promise.reject(new Error('nope')));
      const runner = jasmine.createSpyObj('Runner', ['run']);
      const buildWebdriver = jasmine
        .createSpy('buildWebdriver')
        .and.callFake(buildStubWebdriver);

      const promise = runSpecs(
        {},
        {
          Server: function() {
            return server;
          },
          Runner: function() {
            return runner;
          },
          buildWebdriver,
          setExitCode: () => {},
        }
      );

      await expectAsync(promise).toBeRejected();
      expect(buildWebdriver).not.toHaveBeenCalled();
    });

    it('stops the browser and server if the runner fails to start', async function() {
      const server = jasmine.createSpyObj('Server', [
        'start',
        'stop',
        'port',
        'scheme',
        'hostname',
      ]);
      server.start.and.returnValue(Promise.resolve(server));
      server.stop.and.returnValue(Promise.resolve());
      server.port.and.returnValue(0);
      const webdriver = jasmine.createSpyObj('webdriver', [
        'close',
        'executeScript',
      ]);
      webdriver.close.and.returnValue(Promise.resolve());

      const promise = runSpecs(
        {},
        {
          Server: function() {
            return server;
          },
          Runner: function() {
            throw new Error('nope');
          },
          buildWebdriver: function() {
            return webdriver;
          },
          setExitCode: () => {},
        }
      );

      await expectAsync(promise).toBeRejected();
      expect(webdriver.close).toHaveBeenCalled();
      expect(server.stop).toHaveBeenCalled();
    });
  });
});

function buildStubWebdriver() {
  return {
    close: () => Promise.resolve(),
    executeScript: () => Promise.resolve(),
  };
}

function buildSpyServer() {
  const server = jasmine.createSpyObj('Server', [
    'start',
    'stop',
    'port',
    'scheme',
    'hostname',
  ]);
  server.start.and.returnValue(Promise.resolve(server));
  server.stop.and.returnValue(Promise.resolve());
  server.port.and.returnValue(0);
  server.scheme.and.returnValue('http');
  return server;
}
