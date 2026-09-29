<h1 align="center">release-it-action</h1>

<p align="center">
	Runs release-it as a GitHub Action, with handling for semantic releases and protected branches.
	📤
</p>

<p align="center">
	<!-- prettier-ignore-start -->
	<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
	<a href="#contributors" target="_blank"><img alt="👪 All Contributors: 4" src="https://img.shields.io/badge/%F0%9F%91%AA_all_contributors-4-21bb42.svg" /></a>
<!-- ALL-CONTRIBUTORS-BADGE:END -->
	<!-- prettier-ignore-end -->
	<a href="https://github.com/JoshuaKGoldberg/release-it-action/blob/main/.github/CODE_OF_CONDUCT.md" target="_blank"><img alt="🤝 Code of Conduct: Kept" src="https://img.shields.io/badge/%F0%9F%A4%9D_code_of_conduct-kept-21bb42" /></a>
	<a href="https://codecov.io/gh/JoshuaKGoldberg/release-it-action" target="_blank"><img alt="🧪 Coverage" src="https://img.shields.io/codecov/c/github/JoshuaKGoldberg/release-it-action?label=%F0%9F%A7%AA%20coverage" /></a>
	<a href="https://github.com/JoshuaKGoldberg/release-it-action/blob/main/LICENSE.md" target="_blank"><img alt="📝 License: MIT" src="https://img.shields.io/badge/%F0%9F%93%9D_license-MIT-21bb42.svg" /></a>
	<a href="http://npmjs.com/package/release-it-action" target="_blank"><img alt="📦 npm version" src="https://img.shields.io/npm/v/release-it-action?color=21bb42&label=%F0%9F%93%A6%20npm" /></a>
	<img alt="💪 TypeScript: Strict" src="https://img.shields.io/badge/%F0%9F%92%AA_typescript-strict-21bb42.svg" />
</p>

## Why?

[`release-it`](https://github.com/release-it/release-it) is a great tool for releasing packages.
But running it in CI takes more than `npx release-it`.
You need to set up Git and npm first.
You probably don't want a new version for every push.
Pushes that land close together can also break a release halfway through.

This action takes care of all that for you.

## What It Does

Each time it runs, the action:

1. Sets up the Git user for release commits
2. Sets up your npm token, if you gave one
3. Finishes any earlier release that didn't make it to npm
4. Skips releasing if [`should-semantic-release`](https://github.com/JoshuaKGoldberg/should-semantic-release) says there's nothing to release
5. Runs `npx release-it --verbose`

If step 3 finds a release to finish, the run ends there.
See [What happens when a release gets pushed but not published?](#what-happens-when-a-release-gets-pushed-but-not-published)

If a newer commit lands on the branch during step 5, the action exits without failing.
See [What happens when a newer commit lands during a release?](#what-happens-when-a-newer-commit-lands-during-a-release)

The action can also get around branch protections or rulesets during step 5.
You probably don't need that.
See [the FAQs](#why-is-there-an-option-to-bypass-branch-protections) before you use it.

## Usage

Run `JoshuaKGoldberg/release-it-action` in a GitHub workflow after building your code:

```yml
concurrency:
  group: ${{ github.workflow }}

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
        with:
          fetch-depth: 0
          ref: main
      - run: npm run build
      - env:
          GITHUB_TOKEN: ${{ secrets.ACCESS_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
        uses: JoshuaKGoldberg/release-it-action@v0.5.6

name: Release

on:
  push:
    branches:
      - main

permissions:
  contents: write
  id-token: write
```

You can leave out `NPM_TOKEN` if you use npm's [Trusted Publishing](https://docs.npmjs.com/trusted-publishers).

### Recommended `release-it` Config

It's recommended to have `release-it` push the release commit before it publishes to npm.
Then if a newer push wins the race, nothing gets published.
It also lets step 3 finish any release that fails to publish.

```json
{
	"git": {
		"pushArgs": ["--follow-tags", "--atomic"]
	},
	"hooks": {
		"after:git:release": "npm publish"
	},
	"npm": {
		"publish": false
	}
}
```

Skip this if you set `skip-npm-publish`.
The hook would still publish to npm.

## Options

| Key                         | Type      | Default                                       | Description                                                    |
| --------------------------- | --------- | --------------------------------------------- | -------------------------------------------------------------- |
| `bypass-branch-protections` | `string`  | _(none)_                                      | A branch to delete and recreate branch protections on.         |
| `bypass-branch-rulesets`    | `string`  | _(none)_                                      | A branch to temporarily disable repository rulesets on.        |
| `git-user-email`            | `string`  | `${<git-user-name>}@users.noreply.github.com` | `git config user.email` value for Git commits.                 |
| `git-user-name`             | `string`  | `${github.context.actor}`                     | `git config user.name` value for Git commits.                  |
| `github-token`              | `string`  | `${GITHUB_TOKEN}`                             | GitHub token (PAT) with _repo_ and _workflow_ permissions.     |
| `npm-token`                 | `string`  | `${NPM_TOKEN}`                                | npm access token. Not needed with Trusted Publishing.          |
| `release-it-args`           | `string`  | `""`                                          | Any arbitrary arguments to pass to `npx release-it --verbose`. |
| `skip-npm-publish`          | `boolean` | `false`                                       | Whether to skip publishing to npm.                             |

### Node API

`release-it-action` can be installed as a dependency that exports a `releaseItAction` function:

```shell
npm i release-it-action
```

```ts
import { releaseItAction } from "release-it-action";

await releaseItAction({
	githubToken: process.env.GITHUB_TOKEN,
	gitUserEmail: "your@email.com",
	gitUserName: "YourUsername",
	npmToken: process.env.NPM_TOKEN,
	owner: "YourUsername",
	releaseItArgs: "--preRelease=beta",
	repo: "your-repository",
});
```

The Node API doesn't read action inputs or environment variables.
Pass in every value you need yourself.

## FAQs

### Why does the checkout action run on the branch with full history?

`release-it-action` needs to run on the latest commit of your release branch.
It also needs a [concurrency group](https://docs.github.com/en/actions/using-jobs/using-concurrency) so only one release runs at a time.
Otherwise a later run might miss the release commit from an earlier run.

### What happens when a release gets pushed but not published?

Sometimes a release gets pushed to GitHub without making it to npm.
The next run looks at the version in `package.json`.
If that version has a Git tag and isn't on npm yet, the action publishes it.
It doesn't make a new commit or tag.
It also creates the GitHub release if there isn't one yet.

Sometimes npm says the version already exists.
That means an earlier run published it after all.
The action treats that as a success.

The version's tag has to be on the latest commit for this to work.
Otherwise the action fails.
You'll need to publish that version yourself before newer releases can go out.

### What happens when a newer commit lands during a release?

Two pushes close together can start two release runs.
The first run's push to GitHub fails if the branch already has a newer commit.
The action spots that and exits without failing.
The run for the newer commit will do the release instead.

### Why is there an option to bypass branch protections?

**The `bypass-branch-protections` option is not recommended.**

Some repositories have strict older branch protections.
Those can make it hard for automation to push to the `main` branch.
Bypassing them lets `release-it` push its Git commits.

It's recommended to instead use GitHub's newer [repository rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets).

#### Why does the option delete and recreate branch protections?

GitHub doesn't have an API to turn off a branch protection rule.
Deleting and recreating the rule is the only way at time of writing.
If you know of one now, please do file an issue!

### Why is there an option to bypass branch rulesets?

**The `bypass-branch-rulesets` option is not recommended.**

Repository [rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets) can let specific users or apps skip them.
It's recommended to instead add the user or app behind your `github-token` to the ruleset's bypass list.

If that isn't possible, `bypass-branch-rulesets` will disable each repository ruleset for the branch.
It puts them back how they were after `release-it` finishes.
Organization-level rulesets are left as-is.

## Development

See [`.github/CONTRIBUTING.md`](./.github/CONTRIBUTING.md), then [`.github/DEVELOPMENT.md`](./.github/DEVELOPMENT.md).
Thanks! 📤

## Contributors

<!-- spellchecker: disable -->
<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="http://www.joshuakgoldberg.com/"><img src="https://avatars.githubusercontent.com/u/3335181?v=4?s=100" width="100px;" alt="Josh Goldberg ✨"/><br /><sub><b>Josh Goldberg ✨</b></sub></a><br /><a href="https://github.com/JoshuaKGoldberg/release-it-action/commits?author=JoshuaKGoldberg" title="Code">💻</a> <a href="#content-JoshuaKGoldberg" title="Content">🖋</a> <a href="https://github.com/JoshuaKGoldberg/release-it-action/commits?author=JoshuaKGoldberg" title="Documentation">📖</a> <a href="#ideas-JoshuaKGoldberg" title="Ideas, Planning, & Feedback">🤔</a> <a href="#infra-JoshuaKGoldberg" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="#maintenance-JoshuaKGoldberg" title="Maintenance">🚧</a> <a href="#projectManagement-JoshuaKGoldberg" title="Project Management">📆</a> <a href="#tool-JoshuaKGoldberg" title="Tools">🔧</a> <a href="https://github.com/JoshuaKGoldberg/release-it-action/issues?q=author%3AJoshuaKGoldberg" title="Bug reports">🐛</a> <a href="https://github.com/JoshuaKGoldberg/release-it-action/commits?author=JoshuaKGoldberg" title="Tests">⚠️</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://navinmoorthy.me/"><img src="https://avatars.githubusercontent.com/u/39694575?v=4?s=100" width="100px;" alt="Navin Moorthy"/><br /><sub><b>Navin Moorthy</b></sub></a><br /><a href="#tool-navin-moorthy" title="Tools">🔧</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/markEHVN"><img src="https://avatars.githubusercontent.com/u/179693285?v=4?s=100" width="100px;" alt="markehvn"/><br /><sub><b>markehvn</b></sub></a><br /><a href="#tool-markehvn" title="Tools">🔧</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/michaelfaith"><img src="https://avatars.githubusercontent.com/u/8071845?v=4?s=100" width="100px;" alt="michael faith"/><br /><sub><b>michael faith</b></sub></a><br /><a href="https://github.com/JoshuaKGoldberg/release-it-action/issues?q=author%3Amichaelfaith" title="Bug reports">🐛</a> <a href="https://github.com/JoshuaKGoldberg/release-it-action/commits?author=michaelfaith" title="Code">💻</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->
<!-- spellchecker: enable -->

> 💝 This package was templated with [`create-typescript-app`](https://github.com/JoshuaKGoldberg/create-typescript-app) using the [Bingo engine](https://create.bingo).
