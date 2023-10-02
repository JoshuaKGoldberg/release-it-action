import { describe, expect, it, vi } from "vitest";

import { tryCatchInfoAction } from "./tryCatchInfoAction.js";

const mockInfo = vi.fn();

vi.mock("@actions/core", () => ({
	get info() {
		return mockInfo;
	},
}));

describe("tryCatchInfoAction", () => {
	it("returns the action's result when it resolves", async () => {
		const actual = await tryCatchInfoAction(
			"abc",
			vi.fn().mockResolvedValue("abc"),
		);

		expect(actual).toBe("abc");
		expect(mockInfo.mock.calls).toMatchInlineSnapshot(`
			[
			  [
			    "Start: abc",
			  ],
			  [
			    "Result from abc: \\"abc\\"",
			  ],
			]
		`);
	});

	it("logs the rejection when the action rejects", async () => {
		const actual = await tryCatchInfoAction(
			"running",
			vi.fn().mockRejectedValue(new Error("Oh no!")),
		);

		expect(actual).toBeUndefined();
		expect(mockInfo.mock.calls).toMatchInlineSnapshot(`
			[
			  [
			    "Start: running",
			  ],
			  [
			    "Error running: Error: Oh no!",
			  ],
			]
		`);
	});
});
