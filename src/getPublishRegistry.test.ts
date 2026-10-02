import { describe, expect, it } from "vitest";

import { getPublishRegistry } from "./getPublishRegistry.js";

describe("getPublishRegistry", () => {
	it("returns undefined when there is no publishConfig", () => {
		expect(getPublishRegistry({ name: "test-package" })).toBeUndefined();
	});

	it("returns the publishConfig registry for an unscoped package", () => {
		expect(
			getPublishRegistry({
				name: "test-package",
				publishConfig: { registry: "https://example.com" },
			}),
		).toBe("https://example.com");
	});

	it("prefers the scoped publishConfig registry for a scoped package", () => {
		expect(
			getPublishRegistry({
				name: "@scope/test-package",
				publishConfig: {
					"@scope:registry": "https://npm.pkg.github.com",
					registry: "https://example.com",
				},
			}),
		).toBe("https://npm.pkg.github.com");
	});

	it("falls back to the publishConfig registry for a scoped package without a scoped registry", () => {
		expect(
			getPublishRegistry({
				name: "@scope/test-package",
				publishConfig: { registry: "https://example.com" },
			}),
		).toBe("https://example.com");
	});
});
