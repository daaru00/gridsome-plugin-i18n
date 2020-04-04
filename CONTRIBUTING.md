#  Contributing

If you want to contribute to this plugin open fork it and open a PR. 
Will be discussed, merged into master branch and then published with a new plugin version

## Getting started

Clone this repository:
```bash
git clone git@github.com:daaru00/gridsome-plugin-i18n.git
```
then enter into directory and create a NPM link:
```bash
cd gridsome-plugin-i18n
sudo npm link
```

Open a existing Gridsome project or create a new one:
```bash
gridsome create my-gridsome-site
cd my-gridsome-site
```

Install plugin using NPM link:
```
npm link gridsome-plugin-i18n
```

Add Gridsome i18n plugin configuration into `gridsome.config.js`:
```js
module.exports = {
  plugins: [
    // ...
    {
      use: "gridsome-plugin-i18n",
      options: {
        // ...
      }
    }
  ]
}
```

Test with multiple languages configured to emulate a real use case.

## Git management

This repository use [GitHub flow](https://guides.github.com/introduction/flow/) to manage feature branches.

### New feature

If adding a new feature create a `feature/*` branch, for example `feature/my-nice-feature`.
When finish to develop open a PR with `master` as target.

### Bug fix

If fixing a bug create a `fix/*` branch, for example `fix/not-working-thing`.
When finish to develop open a PR with `master` as target.

### Real real real urgent fix

If there is a huge bug with a critical priority (like a vulnerability report from NPM) directly push in master and fix it.

## Deploy

In order to deploy a new NPM package version bump version into `package.json`:
```js
{
  "name": "gridsome-plugin-i18n",
  "version": "1.1.2" // change this
}
```
then run a fresh
```bash
npm install
```
to update also `package-lock.json`.

Create a tag to commit repository and a GitHub action will automatically publish a new NPM package version.
