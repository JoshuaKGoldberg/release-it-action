import { describe, expect, it, vi } from "vitest";

import { Octokit } from "../types.js";
import { getHeadTagMissingGitHubRelease } from "./getHeadTagMissingGitHubRelease.js";

const mock$quiet = vi.fn();

vi.mock("execa", () => ({
	$:
		() =>
		(strings: TemplateStringsArray, ...values: unknown[]) =>
			mock$quiet(strings, ...values) as unknown,
}));

const mockReadFile = vi.fn();

vi.mock("node:fs/promises", () => ({
	get readFile() {
		return mockReadFile;
	},
}));

const mockHasGitHubRelease = vi.fn();

vi.mock("./hasGitHubRelease.js", () => ({
	get hasGitHubRelease() {
		return mockHasGitHubRelease;
	},
}));

const mockOctokit = {} as Octokit;
const options = {
	octokit: mockOctokit,
	owner: "test-owner",
	releaseItArgs: undefined,
	repo: "test-repo",
};
const packageData = { name: "test-package", version: "1.2.3" };
const releaseItJson = { github: { release: true } };

function mockFiles(files: Record<string, object>) {
	mockReadFile.mockImplementation((path: string) =>
		path in files
			? Promise.resolve(JSON.stringify(files[path]))
			: Promise.reject(
					Object.assign(new Error(`ENOENT: ${path}`), { code: "ENOENT" }),
				),
	);
}

function mockHeadTags(stdout: string) {
	mock$quiet.mockResolvedValueOnce({ exitCode: 0, stdout });
}

describe("getHeadTagMissingGitHubRelease", () => {
	it("returns undefined without checking tags when there is no package.json", async () => {
		mockFiles({ ".release-it.json": releaseItJson });

		expect(await getHeadTagMissingGitHubRelease(options)).toBeUndefined();
		expect(mock$quiet).not.toHaveBeenCalled();
	});

	it("returns undefined without checking tags when there is no release-it config", async () => {
		mockFiles({ "package.json": packageData });

		expect(await getHeadTagMissingGitHubRelease(options)).toBeUndefined();
		expect(mock$quiet).not.toHaveBeenCalled();
	});

	it("returns undefined without checking tags when release-it does not create GitHub releases", async () => {
		mockFiles({
			".release-it.json": { github: { release: false } },
			"package.json": packageData,
		});

		expect(await getHeadTagMissingGitHubRelease(options)).toBeUndefined();
		expect(mock$quiet).not.toHaveBeenCalled();
	});

	it("returns undefined without checking tags when release-it creates draft GitHub releases", async () => {
		mockFiles({
			".release-it.json": { github: { draft: true, release: true } },
			"package.json": packageData,
		});

		expect(await getHeadTagMissingGitHubRelease(options)).toBeUndefined();
		expect(mock$quiet).not.toHaveBeenCalled();
	});

	it("returns undefined without checking tags when release-it creates web GitHub releases", async () => {
		mockFiles({
			".release-it.json": { github: { release: true, web: true } },
			"package.json": packageData,
		});

		expect(await getHeadTagMissingGitHubRelease(options)).toBeUndefined();
		expect(mock$quiet).not.toHaveBeenCalled();
	});

	it("returns undefined without checking tags when package.json has no version", async () => {
		mockFiles({
			".release-it.json": releaseItJson,
			"package.json": { name: "test-package" },
		});

		expect(await getHeadTagMissingGitHubRelease(options)).toBeUndefined();
		expect(mock$quiet).not.toHaveBeenCalled();
	});

	it("prefers .release-it.json over package.json", async () => {
		mockFiles({
			".release-it.json": { github: { release: false } },
			"package.json": { ...packageData, "release-it": releaseItJson },
		});

		expect(await getHeadTagMissingGitHubRelease(options)).toBeUndefined();
		expect(mock$quiet).not.toHaveBeenCalled();
	});

	it.each([
		"--no-github.release",
		"--github.release=false",
		"--preRelease=beta --github.draft",
		"--no-github",
		"--config .release-it.beta.json",
		"--config=.release-it.beta.json",
		"-c .release-it.beta.json",
	])(
		"returns undefined without checking tags when release-it-args are %s",
		async (releaseItArgs) => {
			mockFiles({
				".release-it.json": releaseItJson,
				"package.json": packageData,
			});

			expect(
				await getHeadTagMissingGitHubRelease({ ...options, releaseItArgs }),
			).toBeUndefined();
			expect(mock$quiet).not.toHaveBeenCalled();
		},
	);

	it("returns undefined when HEAD is not tagged with the version", async () => {
		mockFiles({
			".release-it.json": releaseItJson,
			"package.json": packageData,
		});
		mockHeadTags("v1.2.2\nother");

		expect(await getHeadTagMissingGitHubRelease(options)).toBeUndefined();
		expect(mockHasGitHubRelease).not.toHaveBeenCalled();
	});

	it("returns undefined when the version tag at HEAD has a GitHub release", async () => {
		mockFiles({
			".release-it.json": releaseItJson,
			"package.json": packageData,
		});
		mockHeadTags("v1.2.3");
		mockHasGitHubRelease.mockResolvedValueOnce(true);

		expect(await getHeadTagMissingGitHubRelease(options)).toBeUndefined();
	});

	it("returns the version tag at HEAD when it has no GitHub release", async () => {
		mockFiles({
			".release-it.json": releaseItJson,
			"package.json": packageData,
		});
		mockHeadTags("other\nv1.2.3");
		mockHasGitHubRelease.mockResolvedValueOnce(false);

		expect(await getHeadTagMissingGitHubRelease(options)).toBe("v1.2.3");
		expect(mock$quiet).toHaveBeenCalledWith(["git tag --points-at HEAD"]);
		expect(mockHasGitHubRelease).toHaveBeenCalledWith({
			octokit: mockOctokit,
			owner: "test-owner",
			repo: "test-repo",
			tag: "v1.2.3",
		});
	});

	it("returns the version tag at HEAD when release-it-args don't override GitHub release settings", async () => {
		mockFiles({
			".release-it.json": releaseItJson,
			"package.json": packageData,
		});
		mockHeadTags("v1.2.3");
		mockHasGitHubRelease.mockResolvedValueOnce(false);

		expect(
			await getHeadTagMissingGitHubRelease({
				...options,
				releaseItArgs: "--preRelease=beta --github.releaseName=Beta",
			}),
		).toBe("v1.2.3");
	});

	it("returns an unprefixed version tag at HEAD using the release-it config in package.json", async () => {
		mockFiles({
			"package.json": { ...packageData, "release-it": releaseItJson },
		});
		mockHeadTags("1.2.3");
		mockHasGitHubRelease.mockResolvedValueOnce(false);

		expect(await getHeadTagMissingGitHubRelease(options)).toBe("1.2.3");
	});
});
