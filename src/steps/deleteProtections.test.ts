import { describe, expect, it, vi } from "vitest";

import { Octokit } from "../types.js";
import { deleteProtections } from "./deleteProtections.js";

const mockInfo = vi.fn();

vi.mock("@actions/core", () => ({
	get info() {
		return mockInfo;
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

		expect(mockInfo.mock.calls).toMatchInlineSnapshot(`
			[
			  [
			    "Start: deleting existing protections for test-branch",
			  ],
			]
		`);
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

	it("throws when deleting protections fails", async () => {
		mockRequest.mockRejectedValueOnce(
			Object.assign(new Error("Resource not accessible by integration"), {
				name: "HttpError",
				status: 403,
			}),
		);

		await expect(
			deleteProtections({
				existingProtections: {},
				octokit: mockOctokit,
				requestData,
			}),
		).rejects.toThrowErrorMatchingInlineSnapshot(
			`[Error: Could not delete existing branch protections for test-branch: HttpError: Resource not accessible by integration]`,
		);
	});
});
