// JSDoc comments that don't have any obvious place to go in the code. These
// are mainly for interfaces that describe user-provided objects.

/**
 * @interface ServerCtorOptions
 * @classdesc Specifies the configuration for {@link Server}. The only required
 * properties are specDir and srcDir, although in practice you'll almost
 * certainly want to provide at least specFiles and srcFiles as well.
 * @see Server
 */
/**
 * Whether to remove Jasmine's default reporters before executing the suite.
 * @name ServerCtorOptions#clearReporters
 * @type boolean | undefined
 */
/**
 * An array of CSS file paths or {@link https://github.com/isaacs/node-glob#glob-primer|globs}
 * that match CSS files. Each path or glob will be evaluated relative to
 * {@link ServerCtorOptions#srcDir}.
 * @name ServerCtorOptions#cssFiles
 * @type string[] | undefined
 */
/**
 * An array of helper file paths or {@link https://github.com/isaacs/node-glob#glob-primer|globs}
 * that match helper files. Each path or glob will be evaluated relative to
 * {@link ServerCtorOptions#specDir}. Helpers are loaded before specs.
 * @name ServerCtorOptions#helpers
 * @type string[] | undefined
 */
/**
 * The instance of jasmine-core to use. Use this if you need to load
 * jasmine-core in a nonstandard way. Most of the time it should be omitted.
 * @name ServerCtorOptions#jasmineCore
 * @type any | undefined
 */
/**
 * The port to listen on.
 * @name ServerCtorOptions#port
 * @type number | undefined
 */
/**
 * The root directory of the project.
 * @name ServerCtorOptions#projectBaseDir
 * @type string | undefined
 */
/**
 * The directory that spec files are contained in, relative to
 * {@link ServerCtorOptions#projectBaseDir}.
 * @name ServerCtorOptions#specDir
 * @type string
 */
/**
 * An array of spec file paths or {@link https://github.com/isaacs/node-glob#glob-primer|globs}
 * that match spec files. Each path or glob will be evaluated relative to
 * {@link ServerCtorOptions#specDir}.
 * @name ServerCtorOptions#specFiles
 * @type string[] | undefined
 */
/**
 * The directory that source files are contained in, relative to
 * {@link ServerCtorOptions#projectBaseDir}.
 * @name ServerCtorOptions#srcDir
 * @type string
 */
/**
 * An array of sourec file paths or {@link https://github.com/isaacs/node-glob#glob-primer|globs}
 * that match source files. Each path or glob will be evaluated relative to
 * {@link ServerCtorOptions#srcDir}.
 * @name ServerCtorOptions#srcFiles
 * @type string[] | undefined
 */

/**
 * @interface RunSpecsOptions
 * @augments ServerCtorOptions
 * @augments RunnerRunOptions
 */
/**
 * The browser to run the specs in.
 * @name RunSpecsOptions#browser
 * @type string | BrowserInfo | undefined
 */
/**
 * Whether to use color in the console output. Defaults to true.
 * @name RunSpecsOptions#color
 * @type boolean | undefined
 */
/**
 * The name of a module to get a reporter from. The module will be loaded
 * using `require` and its default export must be a constructor that creates a
 * {@link https://jasmine.github.io/api/edge/Reporter.html|reporter}.
 * @name RunSpecsOptions#color
 * @type boolean | undefined
 */

/**
 * Describes a web browser.
 * @interface BrowserInfo
 */
/**
 * Whether to run the specs on {@link https://saucelabs.com/|Saucelabs}.
 * Defaults to false.
 * @name BrowserInfo#useSauce
 * @type boolean | undefined
 */
/**
 * The browser name. Valid values include "internet explorer", "firefox",
 * "safari", "MicrosoftEdge", "chrome", and "headlessChrome".
 * @name BrowserInfo#name
 * @type string | undefined
 */
/**
 * Configuration for running specs on {@link https://saucelabs.com/|Saucelabs}
 * @name BrowserInfo#sauce
 * @type SauceConfig | undefined
 */

/**
 * Configuration for running specs on {@link https://saucelabs.com/|Saucelabs}
 * @interface SauceConfig
 */
/**
 * Saucelabs username
 * @name SauceConfig#username
 * @type string
 */
/**
 * Saucelabs access key
 * @name SauceConfig#accessKey
 * @type string
 */
/**
 * Browser version. Omit this to use the latest version of the specified browser.
 * @name SauceConfig#browserVersion
 * @type string
 */
/**
 * Identifier of the Sauce Connect tunnel to use.
 * @name SauceConfig#tunnelIdentifier
 * @type string
 */
/**
 * Operating system to run the browser on.
 *
 * _Note_: It's best to omit this property
 * unless you really need your specs to run on a specific OS. If you omit it,
 * Saucelabs will select a suitable OS. If you specify an unsupported combination
 * of os and browserVersion, Saucelabs will select a different browser version
 * that's available on the specified OS.
 * @name SauceConfig#os
 * @type string
 */
/**
 * Build identifier to pass to Saucelabs
 * @name SauceConfig#build
 * @type string
 */
/**
 * Tags to pass to Saucelabs
 * @name SauceConfig#tags
 * @type Array.<string>
 */

/**
 * Options passed to {@link Server#start}
 * @interface
 * @name ServerStartOptions
 */
/**
 * The port number to listen on.
 * @name ServerStartOptions#port
 * @type number | undefined
 */
