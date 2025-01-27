import { describe, expect, it, vi } from "vitest";

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
	it("does nothing when shouldSemanticRelease returns false", async () => {
		mockShouldSemanticRelease.mockResolvedValueOnce(false);

		await releaseItAction(mockOptions);

		expect(mock$$).not.toHaveBeenCalled();
		expect(mockRunReleaseIt).not.toHaveBeenCalled();
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
});
