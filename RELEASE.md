# To make a release

## Prepare the release

1. Make sure that all specs are green on CI.
2. Make sure the `jasmine-core` peer dependency and the `jasmine-core` and
   `jasmine` dev dependencies are correct (pointing to a release rather than
    github, and the version number is right)
     * If you change any, push the changes and wait for CI to go green.
3. Generate release notes in `release_notes` using the Anchorman gem and edit
them.
    * Include a table of supported Node versions and browsers. Check Saucelabs
      for the current version of evergreen browsers (everything that doesn't
      have a version specified in jasmine-core's scripts/run-all-browsers).
4. Update the version in `package.json`.
5. Commit the release notes and `package.json` change.
6. Push.
7. Wait for Circle CI to go green again.

## Publish the NPM package

1. Create a tag for the version, e.g. `git tag v1.2.0`.
2. Push the tag: `git push --tags`
3. Publish the NPM package: `npm publish`.

## Publish the GitHub release

1. Visit the GitHub releases page and find the tag just published.
2. Paste in a link to the correct release notes for this release.
3. If it is a pre-release, mark it as such.
4. Publish the release.