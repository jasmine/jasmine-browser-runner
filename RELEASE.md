To make a release:

1. Make sure that all specs are green on CI.
2. Generate release notes in `release_notes` using the Anchorman gem and edit
them.
3. Update the version in `package.json`.
4. Commit the release notes and `package.json` change.
5. Tag the commit.
6. `git push --tags` and wait for Circle CI to go green.
7. Run `npm adduser` to save your credentials locally.
8. Run `npm publish .` to publish the package.
