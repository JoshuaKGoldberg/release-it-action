import { describe, expect, it, vi } from "vitest";

import { getTagNames } from "./getTagNames.js";

const mockReadFile = vi.fn();

vi.mock("node:fs/promises", () => ({
	get readFile() {
		return mockReadFile;
	},
}));

const packageData = { name: "test-package", version: "1.2.3" };

function mockReleaseItJson(config: object) {
	mockReadFile.mockResolvedValueOnce(JSON.stringify(config));
}

describe("getTagNames", () => {
	it("returns the version with and without a v prefix when there is no release-it config", async () => {
		mockReadFile.mockRejectedValueOnce(new Error("ENOENT"));

		expect(await getTagNames(packageData)).toEqual(["1.2.3", "v1.2.3"]);
	});

	it("returns the version with and without a v prefix when the config has no tagName", async () => {
		mockReleaseItJson({ git: { requireCommits: true } });

		expect(await getTagNames(packageData)).toEqual(["1.2.3", "v1.2.3"]);
	});

	it("renders a tagName from .release-it.json", async () => {
		mockReleaseItJson({ git: { tagName: "${npm.name}@${version}" } });

		expect(await getTagNames(packageData)).toEqual(["test-package@1.2.3"]);
	});

	it("renders a tagName using ${name}", async () => {
		mockReleaseItJson({ git: { tagName: "${name}-v${version}" } });

		expect(await getTagNames(packageData)).toEqual(["test-package-v1.2.3"]);
	});

	it("renders a tagName from package.json when there is no .release-it.json", async () => {
		mockReadFile.mockRejectedValueOnce(new Error("ENOENT"));

		expect(
			await getTagNames({
				...packageData,
				"release-it": { git: { tagName: "release-${version}" } },
			}),
		).toEqual(["release-1.2.3"]);
	});

	it("prefers .release-it.json over package.json", async () => {
		mockReleaseItJson({ git: { tagName: "json-${version}" } });

		expect(
			await getTagNames({
				...packageData,
				"release-it": { git: { tagName: "package-${version}" } },
			}),
		).toEqual(["json-1.2.3"]);
	});

	it("falls back to the default tag names when the tagName uses other template variables", async () => {
		mockReleaseItJson({ git: { tagName: "${branchName}-${version}" } });

		expect(await getTagNames(packageData)).toEqual(["1.2.3", "v1.2.3"]);
	});
});
