import { describe, expect, it, vi } from "vitest";

import { Octokit } from "../types.js";
import { deleteProtections } from "./deleteProtections.js";

const mockInfo = vi.fn();

vi.mock("@actions/core", () => ({
	get info() {
		return mockInfo;
	},
}));

vi.mock("../tryCatchInfoAction.js", () => ({
	async tryCatchInfoAction(_: string, action: () => Promise<unknown>) {
		return await action();
	},
}));

const branch = "test-branch";
const mockRequest = vi.fn();
const mockOctokit = { request: mockRequest } as unknown as Octokit;
const requestData = { branch, owner: "test-owner", repo: "test-repo" };

describe("deleteProtections", () => {
	it("deletes protections when existingProtections exists", async () => {
		await deleteProtections({
			existingProtections: {},
			octokit: mockOctokit,
			requestData,
		});

		expect(mockInfo).not.toHaveBeenCalled();
		expect(mockRequest.mock.calls).toMatchInlineSnapshot(`
			[
			  [
			    "DELETE /repos/{owner}/{repo}/branches/{branch}/protection",
			    {
			      "branch": "test-branch",
			      "owner": "test-owner",
			      "repo": "test-repo",
			    },
			  ],
			]
		`);
	});

	it("does not delete protections when existingProjections does not exist", async () => {
		await deleteProtections({
			existingProtections: undefined,
			octokit: mockOctokit,
			requestData,
		});

		expect(mockInfo.mock.calls).toMatchInlineSnapshot(`
			[
			  [
			    "No existing branch protections found for test-branch.",
			  ],
			]
		`);
		expect(mockRequest).not.toHaveBeenCalled();
	});
});
