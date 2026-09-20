import * as github from "@actions/github";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getOptionalTokenInput } from "../getTokenInput.js";
import { runReleaseItAction } from "./runReleaseItAction.js";

process.env.GITHUB_REPOSITORY = "mock-github-repository";

const mockGetBooleanInput = vi.fn();
const mockGetInput = vi.fn();

vi.mock("@actions/core", () => ({
	get getBooleanInput() {
		return mockGetBooleanInput;
	},
	get getInput() {
		return mockGetInput;
	},
}));

vi.mock("../getTokenInput.js", () => ({
	getOptionalTokenInput: vi.fn(),
	getRequiredTokenInput(tokenName: string) {
		return `mock-${tokenName}`;
	},
}));
const mockGetOptionalTokenInput = vi.mocked(getOptionalTokenInput);

const mockReleaseItAction = vi.fn();

vi.mock("../index.js", () => ({
	get releaseItAction() {
		return mockReleaseItAction;
	},
}));

const mockContext = {
	context: { actor: "test-actor" },
	repo: {
		owner: "context-owner",
		repo: "context-repo",
	},
} as unknown as typeof github.context;

describe("runReleaseItAction", () => {
	beforeEach(() => {
		mockGetBooleanInput.mockReturnValue(false);
		mockGetOptionalTokenInput.mockReturnValue("mock-npm-token");
	});

	it("runs when no optional core inputs are required", async () => {
		mockGetInput.mockReturnValue(undefined);
		mockGetOptionalTokenInput.mockReturnValue(undefined);

		await runReleaseItAction(mockContext);

		expect(mockReleaseItAction.mock.calls).toMatchInlineSnapshot(`
			[
			  [
			    {
			      "bypassBranchProtections": undefined,
			      "bypassBranchRulesets": undefined,
			      "gitUserEmail": "undefined@users.noreply.github.com",
			      "gitUserName": undefined,
			      "githubToken": "mock-github-token",
			      "npmToken": undefined,
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
			      "npmToken": "mock-npm-token",
			      "owner": "context-owner",
			      "releaseItArgs": "mock-release-it-args",
			      "repo": "context-repo",
			      "skipNpmPublish": false,
			    },
			  ],
			]
		`);
	});
});
