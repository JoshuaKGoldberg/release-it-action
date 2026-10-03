import { describe, expect, test, vi } from "vitest";

import { runBypassingBranchProtections } from "./runBypassingBranchProtections.js";
import { Octokit } from "./types.js";

const mockRequest = vi.fn();
const mockOctokit = { request: mockRequest } as unknown as Octokit;

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

const mockRecreateProtections = vi.fn();

vi.mock("./steps/recreateProtections.js", () => ({
	get recreateProtections() {
		return mockRecreateProtections;
	},
}));

describe("runBypassingBranchProtections", () => {
	test("API calls", async () => {
		const run = vi.fn();

		await runBypassingBranchProtections(
			{
				branch: "",
				owner: "",
				repo: "",
			},
			mockOctokit,
			run,
		);

		expect(mockFetchProtections.mock.calls).toMatchInlineSnapshot(`
			[
			  [
			    {
			      "octokit": {
			        "request": [MockFunction],
			      },
			      "requestData": {
			        "branch": "",
			        "headers": {
			          "X-GitHub-Api-Version": "2022-11-28",
			        },
			        "owner": "",
			        "repo": "",
			      },
			    },
			  ],
			]
		`);
		expect(mockDeleteProtections.mock.calls).toMatchInlineSnapshot(`
			[
			  [
			    {
			      "existingProtections": undefined,
			      "octokit": {
			        "request": [MockFunction],
			      },
			      "requestData": {
			        "branch": "",
			        "headers": {
			          "X-GitHub-Api-Version": "2022-11-28",
			        },
			        "owner": "",
			        "repo": "",
			      },
			    },
			  ],
			]
		`);
		expect(mockRecreateProtections.mock.calls).toMatchInlineSnapshot(`
			[
			  [
			    {
			      "existingProtections": undefined,
			      "octokit": {
			        "request": [MockFunction],
			      },
			      "requestData": {
			        "branch": "",
			        "headers": {
			          "X-GitHub-Api-Version": "2022-11-28",
			        },
			        "owner": "",
			        "repo": "",
			      },
			    },
			  ],
			]
		`);
		expect(run).toHaveBeenCalled();
	});

	test("recreates protections when run rejects", async () => {
		const error = new Error("Oh no!");
		const run = vi.fn().mockRejectedValue(error);

		await expect(
			runBypassingBranchProtections(
				{ branch: "", owner: "", repo: "" },
				mockOctokit,
				run,
			),
		).rejects.toBe(error);

		expect(mockRecreateProtections).toHaveBeenCalled();
	});

	test("recreates protections without running when deleting them rejects", async () => {
		const error = new Error("Oh no!");
		const existingProtections = {};
		const run = vi.fn();
		mockFetchProtections.mockResolvedValueOnce(existingProtections);
		mockDeleteProtections.mockRejectedValueOnce(error);

		await expect(
			runBypassingBranchProtections(
				{ branch: "", owner: "", repo: "" },
				mockOctokit,
				run,
			),
		).rejects.toBe(error);

		expect(run).not.toHaveBeenCalled();
		expect(mockRecreateProtections).toHaveBeenCalledWith(
			expect.objectContaining({ existingProtections }),
		);
	});

	test("does not delete, run, or recreate protections when fetching them rejects", async () => {
		const error = new Error("Oh no!");
		const run = vi.fn();
		mockFetchProtections.mockRejectedValueOnce(error);

		await expect(
			runBypassingBranchProtections(
				{ branch: "", owner: "", repo: "" },
				mockOctokit,
				run,
			),
		).rejects.toBe(error);

		expect(mockDeleteProtections).not.toHaveBeenCalled();
		expect(run).not.toHaveBeenCalled();
		expect(mockRecreateProtections).not.toHaveBeenCalled();
	});
});
