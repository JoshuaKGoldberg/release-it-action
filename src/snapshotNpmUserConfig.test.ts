import { beforeEach, describe, expect, it, vi } from "vitest";

import { snapshotNpmUserConfig } from "./snapshotNpmUserConfig.js";

const mockWarning = vi.fn();

vi.mock("@actions/core", () => ({
	get warning() {
		return mockWarning;
	},
}));

const mock$ = vi.fn();

vi.mock("execa", () => ({
	get $() {
		return mock$;
	},
}));

const mockReadFile = vi.fn();
const mockRm = vi.fn();
const mockWriteFile = vi.fn();

vi.mock("node:fs/promises", () => ({
	get readFile() {
		return mockReadFile;
	},
	get rm() {
		return mockRm;
	},
	get writeFile() {
		return mockWriteFile;
	},
}));

const userConfig = "/home/runner/work/_temp/.npmrc";

describe("snapshotNpmUserConfig", () => {
	beforeEach(() => {
		mock$.mockResolvedValue({ stdout: userConfig });
	});

	it("reads the user config file that npm resolves", async () => {
		mockReadFile.mockResolvedValueOnce(Buffer.from(""));

		await snapshotNpmUserConfig();

		expect(mock$).toHaveBeenCalledWith(["npm config get userconfig"]);
		expect(mockReadFile).toHaveBeenCalledWith(userConfig);
		expect(mockWarning).not.toHaveBeenCalled();
	});

	it("restores the original contents when the user config file existed", async () => {
		const contents = Buffer.from(
			"//registry.npmjs.org/:_authToken=${NODE_AUTH_TOKEN}\n",
		);
		mockReadFile.mockResolvedValueOnce(contents);

		const restore = await snapshotNpmUserConfig();
		await restore?.();

		expect(mockWriteFile).toHaveBeenCalledWith(userConfig, contents);
		expect(mockRm).not.toHaveBeenCalled();
	});

	it("restores an empty user config file", async () => {
		const contents = Buffer.from("");
		mockReadFile.mockResolvedValueOnce(contents);

		const restore = await snapshotNpmUserConfig();
		await restore?.();

		expect(mockWriteFile).toHaveBeenCalledWith(userConfig, contents);
		expect(mockRm).not.toHaveBeenCalled();
	});

	it("removes the user config file when it did not exist", async () => {
		mockReadFile.mockRejectedValueOnce(
			Object.assign(new Error("ENOENT"), { code: "ENOENT" }),
		);

		const restore = await snapshotNpmUserConfig();
		await restore?.();

		expect(mockRm).toHaveBeenCalledWith(userConfig, { force: true });
		expect(mockWriteFile).not.toHaveBeenCalled();
	});

	it("warns and returns undefined when npm cannot resolve the user config file", async () => {
		mock$.mockRejectedValueOnce(
			new Error(
				"The userconfig option is protected, and cannot be retrieved in this way",
			),
		);

		const restore = await snapshotNpmUserConfig();

		expect(restore).toBeUndefined();
		expect(mockReadFile).not.toHaveBeenCalled();
		expect(mockWarning).toHaveBeenCalledWith(
			"Could not snapshot the npmrc, so the npm token will be deleted from it after the run instead: Error: The userconfig option is protected, and cannot be retrieved in this way",
		);
	});

	it("warns and returns undefined when the user config file cannot be read", async () => {
		mockReadFile.mockRejectedValueOnce(
			Object.assign(new Error("EACCES"), { code: "EACCES" }),
		);

		const restore = await snapshotNpmUserConfig();

		expect(restore).toBeUndefined();
		expect(mockWarning).toHaveBeenCalledWith(
			"Could not snapshot the npmrc, so the npm token will be deleted from it after the run instead: Error: EACCES",
		);
	});
});
