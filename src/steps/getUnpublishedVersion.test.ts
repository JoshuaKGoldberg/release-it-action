import { describe, expect, it, vi } from "vitest";

import { getUnpublishedVersion } from "./getUnpublishedVersion.js";

const mock$quiet = vi.fn();

vi.mock("execa", () => ({
	$:
		() =>
		(strings: TemplateStringsArray, ...values: unknown[]) =>
			mock$quiet(strings, ...values) as unknown,
}));

vi.mock("@actions/core");

const mockSetTimeout = vi.fn();

vi.mock("node:timers/promises", () => ({
	get setTimeout() {
		return mockSetTimeout;
	},
}));

const mockReadFile = vi.fn();

vi.mock("node:fs/promises", () => ({
	get readFile() {
		return mockReadFile;
	},
}));

interface MockResult {
	exitCode?: number;
	stdout?: string;
}

function mockCommands(
	results: Record<string, (() => MockResult) | MockResult>,
) {
	mock$quiet.mockImplementation(
		(strings: TemplateStringsArray, ...values: unknown[]) => {
			const command = strings
				.reduce(
					(soFar, string, i) =>
						soFar +
						string +
						(i < values.length ? [values[i]].flat().join(" ") : ""),
					"",
				)
				.trim();

			const result = results[command];

			return Promise.resolve({
				exitCode: 0,
				stdout: "",
				...(typeof result === "function" ? result() : result),
			});
		},
	);
}

function mockPackageJson(data: object) {
	mockReadFile.mockResolvedValueOnce(JSON.stringify(data));
}

const packageData = { name: "test-package", version: "1.2.3" };
const notFound = { exitCode: 1, stdout: '{"error":{"code":"E404"}}' };
const recentTagTime = { stdout: String(Math.floor(Date.now() / 1000)) };

describe("getUnpublishedVersion", () => {
	it("returns undefined when the package is private", async () => {
		mockPackageJson({ ...packageData, private: true });

		expect(await getUnpublishedVersion()).toBeUndefined();
		expect(mock$quiet).not.toHaveBeenCalled();
	});

	it("returns undefined when the version is on npm", async () => {
		mockPackageJson(packageData);
		mockCommands({});

		expect(await getUnpublishedVersion()).toBeUndefined();
	});

	it("checks the publishConfig registry when one is set", async () => {
		mockPackageJson({
			...packageData,
			publishConfig: { registry: "https://npm.pkg.github.com" },
		});
		mockCommands({});

		await getUnpublishedVersion();

		expect(mock$quiet).toHaveBeenCalledWith(
			expect.anything(),
			"test-package",
			"1.2.3",
			["--registry", "https://npm.pkg.github.com"],
		);
	});

	it("checks the scoped publishConfig registry for a scoped package", async () => {
		mockPackageJson({
			name: "@scope/test-package",
			publishConfig: {
				"@scope:registry": "https://npm.pkg.github.com",
				registry: "https://example.com",
			},
			version: "1.2.3",
		});
		mockCommands({});

		await getUnpublishedVersion();

		expect(mock$quiet).toHaveBeenCalledWith(
			expect.anything(),
			"@scope/test-package",
			"1.2.3",
			["--registry", "https://npm.pkg.github.com"],
		);
	});

	it("falls back to the plain publishConfig registry for a scoped package without a scoped registry", async () => {
		mockPackageJson({
			name: "@scope/test-package",
			publishConfig: { registry: "https://example.com" },
			version: "1.2.3",
		});
		mockCommands({});

		await getUnpublishedVersion();

		expect(mock$quiet).toHaveBeenCalledWith(
			expect.anything(),
			"@scope/test-package",
			"1.2.3",
			["--registry", "https://example.com"],
		);
	});

	it("throws when npm fails for a reason other than a missing version", async () => {
		mockPackageJson(packageData);
		mockCommands({
			"npm view test-package@1.2.3 version --json": {
				exitCode: 1,
				stdout: '{"error":{"code":"ECONNRESET"}}',
			},
		});

		await expect(getUnpublishedVersion()).rejects.toThrow(
			"Could not check npm for test-package@1.2.3.",
		);
	});

	it("returns undefined when the version is not on npm and was never tagged", async () => {
		mockPackageJson(packageData);
		mockCommands({
			"npm view test-package@1.2.3 version --json": notFound,
		});

		expect(await getUnpublishedVersion()).toBeUndefined();
	});

	it("returns the version without a headTag when it was tagged on an older commit", async () => {
		mockPackageJson(packageData);
		mockCommands({
			"git tag --list 1.2.3 v1.2.3": { stdout: "v1.2.3" },
			"git tag --points-at HEAD": { stdout: "" },
			"npm view test-package@1.2.3 version --json": notFound,
		});

		expect(await getUnpublishedVersion()).toEqual({
			headTag: undefined,
			version: "1.2.3",
		});
	});

	it("returns the version with its headTag when it was tagged at HEAD", async () => {
		mockPackageJson(packageData);
		mockCommands({
			"git tag --list 1.2.3 v1.2.3": { stdout: "1.2.3" },
			"git tag --points-at HEAD": { stdout: "other\n1.2.3" },
			"npm view test-package@1.2.3 version --json": notFound,
		});

		expect(await getUnpublishedVersion()).toEqual({
			headTag: "1.2.3",
			version: "1.2.3",
		});
	});

	it("returns undefined when a recently tagged version shows up on npm after rechecking", async () => {
		const npmResults = [notFound, notFound, {}];
		mockPackageJson(packageData);
		mockCommands({
			"git log -1 --format=%ct v1.2.3": recentTagTime,
			"git tag --list 1.2.3 v1.2.3": { stdout: "v1.2.3" },
			"npm view test-package@1.2.3 version --json": () =>
				npmResults.shift() ?? {},
		});

		expect(await getUnpublishedVersion()).toBeUndefined();
		expect(mockSetTimeout).toHaveBeenCalledTimes(2);
	});

	it("returns the version when a recently tagged version never shows up on npm", async () => {
		mockPackageJson(packageData);
		mockCommands({
			"git log -1 --format=%ct v1.2.3": recentTagTime,
			"git tag --list 1.2.3 v1.2.3": { stdout: "v1.2.3" },
			"git tag --points-at HEAD": { stdout: "v1.2.3" },
			"npm view test-package@1.2.3 version --json": notFound,
		});

		expect(await getUnpublishedVersion()).toEqual({
			headTag: "v1.2.3",
			version: "1.2.3",
		});
		expect(mockSetTimeout).toHaveBeenCalledTimes(12);
	});

	it("does not recheck npm when the version was tagged long ago", async () => {
		mockPackageJson(packageData);
		mockCommands({
			"git log -1 --format=%ct v1.2.3": { stdout: "1000000000" },
			"git tag --list 1.2.3 v1.2.3": { stdout: "v1.2.3" },
			"npm view test-package@1.2.3 version --json": notFound,
		});

		expect(await getUnpublishedVersion()).toEqual({
			headTag: undefined,
			version: "1.2.3",
		});
		expect(mockSetTimeout).not.toHaveBeenCalled();
	});
});
