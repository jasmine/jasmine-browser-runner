To make a release:

1. Make sure that all specs are green on CI.
2. Make sure the `jasmine-core` dependency is correct (pointing to a release
   rather than github, and the version number is right)
	 * If you change it, push the change and wait for CI to go green.
3. Generate release notes in `release_notes` using the Anchorman gem and edit
them.
    * Include a table of supported Node versions and browsers. Check Saucelabs
      for the current version of evergreen browsers (everything that doesn't
      have a version specified in jasmine-core's scripts/run-all-browsers).
4. Update the version in `package.json`.
5. Commit the release notes and `package.json` change.
6. Run `npm adduser` to save your credentials locally.
7. Run `npm run release`. This will tag the commit, push to GitHub, and release
    the NPM package.
