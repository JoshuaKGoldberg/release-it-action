# Changelog

## [0.5.28](https://github.com/JoshuaKGoldberg/release-it-action/compare/v0.5.27...v0.5.28) (2026-10-03)

### Bug Fixes

- stop publishing compiled tests to npm ([#952](https://github.com/JoshuaKGoldberg/release-it-action/issues/952)) ([44d2885](https://github.com/JoshuaKGoldberg/release-it-action/commit/44d2885425c064d17893ab89b53cfc59cbc9d35b)), closes [#901](https://github.com/JoshuaKGoldberg/release-it-action/issues/901)

## [0.5.27](https://github.com/JoshuaKGoldberg/release-it-action/compare/v0.5.26...v0.5.27) (2026-10-03)

### Bug Fixes

- always fail on unparseable release-it-args ([#945](https://github.com/JoshuaKGoldberg/release-it-action/issues/945)) ([23f9790](https://github.com/JoshuaKGoldberg/release-it-action/commit/23f9790978b62ea0e7906adf9576cde6748210f3)), closes [#896](https://github.com/JoshuaKGoldberg/release-it-action/issues/896)
- stop logging the npm token cleanup's command result ([#941](https://github.com/JoshuaKGoldberg/release-it-action/issues/941)) ([e4111e1](https://github.com/JoshuaKGoldberg/release-it-action/commit/e4111e11d59a81d1c04198422194796534c13664)), closes [#903](https://github.com/JoshuaKGoldberg/release-it-action/issues/903)

## [0.5.26](https://github.com/JoshuaKGoldberg/release-it-action/compare/v0.5.25...v0.5.26) (2026-10-03)

### Bug Fixes

- keep Git config when retrying an unpublished version ([#965](https://github.com/JoshuaKGoldberg/release-it-action/issues/965)) ([aa7af72](https://github.com/JoshuaKGoldberg/release-it-action/commit/aa7af72918bf9a366b1e7cf1d3908ca1f50c4f4a)), closes [#964](https://github.com/JoshuaKGoldberg/release-it-action/issues/964)
- restore the npmrc after the run instead of deleting its auth token ([#959](https://github.com/JoshuaKGoldberg/release-it-action/issues/959)) ([da19195](https://github.com/JoshuaKGoldberg/release-it-action/commit/da191950db19ce499f4594543081fc06ef2685ac)), closes [#958](https://github.com/JoshuaKGoldberg/release-it-action/issues/958)

## [0.5.25](https://github.com/JoshuaKGoldberg/release-it-action/compare/v0.5.24...v0.5.25) (2026-10-03)

### Bug Fixes

- fail when rulesets can't be fetched or disabled ([#979](https://github.com/JoshuaKGoldberg/release-it-action/issues/979)) ([0098553](https://github.com/JoshuaKGoldberg/release-it-action/commit/009855301a66a9abc5e1c9a63db7b2dda5e88b50)), closes [#978](https://github.com/JoshuaKGoldberg/release-it-action/issues/978)

## [0.5.24](https://github.com/JoshuaKGoldberg/release-it-action/compare/v0.5.23...v0.5.24) (2026-10-03)

### Bug Fixes

- create a missing GitHub release even when the version is already on npm ([#961](https://github.com/JoshuaKGoldberg/release-it-action/issues/961)) ([05d7972](https://github.com/JoshuaKGoldberg/release-it-action/commit/05d79727280ce995f560c846e76f5f4eecb32737)), closes [#960](https://github.com/JoshuaKGoldberg/release-it-action/issues/960)

## [0.5.23](https://github.com/JoshuaKGoldberg/release-it-action/compare/v0.5.22...v0.5.23) (2026-10-03)

### Bug Fixes

- mask token inputs and keep the npm token out of npm config set errors ([#957](https://github.com/JoshuaKGoldberg/release-it-action/issues/957)) ([4408794](https://github.com/JoshuaKGoldberg/release-it-action/commit/44087943caa8ca7cc44a6adafadf6dcd1a4a9cd9)), closes [#956](https://github.com/JoshuaKGoldberg/release-it-action/issues/956)

## [0.5.22](https://github.com/JoshuaKGoldberg/release-it-action/compare/v0.5.21...v0.5.22) (2026-10-03)

### Bug Fixes

- keep "any source" required checks when recreating branch protections ([#989](https://github.com/JoshuaKGoldberg/release-it-action/issues/989)) ([e1c8c93](https://github.com/JoshuaKGoldberg/release-it-action/commit/e1c8c93f47a2f3d59987d4a261cbeb4430f7c67e)), closes [#988](https://github.com/JoshuaKGoldberg/release-it-action/issues/988)

## [0.5.21](https://github.com/JoshuaKGoldberg/release-it-action/compare/v0.5.20...v0.5.21) (2026-10-03)

### Bug Fixes

- drop @types/node from runtime dependencies ([#936](https://github.com/JoshuaKGoldberg/release-it-action/issues/936)) ([10a3c5c](https://github.com/JoshuaKGoldberg/release-it-action/commit/10a3c5c1c0732121dba35f4bb3251f886df9e5e9)), closes [#908](https://github.com/JoshuaKGoldberg/release-it-action/issues/908)

## [0.5.20](https://github.com/JoshuaKGoldberg/release-it-action/compare/v0.5.19...v0.5.20) (2026-10-02)

### Bug Fixes

- fail a republish instead of treating it as superseded ([#892](https://github.com/JoshuaKGoldberg/release-it-action/issues/892)) ([997826e](https://github.com/JoshuaKGoldberg/release-it-action/commit/997826e0704c3ac54cca6f667527f22ab044ce79)), closes [#891](https://github.com/JoshuaKGoldberg/release-it-action/issues/891)

## [0.5.19](https://github.com/JoshuaKGoldberg/release-it-action/compare/v0.5.18...v0.5.19) (2026-10-02)

### Bug Fixes

- log release-it failures once, without repeating its output ([#886](https://github.com/JoshuaKGoldberg/release-it-action/issues/886)) ([5eebe77](https://github.com/JoshuaKGoldberg/release-it-action/commit/5eebe7712f038ec64bb1512ae8c1ce8f56180ed7)), closes [#883](https://github.com/JoshuaKGoldberg/release-it-action/issues/883)

## [0.5.18](https://github.com/JoshuaKGoldberg/release-it-action/compare/v0.5.17...v0.5.18) (2026-10-02)

### Bug Fixes

- wait for npm to show a recently tagged version before treating it as unpublished ([#885](https://github.com/JoshuaKGoldberg/release-it-action/issues/885)) ([20764c0](https://github.com/JoshuaKGoldberg/release-it-action/commit/20764c010054d52f9d56355614c84a2b7e697b31)), closes [#882](https://github.com/JoshuaKGoldberg/release-it-action/issues/882) [#876](https://github.com/JoshuaKGoldberg/release-it-action/issues/876)

## [0.5.17](https://github.com/JoshuaKGoldberg/release-it-action/compare/v0.5.16...v0.5.17) (2026-10-02)

### Bug Fixes

- remove the npm token from the npmrc after the run ([#873](https://github.com/JoshuaKGoldberg/release-it-action/issues/873)) ([8c3f4cc](https://github.com/JoshuaKGoldberg/release-it-action/commit/8c3f4cce1dee8d883c02ea22304d9f466aea756c)), closes [#853](https://github.com/JoshuaKGoldberg/release-it-action/issues/853)

## [0.5.16](https://github.com/JoshuaKGoldberg/release-it-action/compare/v0.5.15...v0.5.16) (2026-10-02)

### Bug Fixes

- support quoted values in release-it-args ([#870](https://github.com/JoshuaKGoldberg/release-it-action/issues/870)) ([57a6ce1](https://github.com/JoshuaKGoldberg/release-it-action/commit/57a6ce123ef9ebc104dd258afc0145666bcb8414)), closes [#850](https://github.com/JoshuaKGoldberg/release-it-action/issues/850)

## [0.5.15](https://github.com/JoshuaKGoldberg/release-it-action/compare/v0.5.14...v0.5.15) (2026-10-02)

### Bug Fixes

- honor scoped publishConfig registries when checking for unpublished versions ([#871](https://github.com/JoshuaKGoldberg/release-it-action/issues/871)) ([6ee2f62](https://github.com/JoshuaKGoldberg/release-it-action/commit/6ee2f62ee5d8c4fddeb3f212c45f0d4d82378a63)), closes [#851](https://github.com/JoshuaKGoldberg/release-it-action/issues/851)
- provide the github-token input to release-it as GITHUB_TOKEN ([#867](https://github.com/JoshuaKGoldberg/release-it-action/issues/867)) ([8978be6](https://github.com/JoshuaKGoldberg/release-it-action/commit/8978be678d248280b0b6adb85d85dd95e0bb6848)), closes [#847](https://github.com/JoshuaKGoldberg/release-it-action/issues/847)

## [0.5.14](https://github.com/JoshuaKGoldberg/release-it-action/compare/v0.5.13...v0.5.14) (2026-10-02)

### Bug Fixes

- create a missing GitHub release before retrying the npm publish ([#866](https://github.com/JoshuaKGoldberg/release-it-action/issues/866)) ([9a30536](https://github.com/JoshuaKGoldberg/release-it-action/commit/9a30536c32884857074103c643b8077fb1adedd9)), closes [#846](https://github.com/JoshuaKGoldberg/release-it-action/issues/846)
- paginate branch rules when bypassing rulesets ([#872](https://github.com/JoshuaKGoldberg/release-it-action/issues/872)) ([7fefabe](https://github.com/JoshuaKGoldberg/release-it-action/commit/7fefabe2e995b7b45a96ef964a91e80882119626)), closes [#852](https://github.com/JoshuaKGoldberg/release-it-action/issues/852)
- run the action on Node 24 ([#869](https://github.com/JoshuaKGoldberg/release-it-action/issues/869)) ([aa65c73](https://github.com/JoshuaKGoldberg/release-it-action/commit/aa65c735a4688eb1008fb696db0f008fc73c99d2)), closes [#849](https://github.com/JoshuaKGoldberg/release-it-action/issues/849)
- warn on superseded releases and treat merge-base errors as not superseded ([#868](https://github.com/JoshuaKGoldberg/release-it-action/issues/868)) ([7e7e6ca](https://github.com/JoshuaKGoldberg/release-it-action/commit/7e7e6cad0d2aad515a5485aef9ba78d997f972c1)), closes [#848](https://github.com/JoshuaKGoldberg/release-it-action/issues/848)

## [0.5.13](https://github.com/JoshuaKGoldberg/release-it-action/compare/v0.5.12...v0.5.13) (2026-10-02)

### Bug Fixes

- give actionable guidance when an unpublished version blocks releasing ([#864](https://github.com/JoshuaKGoldberg/release-it-action/issues/864)) ([76d6365](https://github.com/JoshuaKGoldberg/release-it-action/commit/76d63654b270afb71573d5f909765e3de349ec54)), closes [#844](https://github.com/JoshuaKGoldberg/release-it-action/issues/844)

## [0.5.12](https://github.com/JoshuaKGoldberg/release-it-action/compare/v0.5.11...v0.5.12) (2026-10-02)

### Bug Fixes

- always restore branch protections and rulesets, and fail the run when restoring fails ([#862](https://github.com/JoshuaKGoldberg/release-it-action/issues/862)) ([9805870](https://github.com/JoshuaKGoldberg/release-it-action/commit/980587026a1679f38854d73b3185caef8e45c251)), closes [#842](https://github.com/JoshuaKGoldberg/release-it-action/issues/842)

## [0.5.11](https://github.com/JoshuaKGoldberg/release-it-action/compare/v0.5.10...v0.5.11) (2026-10-02)

### Bug Fixes

- forward release-it-args when republishing an unpublished version ([#858](https://github.com/JoshuaKGoldberg/release-it-action/issues/858)) ([2c7af19](https://github.com/JoshuaKGoldberg/release-it-action/commit/2c7af1905700bf5c90d57c374a7d9a6f39c4f4e4)), closes [#840](https://github.com/JoshuaKGoldberg/release-it-action/issues/840)

## [0.5.10](https://github.com/JoshuaKGoldberg/release-it-action/compare/v0.5.9...v0.5.10) (2026-10-02)

### Bug Fixes

- skip release-it npm checks when republishing an unpublished version ([#857](https://github.com/JoshuaKGoldberg/release-it-action/issues/857)) ([ab876d9](https://github.com/JoshuaKGoldberg/release-it-action/commit/ab876d9cc5e92e1511f0a7c513a0510ad5c7929f)), closes [#839](https://github.com/JoshuaKGoldberg/release-it-action/issues/839)

## [0.5.9](https://github.com/JoshuaKGoldberg/release-it-action/compare/v0.5.8...v0.5.9) (2026-10-02)

### Bug Fixes

- emit lib/ so the published Node API exists ([#856](https://github.com/JoshuaKGoldberg/release-it-action/issues/856)) ([104e45c](https://github.com/JoshuaKGoldberg/release-it-action/commit/104e45cfc244e06be48a6a537b0542b3e603bea7)), closes [#838](https://github.com/JoshuaKGoldberg/release-it-action/issues/838)

## [0.5.8](https://github.com/JoshuaKGoldberg/release-it-action/compare/v0.5.7...v0.5.8) (2026-10-02)

### Bug Fixes

- recreate branch protections from the fetched response data ([#855](https://github.com/JoshuaKGoldberg/release-it-action/issues/855)) ([7c4d26b](https://github.com/JoshuaKGoldberg/release-it-action/commit/7c4d26be4074a7aeab0fcf18bed28ba01b780e57)), closes [#837](https://github.com/JoshuaKGoldberg/release-it-action/issues/837)

## [0.5.7](https://github.com/JoshuaKGoldberg/release-it-action/compare/v0.5.6...v0.5.7) (2026-09-29)

### Bug Fixes

- detect npm publish conflicts when retrying an unpublished version ([#834](https://github.com/JoshuaKGoldberg/release-it-action/issues/834)) ([348deb1](https://github.com/JoshuaKGoldberg/release-it-action/commit/348deb1fb7ccffa485c98fd203d24b3422c07661)), closes [#833](https://github.com/JoshuaKGoldberg/release-it-action/issues/833)

## [0.5.6](https://github.com/JoshuaKGoldberg/release-it-action/compare/v0.5.5...v0.5.6) (2026-09-29)

### Bug Fixes

- treat a version that appears on npm after a failed publish retry as published ([#832](https://github.com/JoshuaKGoldberg/release-it-action/issues/832)) ([2b880c9](https://github.com/JoshuaKGoldberg/release-it-action/commit/2b880c99944318fbb1b0816b760c72f32c7699d6)), closes [#831](https://github.com/JoshuaKGoldberg/release-it-action/issues/831)

## [0.5.5](https://github.com/JoshuaKGoldberg/release-it-action/compare/v0.5.4...v0.5.5) (2026-09-29)

### Bug Fixes

- pass release-it arguments separately ([#828](https://github.com/JoshuaKGoldberg/release-it-action/issues/828)) ([9991a44](https://github.com/JoshuaKGoldberg/release-it-action/commit/9991a4401936ecc09bfe2085e1b8d89fb6fedd80)), closes [#827](https://github.com/JoshuaKGoldberg/release-it-action/issues/827)

## [0.5.4](https://github.com/JoshuaKGoldberg/release-it-action/compare/v0.5.3...v0.5.4) (2026-09-26)

### Bug Fixes

- push release commits before publishing to npm ([#824](https://github.com/JoshuaKGoldberg/release-it-action/issues/824)) ([a1a2282](https://github.com/JoshuaKGoldberg/release-it-action/commit/a1a2282261232ad4f6b4777a8465c6631b98a5ea)), closes [JoshuaKGoldberg/create-typescript-app#2483](https://github.com/JoshuaKGoldberg/create-typescript-app/issues/2483) [#822](https://github.com/JoshuaKGoldberg/release-it-action/issues/822) [#823](https://github.com/JoshuaKGoldberg/release-it-action/issues/823)

## [0.5.3](https://github.com/JoshuaKGoldberg/release-it-action/compare/v0.5.2...v0.5.3) (2026-09-26)

### Bug Fixes

- **deps:** update dependency execa to v10 ([#819](https://github.com/JoshuaKGoldberg/release-it-action/issues/819)) ([46ab361](https://github.com/JoshuaKGoldberg/release-it-action/commit/46ab36114f607420e822846dd44148c243f8211d)), closes [docs/api.md#subprocess](https://github.com/docs/api.md/issues/subprocess) [docs/api.md#subprocessnodechildprocess](https://github.com/docs/api.md/issues/subprocessnodechildprocess) [docs/execution.md#template-string-syntax](https://github.com/docs/execution.md/issues/template-string-syntax) [docs/api.md#parsecommandstringcommand](https://github.com/docs/api.md/issues/parsecommandstringcommand) [docs/api.md#optionsipc](https://github.com/docs/api.md/issues/optionsipc) [docs/api.md#optionsinput](https://github.com/docs/api.md/issues/optionsinput) [docs/api.md#optionsinputfile](https://github.com/docs/api.md/issues/optionsinputfile) [docs/api.md#optionsstdin](https://github.com/docs/api.md/issues/optionsstdin) [docs/input.md#multiple-inputs](https://github.com/docs/input.md/issues/multiple-inputs) [docs/termination.md#killing-descendant-processes](https://github.com/docs/termination.md/issues/killing-descendant-processes) [docs/api.md#optionskilldescendants](https://github.com/docs/api.md/issues/optionskilldescendants) [docs/api.md#optionsshell](https://github.com/docs/api.md/issues/optionsshell) [docs/streams.md#converting-a-subprocess-to-a-web-stream](https://github.com/docs/streams.md/issues/converting-a-subprocess-to-a-web-stream) [docs/api.md#subprocessreadablestreamreadableoptions](https://github.com/docs/api.md/issues/subprocessreadablestreamreadableoptions) [docs/api.md#subprocesswritablestreamwritableoptions](https://github.com/docs/api.md/issues/subprocesswritablestreamwritableoptions) [docs/api.md#subprocesstransformstreamduplexoptions](https://github.com/docs/api.md/issues/subprocesstransformstreamduplexoptions) [docs/api.md#subprocesspipefile-arguments-options](https://github.com/docs/api.md/issues/subprocesspipefile-arguments-options) [docs/pipe.md#iterate-stream-and-ipc](https://github.com/docs/pipe.md/issues/iterate-stream-and-ipc) [docs/streams.md#converting-a-subprocess-to-a-stream](https://github.com/docs/streams.md/issues/converting-a-subprocess-to-a-stream) [docs/ipc.md#exchanging-messages](https://github.com/docs/ipc.md/issues/exchanging-messages) [docs/input.md#additional-file-descriptors](https://github.com/docs/input.md/issues/additional-file-descriptors) [docs/api.md#optionsstdio](https://github.com/docs/api.md/issues/optionsstdio) [docs/input.md#file-input](https://github.com/docs/input.md/issues/file-input) [docs/binary.md#transforms](https://github.com/docs/binary.md/issues/transforms) [docs/transform.md#object-mode](https://github.com/docs/transform.md/issues/object-mode) [docs/output.md#stdoutstderr-specific-options](https://github.com/docs/output.md/issues/stdoutstderr-specific-options) [docs/api.md#optionsverbose](https://github.com/docs/api.md/issues/optionsverbose) [docs/api.md#optionsmaxbuffer](https://github.com/docs/api.md/issues/optionsmaxbuffer) [docs/api.md#optionsipc](https://github.com/docs/api.md/issues/optionsipc)
- exit successfully when a newer push supersedes the release ([#822](https://github.com/JoshuaKGoldberg/release-it-action/issues/822)) ([bfe0fe1](https://github.com/JoshuaKGoldberg/release-it-action/commit/bfe0fe14aca88ec5f10094f0f78f59ef2ba0ee61)), closes [#820](https://github.com/JoshuaKGoldberg/release-it-action/issues/820)
- publish a version that was pushed but never published to npm ([#823](https://github.com/JoshuaKGoldberg/release-it-action/issues/823)) ([4801a38](https://github.com/JoshuaKGoldberg/release-it-action/commit/4801a380cd81f094851e1df634689a274916556c)), closes [#821](https://github.com/JoshuaKGoldberg/release-it-action/issues/821)

## [0.5.2](https://github.com/JoshuaKGoldberg/release-it-action/compare/v0.5.1...v0.5.2) (2026-09-25)

### Bug Fixes

- **deps:** update dependency @actions/github to v9 ([#818](https://github.com/JoshuaKGoldberg/release-it-action/issues/818)) ([68f147c](https://github.com/JoshuaKGoldberg/release-it-action/commit/68f147ced55e1699dcc3dde09073db96e7047b2c)), closes [#8203](https://github.com/JoshuaKGoldberg/release-it-action/issues/8203)

## [0.5.1](https://github.com/JoshuaKGoldberg/release-it-action/compare/v0.5.0...v0.5.1) (2026-09-25)

### Bug Fixes

- **deps:** update dependency @actions/core to v3 ([#817](https://github.com/JoshuaKGoldberg/release-it-action/issues/817)) ([d86070c](https://github.com/JoshuaKGoldberg/release-it-action/commit/d86070cb0714c9bd1a38227138c1b89e7ae1eaf8)), closes [#8203](https://github.com/JoshuaKGoldberg/release-it-action/issues/8203)

# [0.5.0](https://github.com/JoshuaKGoldberg/release-it-action/compare/v0.4.0...v0.5.0) (2026-09-20)

### Bug Fixes

- recreate bypass_pull_request_allowances and dismissal_restrictions ([#773](https://github.com/JoshuaKGoldberg/release-it-action/issues/773)) ([ed1156a](https://github.com/JoshuaKGoldberg/release-it-action/commit/ed1156a2c7d4853c9f2f0180f7d67a1e3f5dd387)), closes [#13](https://github.com/JoshuaKGoldberg/release-it-action/issues/13) [#14](https://github.com/JoshuaKGoldberg/release-it-action/issues/14)
- treat an empty skip-npm-publish input as false ([#787](https://github.com/JoshuaKGoldberg/release-it-action/issues/787)) ([8eb7ab9](https://github.com/JoshuaKGoldberg/release-it-action/commit/8eb7ab9d04772c294906ef182bc844840e2185a4)), closes [#775](https://github.com/JoshuaKGoldberg/release-it-action/issues/775) [#775](https://github.com/JoshuaKGoldberg/release-it-action/issues/775)

### Features

- add bypass-branch-rulesets option ([#780](https://github.com/JoshuaKGoldberg/release-it-action/issues/780)) ([37705b0](https://github.com/JoshuaKGoldberg/release-it-action/commit/37705b0737eb9584d9a510703df367c313ebde67)), closes [#391](https://github.com/JoshuaKGoldberg/release-it-action/issues/391)
- add skip-npm-publish option ([#775](https://github.com/JoshuaKGoldberg/release-it-action/issues/775)) ([e9330ed](https://github.com/JoshuaKGoldberg/release-it-action/commit/e9330edadbc2c6c668ca11982cf9dffd9534a17b)), closes [#476](https://github.com/JoshuaKGoldberg/release-it-action/issues/476) [#741](https://github.com/JoshuaKGoldberg/release-it-action/issues/741)

## [0.3.5](https://github.com/JoshuaKGoldberg/release-it-action/compare/v0.3.4...v0.3.5) (2025-11-11)

### Bug Fixes

- empty commit to bump new patch version with built dist/ ([fe107a4](https://github.com/JoshuaKGoldberg/release-it-action/commit/fe107a4b694fcfc30d674ef2d456d16e3d826be9))

## [0.3.4](https://github.com/JoshuaKGoldberg/release-it-action/compare/v0.3.3...v0.3.4) (2025-11-11)

### Bug Fixes

- bump should-semantic-release to 0.3.5 ([#694](https://github.com/JoshuaKGoldberg/release-it-action/issues/694)) ([140c195](https://github.com/JoshuaKGoldberg/release-it-action/commit/140c19546aa7b6a6a026e2af1d6af7b5267ecee5)), closes [#693](https://github.com/JoshuaKGoldberg/release-it-action/issues/693)

## [0.3.3](https://github.com/JoshuaKGoldberg/release-it-action/compare/v0.3.2...v0.3.3) (2025-10-28)

### Bug Fixes

- **deps:** update dependency node to v24 ([#682](https://github.com/JoshuaKGoldberg/release-it-action/issues/682)) ([67abfe6](https://github.com/JoshuaKGoldberg/release-it-action/commit/67abfe6d077a19020f1d7ff14e0a3827695a9f5a))

## [0.3.2](https://github.com/JoshuaKGoldberg/release-it-action/compare/v0.3.1...v0.3.2) (2025-04-04)

### Bug Fixes

- bump to create-typescript-app@2 with transitions action ([#479](https://github.com/JoshuaKGoldberg/release-it-action/issues/479)) ([cb1e69a](https://github.com/JoshuaKGoldberg/release-it-action/commit/cb1e69a2e3d5714d41858bbf55fee15604466ce9)), closes [#477](https://github.com/JoshuaKGoldberg/release-it-action/issues/477)

# 0.1.0 (2023-10-01)

### Bug Fixes

- correct release-it-action name in .eslintrc.cjs ([0e44044](https://github.com/JoshuaKGoldberg/release-it-action/commit/0e440447da95ac8d91956851913e706f009210f8))

### Features

- initialized repo ✨ ([f922277](https://github.com/JoshuaKGoldberg/release-it-action/commit/f9222773db66ca472dc4dc720ada592a4d2b7163))
