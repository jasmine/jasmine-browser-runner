# To make a release

## Prepare the release

1. Make sure that all specs are green on CI. Also test in Safari via
   [jasmine-core's CI](https://github.com/jasmine/jasmine/actions/workflows/safari.yml). 
2. Make sure the `jasmine-core` peer dependency and the `jasmine-core` and
   `jasmine` dev dependencies are correct (pointing to a release rather than
    github, and the version number is right)
     * If you change any, push the changes and wait for CI to go green.
3. Generate release notes in `release_notes` using the Anchorman gem and edit
them.
    * Include a table of supported Node versions and browsers. To get the
      currently tested versions of evergreen browsers (everything that doesn't
      have a version specified in jasmine-core's scripts/run-all-browsers),
      trigger a jasmine-core build on Circle CI and check 
      <https://app.saucelabs.com/dashboard/tests/vdc> after it finishes. To get
      the currently tested version of Safari, check the output of the "Report
      Safari version" step of the GitHub Action run that you triggered in
      step 1.
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