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
But running it in CI takes more work than `npx release-it`.
You need to set up Git and npm first.
You probably want safe handling for consecutive branch pushes during your release flow.
And if things go wrong, you want informative error reporting to explain what happened.

This action handles all of that for you.

## What It Does

Each time it runs, the action:

1. Sets up the Git user for release commits
2. Sets up your npm token, if you gave one
3. Finishes any [earlier release that didn't make it to npm or GitHub releases](#what-happens-when-a-release-gets-pushed-but-not-published), then stops
4. Stops if [`should-semantic-release`](https://github.com/JoshuaKGoldberg/should-semantic-release) says there's nothing to release
5. Runs `npx release-it --verbose`

It also adds in safe handling for common corner cases such as npm being slow to recognize new versions.

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
          token: ${{ secrets.ACCESS_TOKEN }}
      - run: npm run build
      - env:
          GITHUB_TOKEN: ${{ secrets.ACCESS_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
        uses: JoshuaKGoldberg/release-it-action@v0.5.28

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

It's strongly recommended to have `release-it` push before it publishes to npm.
Then if a newer push wins the race, nothing gets published.
It also lets step 3 finish any release that fails to publish.

```json
{
	"git": {
		"pushArgs": ["--follow-tags", "--atomic"]
	},
	"hooks": {
		"after:git:release": "npm publish${isPreRelease ? ' --tag ' + (preReleaseId || 'next') : ''}"
	},
	"npm": {
		"publish": false
	}
}
```

Prereleases publish under their own dist-tag, such as `beta` for `1.2.0-beta.0` or `next` for `1.2.0-0`, since newer versions of npm require a `--tag` for them.
Stable releases leave out `--tag` so that newer versions of npm can refuse to move `latest` back to an older version.
Step 3 skips release-it's npm authentication checks itself, so it can republish a stranded version even without an npm token, such as with Trusted Publishing.

> Tip: releasing from a maintenance branch?
> Set `"tag"` under `"npm"` to that branch's dist-tag, which step 3 also uses, and change the hook to `npm publish --tag ${npm.tag}`.

Skip this if you set `skip-npm-publish`, since the hook would still publish.

## Options

| Key                         | Type      | Default                                       | Description                                                    |
| --------------------------- | --------- | --------------------------------------------- | -------------------------------------------------------------- |
| `bypass-branch-protections` | `string`  | _(none)_                                      | A branch to delete and recreate branch protections on.         |
| `bypass-branch-rulesets`    | `string`  | _(none)_                                      | A branch to temporarily disable repository rulesets on.        |
| `git-user-email`            | `string`  | `${<git-user-name>}@users.noreply.github.com` | `git config user.email` value for Git commits.                 |
| `git-user-name`             | `string`  | `${github.context.actor}`                     | `git config user.name` value for Git commits.                  |
| `github-token`              | `string`  | `${GITHUB_TOKEN}`                             | GitHub token (PAT) with _repo_ and _workflow_ permissions.     |
| `npm-token`                 | `string`  | `${NPM_TOKEN}`                                | npm access token (not needed with Trusted Publishing)          |
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

The Node API doesn't read action inputs or change `process.env`.
It passes `githubToken` to `release-it` as the `GITHUB_TOKEN` environment variable.
Other environment variables still apply, such as `GITHUB_API_URL` for its GitHub API requests.

## FAQs

### Why does the checkout action run on the branch with full history?

The action needs the latest commit of your release branch.
The [concurrency group](https://docs.github.com/en/actions/using-jobs/using-concurrency) keeps later runs from missing earlier release commits.

### Why does the checkout action need a token?

`release-it` pushes with the credentials saved by `actions/checkout`, which default to the workflow's `GITHUB_TOKEN`.
Pushes made with `GITHUB_TOKEN` don't trigger workflows.
Checking out with your PAT lets the release commit start its own run, which is how the next section's recovery gets to happen on its own.
It also makes the push come from your PAT's user, which matters for ruleset bypass lists.

### What happens when a release gets pushed but not published?

Sometimes a release gets pushed to GitHub without making it to npm.
The next run publishes that version without making a new commit or tag.
It also creates the GitHub release if it's missing.

This only works if the version's Git tag is on the latest commit.
Otherwise the action fails until you publish that version yourself, or bump the version manually if npm won't accept it again.

The check assumes your package belongs on npm.
If it doesn't, set `skip-npm-publish` or mark the package as `"private": true`.
Otherwise every push fails as an unpublished version.

A release can also get pushed without its GitHub release, such as when creating the release fails after the npm publish.
If that version's Git tag is on the latest commit, the next run creates the missing GitHub release.
This only happens when `github.release` is `true` in your `.release-it.json` or `package.json`'s `"release-it"`.

### What happens when a newer commit lands during a release?

Two pushes close together can start two release runs.
The first run's push fails because the branch has a newer commit.
The action exits without failing so the newer run can do the release.

This relies on the [recommended config](#recommended-release-it-config) pushing before publishing.

### Why is there an option to bypass branch protections?

**The `bypass-branch-protections` option is not recommended.**

Some repositories have strict older branch protections that block pushes to `main`.
This option lets `release-it` push anyway.
Use GitHub's newer [repository rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets) instead.

#### Why does the option delete and recreate branch protections?

GitHub doesn't have an API to turn off a branch protection rule.
Deleting and recreating it is the only way at time of writing.
If you know of one, please do file an issue!

### Why is there an option to bypass branch rulesets?

**The `bypass-branch-rulesets` option is not recommended.**

Rulesets can let specific users or apps bypass them.
Add the user or app behind your `github-token` to the ruleset's bypass list instead.
If you can't, this option disables the branch's repository rulesets while `release-it` runs.
Organization rulesets aren't changed.

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
