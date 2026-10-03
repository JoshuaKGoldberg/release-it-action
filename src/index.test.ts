import * as core from "@actions/core";
import { afterEach, describe, expect, it, vi } from "vitest";

import { releaseItAction, ReleaseItActionOptions } from "./index.js";

const mock$$ = vi.fn();

vi.mock("./execa.js", () => ({
	get $$() {
		return mock$$;
	},
}));

const mockShouldSemanticRelease = vi.fn();

vi.mock("should-semantic-release", () => ({
	get shouldSemanticRelease() {
		return mockShouldSemanticRelease;
	},
}));

const mockRunBypassingBranchProtections = vi.fn();

vi.mock("./runBypassingBranchProtections.js", () => ({
	get runBypassingBranchProtections() {
		return mockRunBypassingBranchProtections;
	},
}));

const mockRunBypassingBranchRulesets = vi.fn();

vi.mock("./runBypassingBranchRulesets.js", () => ({
	get runBypassingBranchRulesets() {
		return mockRunBypassingBranchRulesets;
	},
}));

const mockRestoreNpmUserConfig = vi.fn();
const mockSnapshotNpmUserConfig = vi
	.fn()
	.mockResolvedValue(mockRestoreNpmUserConfig);

vi.mock("./snapshotNpmUserConfig.js", () => ({
	get snapshotNpmUserConfig() {
		return mockSnapshotNpmUserConfig;
	},
}));

const mockGetUnpublishedVersion = vi.fn();

vi.mock("./steps/getUnpublishedVersion.js", () => ({
	get getUnpublishedVersion() {
		return mockGetUnpublishedVersion;
	},
}));

const mockHasGitHubRelease = vi.fn();

vi.mock("./steps/hasGitHubRelease.js", () => ({
	get hasGitHubRelease() {
		return mockHasGitHubRelease;
	},
}));

const mockRunReleaseIt = vi.fn();

vi.mock("./steps/runReleaseIt.js", () => ({
	get runReleaseIt() {
		return mockRunReleaseIt;
	},
}));

vi.mock("./tryCatchInfoAction.js", () => ({
	async tryCatchInfoAction(_: string, action: () => Promise<unknown>) {
		return await action();
	},
}));

vi.mock("@actions/core", () => ({
	info: vi.fn(),
	setFailed: vi.fn(),
}));
const mockCore = vi.mocked(core);

const mockReleaseItArgs = "--debug";

const mockOptions = {
	githubToken: "mock-githubToken",
	gitUserEmail: "mock-gitUserEmail",
	gitUserName: "mock-gitUserName",
	npmToken: "mock-npmToken",
	owner: "mock-owner",
	releaseItArgs: mockReleaseItArgs,
	repo: "mock-repo",
} satisfies ReleaseItActionOptions;

describe("releaseItAction", () => {
	afterEach(() => {
		vi.unstubAllEnvs();
	});

	it("provides githubToken as GITHUB_TOKEN when the environment variable is not set", async () => {
		vi.stubEnv("GITHUB_TOKEN", undefined);
		mockShouldSemanticRelease.mockResolvedValueOnce(false);

		await releaseItAction(mockOptions);

		expect(process.env.GITHUB_TOKEN).toBe("mock-githubToken");
	});

	it("does not overwrite an existing GITHUB_TOKEN environment variable", async () => {
		vi.stubEnv("GITHUB_TOKEN", "mock-environment-token");
		mockShouldSemanticRelease.mockResolvedValueOnce(false);

		await releaseItAction(mockOptions);

		expect(process.env.GITHUB_TOKEN).toBe("mock-environment-token");
	});

	it("does not run release-it when shouldSemanticRelease returns false", async () => {
		mockShouldSemanticRelease.mockResolvedValueOnce(false);

		await releaseItAction(mockOptions);

		expect(mockRunReleaseIt).not.toHaveBeenCalled();
	});

	it("fails without releasing when an older tagged version was never published", async () => {
		mockGetUnpublishedVersion.mockResolvedValueOnce({
			headTag: undefined,
			version: "1.2.3",
		});

		await releaseItAction(mockOptions);

		expect(mockCore.setFailed).toHaveBeenCalledWith(
			"Version 1.2.3 was tagged but never published to npm. Publish it before releasing a newer version, or bump the version manually if npm won't accept it again. If this package isn't meant to be on npm, set the skip-npm-publish option or mark it as private.",
		);
		expect(mockShouldSemanticRelease).not.toHaveBeenCalled();
		expect(mockRunReleaseIt).not.toHaveBeenCalled();
	});

	it("restores the npm user config even when the run fails early", async () => {
		mockGetUnpublishedVersion.mockResolvedValueOnce({
			headTag: undefined,
			version: "1.2.3",
		});

		await releaseItAction(mockOptions);

		expect(mockRestoreNpmUserConfig).toHaveBeenCalledOnce();
	});

	it("restores the npm user config even when setting the npm token fails", async () => {
		mock$$
			.mockResolvedValueOnce(undefined)
			.mockResolvedValueOnce(undefined)
			.mockRejectedValueOnce(new Error("Oh no!"));

		await expect(releaseItAction(mockOptions)).rejects.toThrow();

		expect(mockRestoreNpmUserConfig).toHaveBeenCalledOnce();
		expect(mockRunReleaseIt).not.toHaveBeenCalled();
	});

	it("deletes the npm token from the npmrc when the npm user config could not be snapshotted", async () => {
		mockSnapshotNpmUserConfig.mockResolvedValueOnce(undefined);
		mockShouldSemanticRelease.mockResolvedValueOnce(false);

		await releaseItAction(mockOptions);

		expect(mock$$.mock.calls.slice(2)).toEqual([
			[
				["npm config set //registry.npmjs.org/:_authToken ", ""],
				"mock-npmToken",
			],
			[["npm config delete //registry.npmjs.org/:_authToken"]],
		]);
		expect(mockRestoreNpmUserConfig).not.toHaveBeenCalled();
	});

	it("snapshots the npm user config before setting the npm token", async () => {
		mockShouldSemanticRelease.mockResolvedValueOnce(false);

		await releaseItAction(mockOptions);

		expect(mockSnapshotNpmUserConfig.mock.invocationCallOrder[0]).toBeLessThan(
			mock$$.mock.invocationCallOrder[2],
		);
	});

	it("publishes a version tagged at HEAD that was never published, without recreating its GitHub release", async () => {
		mockGetUnpublishedVersion.mockResolvedValueOnce({
			headTag: "v1.2.3",
			version: "1.2.3",
		});
		mockHasGitHubRelease.mockResolvedValueOnce(true);

		await releaseItAction(mockOptions);

		expect(mockHasGitHubRelease).toHaveBeenCalledWith(
			expect.objectContaining({
				owner: "mock-owner",
				repo: "mock-repo",
				tag: "v1.2.3",
			}),
		);
		expect(mockShouldSemanticRelease).not.toHaveBeenCalled();
		expect(mockRunReleaseIt).toHaveBeenCalledTimes(1);
		expect(mockRunReleaseIt).toHaveBeenCalledWith(
			`--no-increment --no-git --npm.publish --npm.skipChecks --no-github.release ${mockReleaseItArgs}`,
			{ allowPublishConflict: true, skipSupersededCheck: true },
		);
	});

	it("publishes a version tagged at HEAD that was never published and creates its missing GitHub release first", async () => {
		mockGetUnpublishedVersion.mockResolvedValueOnce({
			headTag: "v1.2.3",
			version: "1.2.3",
		});
		mockHasGitHubRelease.mockResolvedValueOnce(false);

		await releaseItAction(mockOptions);

		expect(mockRunReleaseIt.mock.calls).toEqual([
			[
				`--no-increment --no-git --no-npm.publish ${mockReleaseItArgs}`,
				{ skipSupersededCheck: true },
			],
			[
				`--no-increment --no-git --npm.publish --npm.skipChecks --no-github.release ${mockReleaseItArgs}`,
				{ allowPublishConflict: true, skipSupersededCheck: true },
			],
		]);
	});

	it("publishes a version tagged at HEAD that was never published without extra arguments when releaseItArgs is undefined", async () => {
		mockGetUnpublishedVersion.mockResolvedValueOnce({
			headTag: "v1.2.3",
			version: "1.2.3",
		});
		mockHasGitHubRelease.mockResolvedValueOnce(true);

		await releaseItAction({ ...mockOptions, releaseItArgs: undefined });

		expect(mockRunReleaseIt).toHaveBeenCalledWith(
			"--no-increment --no-git --npm.publish --npm.skipChecks --no-github.release",
			{ allowPublishConflict: true, skipSupersededCheck: true },
		);
	});

	it("does not check for an unpublished version when skipNpmPublish is true", async () => {
		mockShouldSemanticRelease.mockResolvedValueOnce(false);

		await releaseItAction({ ...mockOptions, skipNpmPublish: true });

		expect(mockGetUnpublishedVersion).not.toHaveBeenCalled();
	});

	it("runs without bypassing branch protections when shouldSemanticRelease returns true and bypassBranchProtections is undefined", async () => {
		mockShouldSemanticRelease.mockResolvedValueOnce(true);

		await releaseItAction(mockOptions);

		expect(mock$$.mock.calls).toMatchInlineSnapshot(`
			[
			  [
			    [
			      "git config user.email ",
			      "",
			    ],
			    "mock-gitUserEmail",
			  ],
			  [
			    [
			      "git config user.name ",
			      "",
			    ],
			    "mock-gitUserName",
			  ],
			  [
			    [
			      "npm config set //registry.npmjs.org/:_authToken ",
			      "",
			    ],
			    "mock-npmToken",
			  ],
			]
		`);
		expect(mockRunBypassingBranchProtections).not.toHaveBeenCalled();
		expect(mockRunBypassingBranchRulesets).not.toHaveBeenCalled();
		expect(mockRunReleaseIt).toHaveBeenCalledWith(mockReleaseItArgs);
	});

	it("runs bypassing branch protections when shouldSemanticRelease returns true and bypassBranchProtections is a string", async () => {
		mockShouldSemanticRelease.mockResolvedValueOnce(true);

		await releaseItAction({
			...mockOptions,
			bypassBranchProtections: "example-branch",
		});

		expect(mock$$.mock.calls).toMatchInlineSnapshot(`
			[
			  [
			    [
			      "git config user.email ",
			      "",
			    ],
			    "mock-gitUserEmail",
			  ],
			  [
			    [
			      "git config user.name ",
			      "",
			    ],
			    "mock-gitUserName",
			  ],
			  [
			    [
			      "npm config set //registry.npmjs.org/:_authToken ",
			      "",
			    ],
			    "mock-npmToken",
			  ],
			]
		`);
		expect(mockRunBypassingBranchProtections).toHaveBeenCalled();
	});

	it("runs bypassing branch rulesets when shouldSemanticRelease returns true and bypassBranchRulesets is a string", async () => {
		mockShouldSemanticRelease.mockResolvedValueOnce(true);
		mockRunBypassingBranchRulesets.mockImplementationOnce(
			async (_: unknown, __: unknown, run: () => Promise<void>) => {
				await run();
			},
		);

		await releaseItAction({
			...mockOptions,
			bypassBranchRulesets: "example-branch",
		});

		expect(mockRunBypassingBranchProtections).not.toHaveBeenCalled();
		expect(mockRunBypassingBranchRulesets).toHaveBeenCalledWith(
			{ branch: "example-branch", owner: "mock-owner", repo: "mock-repo" },
			expect.anything(),
			expect.any(Function),
		);
		expect(mockRunReleaseIt).toHaveBeenCalledWith(mockReleaseItArgs);
	});

	it("runs bypassing branch rulesets inside bypassing branch protections when both are strings", async () => {
		mockShouldSemanticRelease.mockResolvedValueOnce(true);
		mockRunBypassingBranchProtections.mockImplementationOnce(
			async (_: unknown, __: unknown, run: () => Promise<void>) => {
				await run();
			},
		);
		mockRunBypassingBranchRulesets.mockImplementationOnce(
			async (_: unknown, __: unknown, run: () => Promise<void>) => {
				await run();
			},
		);

		await releaseItAction({
			...mockOptions,
			bypassBranchProtections: "protections-branch",
			bypassBranchRulesets: "rulesets-branch",
		});

		expect(mockRunBypassingBranchProtections).toHaveBeenCalledWith(
			{ branch: "protections-branch", owner: "mock-owner", repo: "mock-repo" },
			expect.anything(),
			expect.any(Function),
		);
		expect(mockRunBypassingBranchRulesets).toHaveBeenCalledWith(
			{ branch: "rulesets-branch", owner: "mock-owner", repo: "mock-repo" },
			expect.anything(),
			expect.any(Function),
		);
		expect(mockRunReleaseIt).toHaveBeenCalledWith(mockReleaseItArgs);
	});

	it("logs an info message, does not set authToken, and passes --no-npm.publish when skipNpmPublish is true", async () => {
		mockShouldSemanticRelease.mockResolvedValueOnce(true);

		await releaseItAction({ ...mockOptions, skipNpmPublish: true });

		expect(mock$$.mock.calls).toMatchInlineSnapshot(`
			[
			  [
			    [
			      "git config user.email ",
			      "",
			    ],
			    "mock-gitUserEmail",
			  ],
			  [
			    [
			      "git config user.name ",
			      "",
			    ],
			    "mock-gitUserName",
			  ],
			]
		`);
		expect(mockCore.info).toHaveBeenCalledWith(
			"skipNpmPublish is true. Skipping npm publish.",
		);
		expect(mockSnapshotNpmUserConfig).not.toHaveBeenCalled();
		expect(mockRunReleaseIt).toHaveBeenCalledWith(
			`--no-npm.publish ${mockReleaseItArgs}`,
		);
	});

	it("should log an info message and not set authToken if no npm token was provided", async () => {
		mockShouldSemanticRelease.mockResolvedValueOnce(true);

		await releaseItAction({ ...mockOptions, npmToken: undefined });

		expect(mock$$.mock.calls).toMatchInlineSnapshot(`
			[
			  [
			    [
			      "git config user.email ",
			      "",
			    ],
			    "mock-gitUserEmail",
			  ],
			  [
			    [
			      "git config user.name ",
			      "",
			    ],
			    "mock-gitUserName",
			  ],
			]
		`);
		expect(mockCore.info).toHaveBeenCalledWith(
			"No npm token provided. This is required unless you're using Trusted Publishing.",
		);
		expect(mockSnapshotNpmUserConfig).not.toHaveBeenCalled();
	});
});
