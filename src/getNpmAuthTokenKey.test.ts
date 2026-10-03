import { describe, expect, it, vi } from "vitest";

import { getNpmAuthTokenKey } from "./getNpmAuthTokenKey.js";

const mockReadFile = vi.fn();

vi.mock("node:fs/promises", () => ({
	get readFile() {
		return mockReadFile;
	},
}));

describe("getNpmAuthTokenKey", () => {
	it("uses the npm registry when package.json has no publish registry", async () => {
		mockReadFile.mockResolvedValueOnce(JSON.stringify({ name: "test" }));

		expect(await getNpmAuthTokenKey()).toBe("//registry.npmjs.org/:_authToken");
	});

	it("uses the npm registry when package.json can't be read", async () => {
		mockReadFile.mockRejectedValueOnce(new Error("ENOENT"));

		expect(await getNpmAuthTokenKey()).toBe("//registry.npmjs.org/:_authToken");
	});

	it("uses the scoped publishConfig registry's host", async () => {
		mockReadFile.mockResolvedValueOnce(
			JSON.stringify({
				name: "@scope/test",
				publishConfig: { "@scope:registry": "https://npm.pkg.github.com" },
			}),
		);

		expect(await getNpmAuthTokenKey()).toBe("//npm.pkg.github.com/:_authToken");
	});

	it.each([
		["https://npm.pkg.github.com", "//npm.pkg.github.com/:_authToken"],
		["https://npm.pkg.github.com/OWNER", "//npm.pkg.github.com/:_authToken"],
		["https://example.com/api/npm/", "//example.com/api/npm/:_authToken"],
		["https://example.com/api/npm", "//example.com/api/:_authToken"],
		[
			"https://user:pass@example.com:8080/api/npm/?query#hash",
			"//example.com:8080/api/npm/:_authToken",
		],
	])(
		"uses npm's key for the publishConfig registry %j",
		async (registry, expected) => {
			mockReadFile.mockResolvedValueOnce(
				JSON.stringify({ name: "test", publishConfig: { registry } }),
			);

			expect(await getNpmAuthTokenKey()).toBe(expected);
		},
	);
});
