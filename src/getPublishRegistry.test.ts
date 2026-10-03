import { beforeEach, describe, expect, it, vi } from "vitest";

import {
	getPublishRegistry,
	getScopedRegistryKey,
} from "./getPublishRegistry.js";

const mock$quiet = vi.fn();

vi.mock("execa", () => ({
	$:
		() =>
		(strings: TemplateStringsArray, ...values: unknown[]) =>
			mock$quiet(strings, ...values) as unknown,
}));

function mockNpmConfig(config: Record<string, string>) {
	mock$quiet.mockImplementation((_strings: TemplateStringsArray, key: string) =>
		Promise.resolve({ exitCode: 0, stdout: `${config[key] ?? "undefined"}\n` }),
	);
}

describe("getPublishRegistry", () => {
	beforeEach(() => {
		mockNpmConfig({});
	});

	it("returns the npm registry when nothing configures a registry", async () => {
		expect(await getPublishRegistry({ name: "test-package" })).toBe(
			"https://registry.npmjs.org/",
		);
	});

	it("returns the npm config registry when there is no publishConfig", async () => {
		mockNpmConfig({ registry: "https://npmrc.example.com/" });

		expect(await getPublishRegistry({ name: "test-package" })).toBe(
			"https://npmrc.example.com/",
		);
	});

	it("prefers the publishConfig registry over the npm config registry", async () => {
		mockNpmConfig({ registry: "https://npmrc.example.com/" });

		expect(
			await getPublishRegistry({
				name: "test-package",
				publishConfig: { registry: "https://example.com" },
			}),
		).toBe("https://example.com");
	});

	it("ignores scoped registries for an unscoped package", async () => {
		mockNpmConfig({ "@scope:registry": "https://npmrc-scope.example.com/" });

		expect(
			await getPublishRegistry({
				name: "test-package",
				publishConfig: { "@scope:registry": "https://npm.pkg.github.com" },
			}),
		).toBe("https://registry.npmjs.org/");
		expect(mock$quiet).toHaveBeenCalledTimes(1);
		expect(mock$quiet).toHaveBeenCalledWith(expect.anything(), "registry");
	});

	it("prefers the scoped publishConfig registry for a scoped package", async () => {
		mockNpmConfig({ "@scope:registry": "https://npmrc-scope.example.com/" });

		expect(
			await getPublishRegistry({
				name: "@scope/test-package",
				publishConfig: {
					"@scope:registry": "https://npm.pkg.github.com",
					registry: "https://example.com",
				},
			}),
		).toBe("https://npm.pkg.github.com");
		expect(mock$quiet).not.toHaveBeenCalled();
	});

	it("prefers the scoped npm config registry over the publishConfig registry for a scoped package", async () => {
		mockNpmConfig({
			"@scope:registry": "https://npmrc-scope.example.com/",
			registry: "https://npmrc.example.com/",
		});

		expect(
			await getPublishRegistry({
				name: "@scope/test-package",
				publishConfig: { registry: "https://example.com" },
			}),
		).toBe("https://npmrc-scope.example.com/");
	});

	it("falls back to the publishConfig registry for a scoped package without a scoped registry", async () => {
		mockNpmConfig({ registry: "https://npmrc.example.com/" });

		expect(
			await getPublishRegistry({
				name: "@scope/test-package",
				publishConfig: { registry: "https://example.com" },
			}),
		).toBe("https://example.com");
	});

	it("falls back to the npm config registry for a scoped package without a scoped registry", async () => {
		mockNpmConfig({ registry: "https://npmrc.example.com/" });

		expect(await getPublishRegistry({ name: "@scope/test-package" })).toBe(
			"https://npmrc.example.com/",
		);
	});

	it("treats empty registries as unset", async () => {
		mockNpmConfig({ "@scope:registry": "", registry: "" });

		expect(
			await getPublishRegistry({
				name: "@scope/test-package",
				publishConfig: { "@scope:registry": "", registry: "" },
			}),
		).toBe("https://registry.npmjs.org/");
	});

	it("treats non-string publishConfig registries as unset", async () => {
		mockNpmConfig({ registry: "https://npmrc.example.com/" });

		expect(
			await getPublishRegistry({
				name: "test-package",
				publishConfig: { registry: 123 },
			}),
		).toBe("https://npmrc.example.com/");
	});

	it("treats npm config registries as unset when npm config fails", async () => {
		mock$quiet.mockResolvedValue({
			exitCode: 1,
			stdout: "https://npmrc.example.com/",
		});

		expect(await getPublishRegistry({ name: "test-package" })).toBe(
			"https://registry.npmjs.org/",
		);
	});
});

describe("getScopedRegistryKey", () => {
	it("returns undefined for an unscoped package", () => {
		expect(getScopedRegistryKey("test-package")).toBeUndefined();
	});

	it("returns the scope's registry key for a scoped package", () => {
		expect(getScopedRegistryKey("@scope/test-package")).toBe("@scope:registry");
	});
});
