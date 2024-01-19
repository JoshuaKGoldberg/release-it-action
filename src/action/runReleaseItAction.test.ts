import * as github from "@actions/github";
import { describe, expect, it, vi } from "vitest";

import { runReleaseItAction } from "./runReleaseItAction.js";

process.env.GITHUB_REPOSITORY = "mock-github-repository";

const mockGetInput = vi.fn();

vi.mock("@actions/core", () => ({
	getBooleanInput: () => false,
	get getInput() {
		return mockGetInput;
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
	context: { actor: "test-actor" },
	repo: {
		owner: "context-owner",
		repo: "context-repo",
	},
} as unknown as typeof github.context;

describe("runReleaseItAction", () => {
	it("runs when no optional core inputs are required", async () => {
		mockGetInput.mockReturnValue(undefined);

		await runReleaseItAction(mockContext);

		expect(mockReleaseItAction.mock.calls).toMatchInlineSnapshot(`
			[
			  [
			    {
			      "branch": "main",
			      "gitUserEmail": "undefined@users.noreply.github.com",
			      "gitUserName": undefined,
			      "githubToken": "mock-github-token",
			      "npmToken": "mock-npm-token",
			      "owner": "context-owner",
			      "repo": "context-repo",
			      "skipBranchProtections": false,
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
			      "branch": "mock-branch",
			      "gitUserEmail": "mock-git-user-email",
			      "gitUserName": "mock-git-user-name",
			      "githubToken": "mock-github-token",
			      "npmToken": "mock-npm-token",
			      "owner": "context-owner",
			      "repo": "context-repo",
			      "skipBranchProtections": false,
			    },
			  ],
			]
		`);
	});
});
