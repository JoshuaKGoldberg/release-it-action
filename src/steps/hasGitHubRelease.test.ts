import * as core from "@actions/core";
import { describe, expect, it, vi } from "vitest";

import { Octokit } from "../types.js";
import { hasGitHubRelease } from "./hasGitHubRelease.js";

vi.mock("@actions/core");

const mockReadFile = vi.fn();

vi.mock("node:fs/promises", () => ({
	get readFile() {
		return mockReadFile;
	},
}));

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

interface MockRelease {
	draft: boolean;
	tag_name: string;
}

function mockFiles(files: Record<string, object>) {
	mockReadFile.mockImplementation((path: string) =>
		path in files
			? Promise.resolve(JSON.stringify(files[path]))
			: Promise.reject(new Error(`ENOENT: ${path}`)),
	);
}

function mockReleasePages(...pages: MockRelease[][]) {
	mockIterator.mockReturnValueOnce(pages.map((data) => ({ data })));
}

const draftRelease = { draft: true, tag_name: "v1.2.3" };

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

	it("returns true without reading config when a listed published release has the tag", async () => {
		mockRequest.mockRejectedValueOnce({ status: 404 });
		mockReleasePages(
			[{ draft: false, tag_name: "v1.2.4" }],
			[{ draft: false, tag_name: "v1.2.3" }],
		);

		expect(await hasGitHubRelease(options)).toBe(true);
		expect(mockIterator).toHaveBeenCalledWith(
			"GET /repos/{owner}/{repo}/releases",
			{ owner: "test-owner", per_page: 100, repo: "test-repo" },
		);
		expect(mockReadFile).not.toHaveBeenCalled();
	});

	it("returns true when a draft release has the tag and .release-it.json makes draft releases", async () => {
		mockRequest.mockRejectedValueOnce({ status: 404 });
		mockFiles({ ".release-it.json": { github: { draft: true } } });
		mockReleasePages(
			[{ draft: false, tag_name: "v1.2.4" }],
			[{ draft: false, tag_name: "v1.2.2" }, draftRelease],
		);

		expect(await hasGitHubRelease(options)).toBe(true);
	});

	it("returns true when a draft release has the tag and package.json's release-it config makes draft releases", async () => {
		mockRequest.mockRejectedValueOnce({ status: 404 });
		mockFiles({
			".release-it.json": { github: { release: true } },
			"package.json": { "release-it": { github: { draft: true } } },
		});
		mockReleasePages([draftRelease]);

		expect(await hasGitHubRelease(options)).toBe(true);
	});

	it("returns false and logs when a draft release has the tag but release-it doesn't make draft releases", async () => {
		mockRequest.mockRejectedValueOnce({ status: 404 });
		mockFiles({ "package.json": { name: "test-package" } });
		mockReleasePages([draftRelease]);

		expect(await hasGitHubRelease(options)).toBe(false);
		expect(core.info).toHaveBeenCalledWith(
			"Found a draft release for v1.2.3, but neither .release-it.json nor package.json's \"release-it\" sets github.draft to true, so treating the release as missing. If release-it isn't meant to make drafts, the draft is likely left over from a failed release and can be deleted.",
		);
	});

	it("returns false when a draft release has the tag and .release-it.json turns off draft releases from package.json", async () => {
		mockRequest.mockRejectedValueOnce({ status: 404 });
		mockFiles({
			".release-it.json": { github: { draft: false } },
			"package.json": { "release-it": { github: { draft: true } } },
		});
		mockReleasePages([draftRelease]);

		expect(await hasGitHubRelease(options)).toBe(false);
	});

	it("returns false when a draft release has the tag and there is no config to read", async () => {
		mockRequest.mockRejectedValueOnce({ status: 404 });
		mockFiles({});
		mockReleasePages([draftRelease]);

		expect(await hasGitHubRelease(options)).toBe(false);
	});

	it("stops listing releases once it finds one with the tag", async () => {
		mockRequest.mockRejectedValueOnce({ status: 404 });
		mockIterator.mockReturnValueOnce(
			(function* () {
				yield { data: [{ draft: false, tag_name: "v1.2.3" }] };
				throw new Error("Oh no!");
			})(),
		);

		expect(await hasGitHubRelease(options)).toBe(true);
	});

	it("returns false when no release has the tag", async () => {
		mockRequest.mockRejectedValueOnce({ status: 404 });
		mockReleasePages(
			[{ draft: false, tag_name: "v1.2.2" }],
			[{ draft: true, tag_name: "1.2.3" }],
		);

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
				yield { data: [{ draft: false, tag_name: "v1.2.2" }] };
				throw error;
			})(),
		);

		await expect(hasGitHubRelease(options)).rejects.toBe(error);
	});
});
