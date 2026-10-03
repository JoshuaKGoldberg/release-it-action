import * as core from "@actions/core";
import { afterEach, describe, expect, it, vi } from "vitest";

import { releaseItAction, ReleaseItActionOptions } from "./index.js";

const mock$$ = vi.fn().mockResolvedValue({ exitCode: 0, stdout: "" });

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

const mockGetHeadTagMissingGitHubRelease = vi.fn();

vi.mock("./steps/getHeadTagMissingGitHubRelease.js", () => ({
	get getHeadTagMissingGitHubRelease() {
		return mockGetHeadTagMissingGitHubRelease;
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

const mockTryCatchInfoAction = vi.fn(
	async (_: string, action: () => Promise<unknown>) => await action(),
);

vi.mock("./tryCatchAction.js", async (importOriginal) => ({
	...(await importOriginal<typeof import("./tryCatchAction.js")>()),
	get tryCatchInfoAction() {
		return mockTryCatchInfoAction;
	},
}));

vi.mock("@actions/core", () => ({
	info: vi.fn(),
	setFailed: vi.fn(),
}));
const mockCore = vi.mocked(core);

const mockReleaseItArgs = "--debug";

const retryArgs =
	"--no-increment --no-git.commit --no-git.tag --no-git.push --no-git.requireCleanWorkingDir --no-git.requireCommits --no-git.requireUpstream";

const mockOptions = {
	githubToken: "mock-githubToken",
	gitUserEmail: "mock-gitUserEmail",
	gitUserName: "mock-gitUserName",
	owner: "mock-owner",
	releaseItArgs: mockReleaseItArgs,
	repo: "mock-repo",
} satisfies ReleaseItActionOptions;

describe("releaseItAction", () => {
	afterEach(() => {
		vi.unstubAllEnvs();
	});

	it("fails without doing anything else when releaseItArgs can't be parsed", async () => {
		await releaseItAction({
			...mockOptions,
			bypassBranchProtections: "example-branch",
			releaseItArgs: '--github.releaseName="oops',
		});

		expect(mockCore.setFailed).toHaveBeenCalledWith(
			'Invalid release-it-args: Could not parse arguments (Got EOF while in a quoted string): --github.releaseName="oops',
		);
		expect(mock$$).not.toHaveBeenCalled();
		expect(mockGetUnpublishedVersion).not.toHaveBeenCalled();
		expect(mockShouldSemanticRelease).not.toHaveBeenCalled();
		expect(mockRunBypassingBranchProtections).not.toHaveBeenCalled();
		expect(mockRunReleaseIt).not.toHaveBeenCalled();
	});

	it("passes githubToken to release-it without setting a GITHUB_TOKEN environment variable", async () => {
		vi.stubEnv("GITHUB_TOKEN", undefined);
		mockShouldSemanticRelease.mockResolvedValueOnce(true);

		await releaseItAction(mockOptions);

		expect(process.env.GITHUB_TOKEN).toBeUndefined();
		expect(mockGetUnpublishedVersion).toHaveBeenCalledWith("mock-githubToken");
		expect(mockRunReleaseIt).toHaveBeenCalledWith(mockReleaseItArgs, {
			githubToken: "mock-githubToken",
		});
	});

	it("passes githubToken to release-it without changing an existing GITHUB_TOKEN environment variable", async () => {
		vi.stubEnv("GITHUB_TOKEN", "mock-environment-token");
		mockShouldSemanticRelease.mockResolvedValueOnce(true);

		await releaseItAction(mockOptions);

		expect(process.env.GITHUB_TOKEN).toBe("mock-environment-token");
		expect(mockGetUnpublishedVersion).toHaveBeenCalledWith("mock-githubToken");
		expect(mockRunReleaseIt).toHaveBeenCalledWith(mockReleaseItArgs, {
			githubToken: "mock-githubToken",
		});
	});

	it("does not run release-it when shouldSemanticRelease returns false", async () => {
		mockShouldSemanticRelease.mockResolvedValueOnce(false);

		await releaseItAction(mockOptions);

		expect(mockRunReleaseIt).not.toHaveBeenCalled();
	});

	it("fails the run and does not run release-it when shouldSemanticRelease throws", async () => {
		mockShouldSemanticRelease.mockRejectedValueOnce(new Error("Oh no!"));

		await releaseItAction(mockOptions);

		expect(mockCore.setFailed).toHaveBeenCalledWith(
			"Error should-semantic-release: Error: Oh no!",
		);
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

	it("fails without releasing when checking npm for an unpublished version fails", async () => {
		mockGetUnpublishedVersion.mockRejectedValueOnce(new Error("Oh no!"));

		await releaseItAction(mockOptions);

		expect(mockCore.setFailed).toHaveBeenCalledWith(
			"Error checking for a version that was pushed but not published: Error: Oh no!",
		);
		expect(mockShouldSemanticRelease).not.toHaveBeenCalled();
		expect(mockRunReleaseIt).not.toHaveBeenCalled();
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
			`${retryArgs} --npm.publish --npm.skipChecks --no-github.release ${mockReleaseItArgs}`,
			{
				allowPublishConflict: true,
				githubToken: "mock-githubToken",
				skipSupersededCheck: true,
			},
		);
	});

	it("publishes a version tagged at HEAD that was never published and creates its missing GitHub release first", async () => {
		mockGetUnpublishedVersion.mockResolvedValueOnce({
			headTag: "v1.2.3",
			version: "1.2.3",
		});
		mockHasGitHubRelease.mockResolvedValueOnce(false);
		mockRunReleaseIt.mockResolvedValueOnce(true);

		await releaseItAction(mockOptions);

		expect(mockRunReleaseIt.mock.calls).toEqual([
			[
				`${retryArgs} --no-npm.publish ${mockReleaseItArgs}`,
				{ githubToken: "mock-githubToken", skipSupersededCheck: true },
			],
			[
				`${retryArgs} --npm.publish --npm.skipChecks --no-github.release ${mockReleaseItArgs}`,
				{
					allowPublishConflict: true,
					githubToken: "mock-githubToken",
					skipSupersededCheck: true,
				},
			],
		]);
	});

	it("fails without publishing to npm when creating the missing GitHub release fails", async () => {
		mockGetUnpublishedVersion.mockResolvedValueOnce({
			headTag: "v1.2.3",
			version: "1.2.3",
		});
		mockHasGitHubRelease.mockResolvedValueOnce(false);
		mockRunReleaseIt.mockResolvedValueOnce(false);

		await releaseItAction(mockOptions);

		expect(mockRunReleaseIt.mock.calls).toEqual([
			[
				`${retryArgs} --no-npm.publish ${mockReleaseItArgs}`,
				{ githubToken: "mock-githubToken", skipSupersededCheck: true },
			],
		]);
		expect(mockCore.setFailed).toHaveBeenCalledWith(
			"Skipped publishing 1.2.3 to npm because creating the GitHub release for v1.2.3 failed. Re-run the release from the commit tagged v1.2.3 to retry both.",
		);
	});

	it("fails without publishing when checking for the GitHub release fails", async () => {
		mockGetUnpublishedVersion.mockResolvedValueOnce({
			headTag: "v1.2.3",
			version: "1.2.3",
		});
		mockHasGitHubRelease.mockResolvedValueOnce(undefined);

		await releaseItAction(mockOptions);

		expect(mockCore.setFailed).toHaveBeenCalledWith(
			"Could not check whether v1.2.3 has a GitHub release, so 1.2.3 was not published to npm. Fix the error logged above (for example, a github-token that can't read releases), then re-run the release from the commit tagged v1.2.3.",
		);
		expect(mockRunReleaseIt).not.toHaveBeenCalled();
	});

	it("publishes a version tagged at HEAD that was never published without extra arguments when releaseItArgs is undefined", async () => {
		mockGetUnpublishedVersion.mockResolvedValueOnce({
			headTag: "v1.2.3",
			version: "1.2.3",
		});
		mockHasGitHubRelease.mockResolvedValueOnce(true);

		await releaseItAction({ ...mockOptions, releaseItArgs: undefined });

		expect(mockRunReleaseIt).toHaveBeenCalledWith(
			`${retryArgs} --npm.publish --npm.skipChecks --no-github.release`,
			{
				allowPublishConflict: true,
				githubToken: "mock-githubToken",
				skipSupersededCheck: true,
			},
		);
	});

	it("does not check for a missing GitHub release when the version was never published", async () => {
		mockGetUnpublishedVersion.mockResolvedValueOnce({
			headTag: "v1.2.3",
			version: "1.2.3",
		});
		mockHasGitHubRelease.mockResolvedValueOnce(true);

		await releaseItAction(mockOptions);

		expect(mockGetHeadTagMissingGitHubRelease).not.toHaveBeenCalled();
	});

	it("creates a missing GitHub release for a version tagged at HEAD that was already published", async () => {
		mockGetHeadTagMissingGitHubRelease.mockResolvedValueOnce("v1.2.3");

		await releaseItAction(mockOptions);

		expect(mockGetHeadTagMissingGitHubRelease).toHaveBeenCalledWith(
			expect.objectContaining({
				owner: "mock-owner",
				releaseItArgs: mockReleaseItArgs,
				repo: "mock-repo",
			}),
		);
		expect(mockShouldSemanticRelease).not.toHaveBeenCalled();
		expect(mockRunReleaseIt.mock.calls).toEqual([
			[
				`${retryArgs} --no-npm.publish ${mockReleaseItArgs}`,
				{
					allowPublishConflict: true,
					githubToken: "mock-githubToken",
					skipSupersededCheck: true,
				},
			],
		]);
	});

	it("creates a missing GitHub release for a version tagged at HEAD when skipNpmPublish is true", async () => {
		mockGetHeadTagMissingGitHubRelease.mockResolvedValueOnce("v1.2.3");

		await releaseItAction({ ...mockOptions, skipNpmPublish: true });

		expect(mockGetUnpublishedVersion).not.toHaveBeenCalled();
		expect(mockRunReleaseIt.mock.calls).toEqual([
			[
				`${retryArgs} --no-npm.publish ${mockReleaseItArgs}`,
				{
					allowPublishConflict: true,
					githubToken: "mock-githubToken",
					skipSupersededCheck: true,
				},
			],
		]);
	});

	it("checks should-semantic-release when no GitHub release is missing", async () => {
		mockShouldSemanticRelease.mockResolvedValueOnce(false);

		await releaseItAction(mockOptions);

		expect(mockGetHeadTagMissingGitHubRelease).toHaveBeenCalled();
		expect(mockShouldSemanticRelease).toHaveBeenCalled();
		expect(mockRunReleaseIt).not.toHaveBeenCalled();
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
			]
		`);
		expect(mockRunBypassingBranchProtections).not.toHaveBeenCalled();
		expect(mockRunBypassingBranchRulesets).not.toHaveBeenCalled();
		expect(mockRunReleaseIt).toHaveBeenCalledWith(mockReleaseItArgs, {
			githubToken: "mock-githubToken",
		});
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
		expect(mockRunReleaseIt).toHaveBeenCalledWith(mockReleaseItArgs, {
			githubToken: "mock-githubToken",
		});
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
		expect(mockRunReleaseIt).toHaveBeenCalledWith(mockReleaseItArgs, {
			githubToken: "mock-githubToken",
		});
	});

	it("logs an info message and passes --no-npm.publish when skipNpmPublish is true", async () => {
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
		expect(mockRunReleaseIt).toHaveBeenCalledWith(
			`--no-npm.publish ${mockReleaseItArgs}`,
			{ githubToken: "mock-githubToken" },
		);
	});
});
