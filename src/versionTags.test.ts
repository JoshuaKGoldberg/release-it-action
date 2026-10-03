import { describe, expect, it, vi } from "vitest";

import { getHeadTags, getVersionTagNames } from "./versionTags.js";

const mock$quiet = vi.fn();

vi.mock("execa", () => ({
	$:
		() =>
		(strings: TemplateStringsArray, ...values: unknown[]) =>
			mock$quiet(strings, ...values) as unknown,
}));

describe(getHeadTags, () => {
	it("returns each tag that points at HEAD", async () => {
		mock$quiet.mockResolvedValueOnce({ stdout: "1.2.3\nv1.2.3" });

		expect(await getHeadTags()).toEqual(["1.2.3", "v1.2.3"]);
		expect(mock$quiet).toHaveBeenCalledWith(["git tag --points-at HEAD"]);
	});
});

describe(getVersionTagNames, () => {
	it("returns the version with and without a v prefix", () => {
		expect(getVersionTagNames("1.2.3")).toEqual(["1.2.3", "v1.2.3"]);
	});
});
