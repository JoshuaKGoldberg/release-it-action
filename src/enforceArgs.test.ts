import { describe, expect, it } from "vitest";

import { enforceArgs } from "./enforceArgs.js";

describe("enforceArgs", () => {
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
	])(
		"drops increments from %j when enforcing --no-increment",
		(args, expected) => {
			expect(enforceArgs(args, ["--no-increment"])).toEqual(expected);
		},
	);

	it("keeps increments before -- when not enforcing --no-increment", () => {
		expect(enforceArgs(["patch", "--", "minor"], ["--no-git"])).toEqual([
			"patch",
			"--no-git",
		]);
	});

	it("puts enforced args after the given args", () => {
		expect(
			enforceArgs(
				["--github.release", "--no-npm.publish", "--npm.tag=next"],
				["--no-increment", "--npm.publish", "--no-github.release"],
			),
		).toEqual([
			"--github.release",
			"--no-npm.publish",
			"--npm.tag=next",
			"--no-increment",
			"--npm.publish",
			"--no-github.release",
		]);
	});
});
