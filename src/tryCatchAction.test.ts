import { describe, expect, it, vi } from "vitest";

import {
	tryCatchInfoAction,
	tryCatchSetFailedAction,
	tryCatchThrowAction,
} from "./tryCatchAction.js";

const mockInfo = vi.fn();
const mockSetFailed = vi.fn();

vi.mock("@actions/core", () => ({
	get info() {
		return mockInfo;
	},
	get setFailed() {
		return mockSetFailed;
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
			    "Result from abc: "abc"",
			  ],
			]
		`);
	});

	it("does not log a result when the action resolves with undefined", async () => {
		await tryCatchInfoAction("abc", vi.fn().mockResolvedValue(undefined));

		expect(mockInfo.mock.calls).toEqual([["Start: abc"]]);
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
		expect(mockSetFailed).not.toHaveBeenCalled();
	});
});

describe("tryCatchSetFailedAction", () => {
	it("returns the action's result when it resolves", async () => {
		const actual = await tryCatchSetFailedAction(
			"abc",
			vi.fn().mockResolvedValue("abc"),
		);

		expect(actual).toBe("abc");
		expect(mockSetFailed).not.toHaveBeenCalled();
	});

	it("sets the run as failed when the action rejects", async () => {
		const actual = await tryCatchSetFailedAction(
			"running",
			vi.fn().mockRejectedValue(new Error("Oh no!")),
		);

		expect(actual).toBeUndefined();
		expect(mockSetFailed.mock.calls).toMatchInlineSnapshot(`
			[
			  [
			    "Error running: Error: Oh no!",
			  ],
			]
		`);
	});
});

describe("tryCatchThrowAction", () => {
	it("logs and returns the action's result when it resolves", async () => {
		const actual = await tryCatchThrowAction(
			"abc",
			vi.fn().mockResolvedValue("abc"),
			"Could not abc",
		);

		expect(actual).toBe("abc");
		expect(mockInfo.mock.calls).toEqual([
			["Start: abc"],
			['Result from abc: "abc"'],
		]);
	});

	it("does not log a result when the action resolves with undefined", async () => {
		await tryCatchThrowAction(
			"abc",
			vi.fn().mockResolvedValue(undefined),
			"Could not abc",
		);

		expect(mockInfo.mock.calls).toEqual([["Start: abc"]]);
	});

	it("throws the failure message with the original error as its cause when the action rejects", async () => {
		const cause = new Error("Oh no!");

		const error = await tryCatchThrowAction(
			"abc",
			vi.fn().mockRejectedValue(cause),
			"Could not abc",
		).catch((caught: unknown) => caught);

		expect(error).toEqual(new Error("Could not abc: Error: Oh no!"));
		expect((error as Error).cause).toBe(cause);
		expect(mockSetFailed).not.toHaveBeenCalled();
	});
});
