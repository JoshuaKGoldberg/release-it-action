import { describe, expect, it } from "vitest";

import { withoutIncrement } from "./withoutIncrement.js";

describe("withoutIncrement", () => {
	it.each([
		[[], ["--no-increment"]],
		[["--ci"], ["--ci", "--no-increment"]],
		[["patch"], ["--no-increment"]],
		[
			["--ci", "minor"],
			["--ci", "--no-increment"],
		],
		[
			["major", "--preRelease=beta"],
			["--preRelease=beta", "--no-increment"],
		],
		[
			["--preRelease=beta", "prerelease"],
			["--preRelease=beta", "--no-increment"],
		],
		[["pre"], ["--no-increment"]],
		[["2.0.0"], ["--no-increment"]],
		[["v2.0.0-beta.1"], ["--no-increment"]],
		[["--", "patch"], ["--no-increment"]],
		[
			["--ci", "--"],
			["--ci", "--no-increment"],
		],
		[
			["--increment", "patch"],
			["--increment", "patch", "--no-increment"],
		],
		[
			["-i", "patch"],
			["-i", "patch", "--no-increment"],
		],
		[["--increment=patch"], ["--increment=patch", "--no-increment"]],
		[["-i=patch"], ["-i=patch", "--no-increment"]],
		[
			["--npm.tag", "next"],
			["--npm.tag", "next", "--no-increment"],
		],
		[
			["--preRelease", "beta"],
			["--preRelease", "beta", "--no-increment"],
		],
		[
			["--preReleaseBase", "1"],
			["--preReleaseBase", "1", "--no-increment"],
		],
		[
			["--ci", "true"],
			["--ci", "true", "--no-increment"],
		],
		[
			["--git.commitMessage=chore: release v${version}"],
			["--git.commitMessage=chore: release v${version}", "--no-increment"],
		],
	])("turns %j into %j", (args, expected) => {
		expect(withoutIncrement(args)).toEqual(expected);
	});
});
