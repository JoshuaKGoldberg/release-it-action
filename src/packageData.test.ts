import { describe, expect, it, vi } from "vitest";

import { readPackageData } from "./packageData.js";

const mockReadFile = vi.fn();

vi.mock("node:fs/promises", () => ({
	get readFile() {
		return mockReadFile;
	},
}));

describe(readPackageData, () => {
	it("returns the parsed package.json", async () => {
		mockReadFile.mockResolvedValueOnce(JSON.stringify({ version: "1.2.3" }));

		expect(await readPackageData()).toEqual({ version: "1.2.3" });
		expect(mockReadFile).toHaveBeenCalledWith("package.json", "utf8");
	});

	it("returns undefined when there is no package.json", async () => {
		mockReadFile.mockRejectedValueOnce(
			Object.assign(new Error("ENOENT"), { code: "ENOENT" }),
		);

		expect(await readPackageData()).toBeUndefined();
	});

	it("throws when package.json can't be read for another reason", async () => {
		const error = Object.assign(new Error("EACCES"), { code: "EACCES" });
		mockReadFile.mockRejectedValueOnce(error);

		await expect(readPackageData()).rejects.toBe(error);
	});
});
