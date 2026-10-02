import { describe, expect, it } from "vitest";

import { parseArgsString } from "./parseArgsString.js";

describe("parseArgsString", () => {
	describe("whitespace", () => {
		it.each([
			["", []],
			["   ", []],
			["\t \n", []],
			["--ci", ["--ci"]],
			["  --ci   --verbose  ", ["--ci", "--verbose"]],
			["--ci\t--verbose", ["--ci", "--verbose"]],
			["--ci\n--verbose\n", ["--ci", "--verbose"]],
			["--ci\r\n--verbose", ["--ci", "--verbose"]],
			["--a=b\u00a0c", ["--a=b\u00a0c"]],
		])("parses %j into %j", (input, expected) => {
			expect(parseArgsString(input)).toEqual(expected);
		});
	});

	describe("double quotes", () => {
		it.each([
			[
				'--github.releaseName="Release v1"',
				["--github.releaseName=Release v1"],
			],
			['"quoted arg" plain', ["quoted arg", "plain"]],
			['--a="b c"d', ["--a=b cd"]],
			['"a""b"', ["ab"]],
			['--tag ""', ["--tag", ""]],
			['--a=""', ["--a="]],
			['""', [""]],
			['"it\'s"', ["it's"]],
			['"say \\"hi\\""', ['say "hi"']],
			['"a\\\\b"', ["a\\b"]],
			['"a\\b"', ["a\\b"]],
			['"a\nb"', ["a\nb"]],
			['"  padded  "', ["  padded  "]],
		])("parses %j into %j", (input, expected) => {
			expect(parseArgsString(input)).toEqual(expected);
		});
	});

	describe("single quotes", () => {
		it.each([
			["--x='a b' c", ["--x=a b", "c"]],
			["''", [""]],
			["'say \"hi\"'", ['say "hi"']],
			["'a\\b'", ["a\\b"]],
			["'a\\'", ["a\\"]],
			["'it'\\''s'", ["it's"]],
			["'a'\"b\"c", ["abc"]],
		])("parses %j into %j", (input, expected) => {
			expect(parseArgsString(input)).toEqual(expected);
		});
	});

	describe("backslashes", () => {
		it.each([
			["Release\\ v1", ["Release v1"]],
			["a\\ \\ b", ["a  b"]],
			['\\"a\\"', ['"a"']],
			["\\'a", ["'a"]],
			["a\\\\b", ["a\\b"]],
			["a\\\\ b", ["a\\", "b"]],
			["C:\\temp", ["C:temp"]],
		])("parses %j into %j", (input, expected) => {
			expect(parseArgsString(input)).toEqual(expected);
		});
	});

	describe("no expansion", () => {
		it.each([
			["Release ${version}", ["Release", "${version}"]],
			['--m="v${version}"', ["--m=v${version}"]],
			["--m=$HOME", ["--m=$HOME"]],
			["--m=$(whoami)", ["--m=$(whoami)"]],
			["--m=`whoami`", ["--m=`whoami`"]],
			["--files=*.md", ["--files=*.md"]],
			["--dir=~/x", ["--dir=~/x"]],
			["--a=b|c", ["--a=b|c"]],
			["--a=b;c", ["--a=b;c"]],
			["--a&&b", ["--a&&b"]],
			["--a>b", ["--a>b"]],
			["--a=#b", ["--a=#b"]],
			["--a {b,c}", ["--a", "{b,c}"]],
		])("parses %j into %j", (input, expected) => {
			expect(parseArgsString(input)).toEqual(expected);
		});
	});

	describe("unicode", () => {
		it.each([
			["--m=日本語", ["--m=日本語"]],
			['--m="🚀 launch"', ["--m=🚀 launch"]],
		])("parses %j into %j", (input, expected) => {
			expect(parseArgsString(input)).toEqual(expected);
		});
	});

	describe("release-it", () => {
		it.each([
			["major --preRelease=beta", ["major", "--preRelease=beta"]],
			["--ci --increment=minor", ["--ci", "--increment=minor"]],
			["--no-git.requireCleanWorkingDir", ["--no-git.requireCleanWorkingDir"]],
			[
				"--git.commitMessage='chore: release v${version}'",
				["--git.commitMessage=chore: release v${version}"],
			],
			[
				'--npm.publishArgs="--provenance --access public"',
				["--npm.publishArgs=--provenance --access public"],
			],
			[
				'--github.releaseNotes="echo \\"notes\\""',
				['--github.releaseNotes=echo "notes"'],
			],
			[
				"--preRelease=beta\n--github.preRelease\n",
				["--preRelease=beta", "--github.preRelease"],
			],
		])("parses %j into %j", (input, expected) => {
			expect(parseArgsString(input)).toEqual(expected);
		});
	});

	it.each(['--m="oops', "--m='oops", '"a\\"', "'a'\\''"])(
		"throws on unterminated quoting in %j",
		(input) => {
			expect(() => parseArgsString(input)).toThrow(
				`Could not parse arguments (Got EOF while in a quoted string): ${input}`,
			);
		},
	);
});
