# Changelog

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
