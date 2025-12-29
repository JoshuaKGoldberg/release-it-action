import * as github from "@actions/github";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { runReleaseItAction } from "./runReleaseItAction.js";
import { getOptionalTokenInput } from "../getTokenInput.js";

process.env.GITHUB_REPOSITORY = "mock-github-repository";

const mockGetInput = vi.fn();

vi.mock("@actions/core", () => ({
	getBooleanInput: () => false,
	get getInput() {
		return mockGetInput;
	},
}));

vi.mock("../getTokenInput.js", () => ({
	getOptionalTokenInput: vi.fn(),
	getTokenInput(tokenName: string) {
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
			      "gitUserEmail": "undefined@users.noreply.github.com",
			      "gitUserName": undefined,
			      "githubToken": "mock-github-token",
			      "npmToken": undefined,
			      "owner": "context-owner",
			      "releaseItArgs": undefined,
			      "repo": "context-repo",
			    },
			  ],
			]
		`);
	});

	it("runs when all optional core inputs are required", async () => {
		mockGetInput.mockImplementation((tokenName: string) => `mock-${tokenName}`);

		await runReleaseItAction(mockContext);

		expect(mockReleaseItAction.mock.calls).toMatchInlineSnapshot(`
			[
			  [
			    {
			      "bypassBranchProtections": "mock-bypass-branch-protections",
			      "gitUserEmail": "mock-git-user-email",
			      "gitUserName": "mock-git-user-name",
			      "githubToken": "mock-github-token",
			      "npmToken": "mock-npm-token",
			      "owner": "context-owner",
			      "releaseItArgs": "mock-release-it-args",
			      "repo": "context-repo",
			    },
			  ],
			]
		`);
	});
});
