import * as core from "@actions/core";
import { describe, expect, it, vi } from "vitest";

import { getNpmAuthTokenKey } from "./getNpmAuthTokenKey.js";

vi.mock("@actions/core");

const mockReadFile = vi.fn();

vi.mock("node:fs/promises", () => ({
	get readFile() {
		return mockReadFile;
	},
}));

const mockGetPublishRegistry = vi.fn();

vi.mock("./getPublishRegistry.js", () => ({
	defaultRegistry: "https://registry.npmjs.org/",
	get getPublishRegistry() {
		return mockGetPublishRegistry;
	},
}));

describe("getNpmAuthTokenKey", () => {
	it("gets the publish registry from package.json", async () => {
		const packageData = {
			name: "@scope/test",
			publishConfig: { "@scope:registry": "https://npm.pkg.github.com" },
		};
		mockReadFile.mockResolvedValueOnce(JSON.stringify(packageData));
		mockGetPublishRegistry.mockResolvedValueOnce("https://npm.pkg.github.com");

		expect(await getNpmAuthTokenKey()).toBe("//npm.pkg.github.com/:_authToken");
		expect(mockGetPublishRegistry).toHaveBeenCalledWith(packageData);
	});

	it("gets the publish registry without package data when package.json can't be read", async () => {
		mockReadFile.mockRejectedValueOnce(new Error("ENOENT"));
		mockGetPublishRegistry.mockResolvedValueOnce("https://registry.npmjs.org/");

		expect(await getNpmAuthTokenKey()).toBe("//registry.npmjs.org/:_authToken");
		expect(mockGetPublishRegistry).toHaveBeenCalledWith({});
	});

	it.each([
		["https://registry.npmjs.org/", "//registry.npmjs.org/:_authToken"],
		["https://npm.pkg.github.com", "//npm.pkg.github.com/:_authToken"],
		["https://npm.pkg.github.com/OWNER", "//npm.pkg.github.com/:_authToken"],
		["https://example.com/api/npm/", "//example.com/api/npm/:_authToken"],
		["https://example.com/api/npm", "//example.com/api/:_authToken"],
		[
			"https://user:pass@example.com:8080/api/npm/?query#hash",
			"//example.com:8080/api/npm/:_authToken",
		],
	])("uses npm's key for %j", async (registry, expected) => {
		mockReadFile.mockResolvedValueOnce("{}");
		mockGetPublishRegistry.mockResolvedValueOnce(registry);

		expect(await getNpmAuthTokenKey()).toBe(expected);
		expect(core.warning).not.toHaveBeenCalled();
	});

	it("warns and uses the npm registry when the publish registry isn't a URL", async () => {
		mockReadFile.mockResolvedValueOnce("{}");
		mockGetPublishRegistry.mockResolvedValueOnce("npm.pkg.github.com");

		expect(await getNpmAuthTokenKey()).toBe("//registry.npmjs.org/:_authToken");
		expect(core.warning).toHaveBeenCalledWith(
			'Could not parse npm registry "npm.pkg.github.com" as a URL. Setting the npm token for https://registry.npmjs.org/ instead.',
		);
	});
});
