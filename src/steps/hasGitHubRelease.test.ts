import { describe, expect, it, vi } from "vitest";

import { Octokit } from "../types.js";
import { hasGitHubRelease } from "./hasGitHubRelease.js";

const mockRequest = vi.fn();
const mockOctokit = { request: mockRequest } as unknown as Octokit;
const options = {
	octokit: mockOctokit,
	owner: "test-owner",
	repo: "test-repo",
	tag: "v1.2.3",
};

describe("hasGitHubRelease", () => {
	it("returns true when the release exists", async () => {
		mockRequest.mockResolvedValueOnce({ data: {} });

		expect(await hasGitHubRelease(options)).toBe(true);
		expect(mockRequest).toHaveBeenCalledWith(
			"GET /repos/{owner}/{repo}/releases/tags/{tag}",
			{ owner: "test-owner", repo: "test-repo", tag: "v1.2.3" },
		);
	});

	it("returns false when the release is not found", async () => {
		mockRequest.mockRejectedValueOnce({ status: 404 });

		expect(await hasGitHubRelease(options)).toBe(false);
	});

	it("rethrows other errors", async () => {
		const error = { status: 500 };
		mockRequest.mockRejectedValueOnce(error);

		await expect(hasGitHubRelease(options)).rejects.toBe(error);
	});
});
