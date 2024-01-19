<h1 align="center">release-it-action</h1>

<p align="center">Runs release-it as a GitHub Action, with handling for semantic releases and protected branches. 📤</p>

<p align="center">
	<a href="#contributors" target="_blank">
<!-- prettier-ignore-start -->
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
<img alt="All Contributors: 1" src="https://img.shields.io/badge/all_contributors-1-21bb42.svg" />
<!-- ALL-CONTRIBUTORS-BADGE:END -->
<!-- prettier-ignore-end -->
</a>
	<a href="https://codecov.io/gh/JoshuaKGoldberg/release-it-action" target="_blank"><img alt="Codecov Test Coverage" src="https://codecov.io/gh/JoshuaKGoldberg/release-it-action/branch/main/graph/badge.svg"/></a>
	<a href="https://github.com/JoshuaKGoldberg/release-it-action/blob/main/.github/CODE_OF_CONDUCT.md" target="_blank"><img alt="Contributor Covenant" src="https://img.shields.io/badge/code_of_conduct-enforced-21bb42" /></a>
	<a href="https://github.com/JoshuaKGoldberg/release-it-action/blob/main/LICENSE.md" target="_blank"><img alt="License: MIT" src="https://img.shields.io/github/license/JoshuaKGoldberg/release-it-action?color=21bb42"></a>
	<img alt="Style: Prettier" src="https://img.shields.io/badge/style-prettier-21bb42.svg" />
	<img alt="TypeScript: Strict" src="https://img.shields.io/badge/typescript-strict-21bb42.svg" />
	<img alt="npm package version" src="https://img.shields.io/npm/v/release-it-action?color=21bb42" />
</p>

## Usage

This action works by:

1. Checking [`should-semantic-release`](https://github.com/JoshuaKGoldberg/should-semantic-release) for whether a new release is necessary, and bailing if not
2. Fetching any existing branch protections for the configured branch, and temporarily deleting them if found
3. Running [`release-it`](https://github.com/release-it/release-it)
4. Restoring any temporarily deleted branch protections

Run `JoshuaKGoldberg/release-it-action` in a GitHub workflow after building your code and setting your npm token:

```yml
concurrency:
  group: ${{ github.workflow }}

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
          ref: main
      - run: npm build
      - env:
          GITHUB_TOKEN: ${{ secrets.ACCESS_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
        uses: JoshuaKGoldberg/release-it-action@v0.2.2

name: Release

on:
  push:
    branches:
      - main

permissions:
  contents: write
  id-token: write
```

## Options

| Key                       | Type      | Default                                       | Description                                                                             |
| ------------------------- | --------- | --------------------------------------------- | --------------------------------------------------------------------------------------- |
| `branch`                  | `string`  | `"main"`                                      | Branch to delete and recreate branch protections on (unless `skip-branch-protections`). |
| `git-user-email`          | `string`  | `${<git-user-name>}@users.noreply.github.com` | `git config user.email` value for Git commits.                                          |
| `git-user-name`           | `string`  | `${github.context.actor}`                     | `git config user.name` value for Git commits.                                           |
| `github-token`            | `string`  | `${GITHUB_TOKEN}`                             | GitHub token (PAT) with _repo_ and _workflow_ permissions.                              |
| `npm-token`               | `string`  | `${NPM_TOKEN}`                                | npm access token with the _automation_ role.                                            |
| `skip-branch-protections` | `boolean` | `false`                                       | Whether to skip deleting and recreating branch protections.                             |

### Node API

`release-it-action` can be installed as a dependency that exports a `releaseItAction` function:

```shell
npm i release-it-action
```

```ts
import { releaseItAction } from "release-it-action";

await releaseItAction({
	branch: "main",
	gitUserEmail: "your@email.com",
	gitUserName: "YourUsername",
	githubToken: process.env.GITHUB_TOKEN,
	npmToken: process.env.NPM_TOKEN,
	owner: "YourUsername",
	repo: "your-repository",
});
```

Note that all non-`boolean` inputs are required and do not have default values in the Node API.

## FAQs

### Why does the checkout action run on the branch with full history?

`release-it-action` needs to run on the latest commit on the default/release branch and with a [concurrency group](https://docs.github.com/en/actions/using-jobs/using-concurrency).
Otherwise, if multiple workflows are triggered quickly, later workflows might not include release commits from earlier workflows.

### Why does this delete and recreate branch protections?

It would be great to instead either change which branch is protected or have a native GitHub API to disable a branch protection rule.
Neither exist at time of writing.
If you know that one now exists, please do file an issue!

See:

- [#13](https://github.com/JoshuaKGoldberg/release-it-action/issues/13) for supporting bypassing PR allowances
- [#14](https://github.com/JoshuaKGoldberg/release-it-action/issues/14) for supporting dismissal restrictions

## Contributors

<!-- spellchecker: disable -->
<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="http://www.joshuakgoldberg.com/"><img src="https://avatars.githubusercontent.com/u/3335181?v=4?s=100" width="100px;" alt="Josh Goldberg ✨"/><br /><sub><b>Josh Goldberg ✨</b></sub></a><br /><a href="https://github.com/JoshuaKGoldberg/release-it-action/commits?author=JoshuaKGoldberg" title="Code">💻</a> <a href="#content-JoshuaKGoldberg" title="Content">🖋</a> <a href="https://github.com/JoshuaKGoldberg/release-it-action/commits?author=JoshuaKGoldberg" title="Documentation">📖</a> <a href="#ideas-JoshuaKGoldberg" title="Ideas, Planning, & Feedback">🤔</a> <a href="#infra-JoshuaKGoldberg" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="#maintenance-JoshuaKGoldberg" title="Maintenance">🚧</a> <a href="#projectManagement-JoshuaKGoldberg" title="Project Management">📆</a> <a href="#tool-JoshuaKGoldberg" title="Tools">🔧</a> <a href="https://github.com/JoshuaKGoldberg/release-it-action/issues?q=author%3AJoshuaKGoldberg" title="Bug reports">🐛</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->
<!-- spellchecker: enable -->

<!-- You can remove this notice if you don't want it 🙂 no worries! -->

> 💙 This package is based on [@JoshuaKGoldberg](https://github.com/JoshuaKGoldberg)'s [create-typescript-app](https://github.com/JoshuaKGoldberg/create-typescript-app).
