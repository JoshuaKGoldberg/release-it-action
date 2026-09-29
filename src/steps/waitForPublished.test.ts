import { beforeEach, describe, expect, it, vi } from "vitest";

import { waitForPublished } from "./waitForPublished.js";

const mockGetUnpublishedVersion = vi.fn();

vi.mock("./getUnpublishedVersion.js", () => ({
	get getUnpublishedVersion() {
		return mockGetUnpublishedVersion;
	},
}));

const unpublished = { headTag: "v1.2.3", version: "1.2.3" };

describe("waitForPublished", () => {
	beforeEach(() => {
		mockGetUnpublishedVersion.mockReset();
	});

	it("returns true when the version is already on npm", async () => {
		mockGetUnpublishedVersion.mockResolvedValue(undefined);

		expect(await waitForPublished(3, 0)).toBe(true);
		expect(mockGetUnpublishedVersion).toHaveBeenCalledTimes(1);
	});

	it("returns true once the version appears on npm", async () => {
		mockGetUnpublishedVersion
			.mockResolvedValueOnce(unpublished)
			.mockRejectedValueOnce(new Error("Could not check npm."))
			.mockResolvedValueOnce(undefined);

		expect(await waitForPublished(3, 0)).toBe(true);
		expect(mockGetUnpublishedVersion).toHaveBeenCalledTimes(3);
	});

	it("returns false when the version never appears on npm", async () => {
		mockGetUnpublishedVersion.mockResolvedValue(unpublished);

		expect(await waitForPublished(3, 0)).toBe(false);
		expect(mockGetUnpublishedVersion).toHaveBeenCalledTimes(3);
	});
});
