import { describe, expect, it } from "vitest";

import { parseArgsString } from "./parseArgsString.js";

describe("parseArgsString", () => {
	it.each([
		["", []],
		["   ", []],
		["--verbose", ["--verbose"]],
		["major --preRelease=beta", ["major", "--preRelease=beta"]],
		["  major   --verbose  ", ["major", "--verbose"]],
		['--github.releaseName="Release v1"', ["--github.releaseName=Release v1"]],
		["--github.releaseName='Release v1'", ["--github.releaseName=Release v1"]],
		['"quoted arg" plain', ["quoted arg", "plain"]],
		['--message="it\'s here"', ["--message=it's here"]],
		["--message=Release\\ v1", ["--message=Release v1"]],
		["--path=C:\\temp", ["--path=C:\\temp"]],
		['--tag ""', ["--tag", ""]],
	])("parses %j into %j", (input, expected) => {
		expect(parseArgsString(input)).toEqual(expected);
	});

	it("throws on an unterminated quote", () => {
		expect(() => parseArgsString('--message="oops')).toThrow(
			'Unterminated " quote in arguments: --message="oops',
		);
	});
});
