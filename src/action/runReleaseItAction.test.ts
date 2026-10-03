import * as github from "@actions/github";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { runReleaseItAction } from "./runReleaseItAction.js";

process.env.GITHUB_REPOSITORY = "mock-github-repository";

const mockGetBooleanInput = vi.fn();
const mockGetInput = vi.fn();
const mockWarning = vi.fn();

vi.mock("@actions/core", () => ({
	get getBooleanInput() {
		return mockGetBooleanInput;
	},
	get getInput() {
		return mockGetInput;
	},
	get warning() {
		return mockWarning;
	},
}));

vi.mock("../getTokenInput.js", () => ({
	getTokenInput(tokenName: string) {
		return `mock-${tokenName}`;
	},
}));

const mockReleaseItAction = vi.fn();

vi.mock("../index.js", () => ({
	get releaseItAction() {
		return mockReleaseItAction;
	},
}));

const mockContext = {
	actor: "test-actor",
	repo: {
		owner: "context-owner",
		repo: "context-repo",
	},
} as typeof github.context;

describe("runReleaseItAction", () => {
	beforeEach(() => {
		mockGetBooleanInput.mockReturnValue(false);
		vi.stubEnv("NPM_TOKEN", undefined);
	});

	afterEach(() => {
		vi.unstubAllEnvs();
	});

	it("runs when no optional core inputs are required", async () => {
		mockGetInput.mockReturnValue(undefined);

		await runReleaseItAction(mockContext);

		expect(mockReleaseItAction.mock.calls).toMatchInlineSnapshot(`
			[
			  [
			    {
			      "bypassBranchProtections": undefined,
			      "bypassBranchRulesets": undefined,
			      "gitUserEmail": "test-actor@users.noreply.github.com",
			      "gitUserName": "test-actor",
			      "githubToken": "mock-github-token",
			      "owner": "context-owner",
			      "releaseItArgs": undefined,
			      "repo": "context-repo",
			      "skipNpmPublish": false,
			    },
			  ],
			]
		`);
	});

	it("passes skipNpmPublish as false without calling getBooleanInput when the skip-npm-publish input is empty", async () => {
		mockGetBooleanInput.mockImplementation(() => {
			throw new Error(
				'Input does not meet YAML 1.2 "Core Schema" specification',
			);
		});
		mockGetInput.mockReturnValue("");

		await runReleaseItAction(mockContext);

		expect(mockReleaseItAction).toHaveBeenCalledWith(
			expect.objectContaining({ skipNpmPublish: false }),
		);
	});

	it("passes skipNpmPublish as true when the skip-npm-publish input is true", async () => {
		mockGetBooleanInput.mockReturnValue(true);
		mockGetInput.mockImplementation((name: string) =>
			name === "skip-npm-publish" ? "true" : undefined,
		);

		await runReleaseItAction(mockContext);

		expect(mockReleaseItAction).toHaveBeenCalledWith(
			expect.objectContaining({ skipNpmPublish: true }),
		);
	});

	it("runs when all optional core inputs are required", async () => {
		mockGetInput.mockImplementation((tokenName: string) => `mock-${tokenName}`);

		await runReleaseItAction(mockContext);

		expect(mockReleaseItAction.mock.calls).toMatchInlineSnapshot(`
			[
			  [
			    {
			      "bypassBranchProtections": "mock-bypass-branch-protections",
			      "bypassBranchRulesets": "mock-bypass-branch-rulesets",
			      "gitUserEmail": "mock-git-user-email",
			      "gitUserName": "mock-git-user-name",
			      "githubToken": "mock-github-token",
			      "owner": "context-owner",
			      "releaseItArgs": "mock-release-it-args",
			      "repo": "context-repo",
			      "skipNpmPublish": false,
			    },
			  ],
			]
		`);
	});

	it("does not warn when NPM_TOKEN is not set", async () => {
		await runReleaseItAction(mockContext);

		expect(mockWarning).not.toHaveBeenCalled();
	});

	it("warns that NPM_TOKEN is no longer used when it is set", async () => {
		vi.stubEnv("NPM_TOKEN", "mock-npm-token");

		await runReleaseItAction(mockContext);

		expect(mockWarning).toHaveBeenCalledWith(
			"release-it-action no longer uses NPM_TOKEN. Publish to npm with Trusted Publishing instead: https://docs.npmjs.com/trusted-publishers",
		);
	});
});
