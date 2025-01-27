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
			        "request": [MockFunction spy],
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
			        "request": [MockFunction spy],
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
			      "commonRequestData": {
			        "branch": "",
			        "headers": {
			          "X-GitHub-Api-Version": "2022-11-28",
			        },
			        "owner": "",
			        "repo": "",
			      },
			      "existingProtections": undefined,
			      "octokit": {
			        "request": [MockFunction spy],
			      },
			    },
			  ],
			]
		`);
		expect(run).toHaveBeenCalled();
	});
});
