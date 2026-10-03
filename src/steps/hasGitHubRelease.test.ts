import { describe, expect, it, vi } from "vitest";

import { Octokit } from "../types.js";
import { hasGitHubRelease } from "./hasGitHubRelease.js";

const mockIterator = vi.fn();
const mockRequest = vi.fn();
const mockOctokit = {
	paginate: { iterator: mockIterator },
	request: mockRequest,
} as unknown as Octokit;
const options = {
	octokit: mockOctokit,
	owner: "test-owner",
	repo: "test-repo",
	tag: "v1.2.3",
};

function mockReleasePages(...pages: { tag_name: string }[][]) {
	mockIterator.mockReturnValueOnce(pages.map((data) => ({ data })));
}

describe("hasGitHubRelease", () => {
	it("returns true without listing releases when the published release exists", async () => {
		mockRequest.mockResolvedValueOnce({ data: {} });

		expect(await hasGitHubRelease(options)).toBe(true);
		expect(mockRequest).toHaveBeenCalledWith(
			"GET /repos/{owner}/{repo}/releases/tags/{tag}",
			{ owner: "test-owner", repo: "test-repo", tag: "v1.2.3" },
		);
		expect(mockIterator).not.toHaveBeenCalled();
	});

	it("returns true when a draft release has the tag", async () => {
		mockRequest.mockRejectedValueOnce({ status: 404 });
		mockReleasePages(
			[{ tag_name: "v1.2.4" }],
			[{ tag_name: "v1.2.2" }, { tag_name: "v1.2.3" }],
		);

		expect(await hasGitHubRelease(options)).toBe(true);
		expect(mockIterator).toHaveBeenCalledWith(
			"GET /repos/{owner}/{repo}/releases",
			{ owner: "test-owner", per_page: 100, repo: "test-repo" },
		);
	});

	it("stops listing releases once it finds one with the tag", async () => {
		mockRequest.mockRejectedValueOnce({ status: 404 });
		mockIterator.mockReturnValueOnce(
			(function* () {
				yield { data: [{ tag_name: "v1.2.3" }] };
				throw new Error("Oh no!");
			})(),
		);

		expect(await hasGitHubRelease(options)).toBe(true);
	});

	it("returns false when no release has the tag", async () => {
		mockRequest.mockRejectedValueOnce({ status: 404 });
		mockReleasePages([{ tag_name: "v1.2.2" }], [{ tag_name: "1.2.3" }]);

		expect(await hasGitHubRelease(options)).toBe(false);
	});

	it("returns false when there are no releases", async () => {
		mockRequest.mockRejectedValueOnce({ status: 404 });
		mockReleasePages();

		expect(await hasGitHubRelease(options)).toBe(false);
	});

	it("rethrows other errors", async () => {
		const error = { status: 500 };
		mockRequest.mockRejectedValueOnce(error);

		await expect(hasGitHubRelease(options)).rejects.toBe(error);
		expect(mockIterator).not.toHaveBeenCalled();
	});

	it("rethrows errors from listing releases", async () => {
		const error = Object.assign(new Error("Oh no!"), { status: 500 });
		mockRequest.mockRejectedValueOnce({ status: 404 });
		mockIterator.mockReturnValueOnce(
			(function* () {
				yield { data: [{ tag_name: "v1.2.2" }] };
				throw error;
			})(),
		);

		await expect(hasGitHubRelease(options)).rejects.toBe(error);
	});
});
