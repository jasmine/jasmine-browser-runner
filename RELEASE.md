To make a release:

1. Make sure that all specs are green on CI.
2. Generate release notes in `release_notes` using the Anchorman gem and edit
them.
    * Include a table of supported Node versions and browsers.
3. Update the version in `package.json`.
4. Commit the release notes and `package.json` change.
5. Run `npm adduser` to save your credentials locally.
6. Run `npm run release`. This will tag the commit, push to GitHub, and release
    the NPM package.
