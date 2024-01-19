import { describe, expect, it, vi } from "vitest";

import { ReleaseItActionOptions, releaseItAction } from "./index.js";

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

const mockFetchProtections = vi.fn();

vi.mock("./steps/fetchProtections.js", () => ({
	get fetchProtections() {
		return mockFetchProtections;
	},
}));

const mockDeleteProtections = vi.fn();

vi.mock("./steps/deleteProtections.js", () => ({
	get deleteProtections() {
		return mockDeleteProtections;
	},
}));

const mockRunReleaseIt = vi.fn();

vi.mock("./steps/runReleaseIt.js", () => ({
	get runReleaseIt() {
		return mockRunReleaseIt;
	},
}));

const mockRecreateProtections = vi.fn();

vi.mock("./steps/recreateProtections.js", () => ({
	get recreateProtections() {
		return mockRecreateProtections;
	},
}));

vi.mock("./tryCatchInfoAction.js", () => ({
	async tryCatchInfoAction(_: string, action: () => Promise<unknown>) {
		return await action();
	},
}));

const mockOptions = {
	branch: "mock-branch",
	gitUserEmail: "mock-gitUserEmail",
	gitUserName: "mock-gitUserName",
	githubToken: "mock-githubToken",
	npmToken: "mock-npmToken",
	owner: "mock-owner",
	repo: "mock-repo",
} satisfies ReleaseItActionOptions;

describe("releaseItAction", () => {
	it("does nothing when shouldSemanticRelease returns false", async () => {
		mockShouldSemanticRelease.mockResolvedValueOnce(false);

		await releaseItAction(mockOptions);

		expect(mock$$).not.toHaveBeenCalled();
	});

	it("runs fully when shouldSemanticRelease returns true", async () => {
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
	});
});
