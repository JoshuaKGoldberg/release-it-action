import { describe, expect, it, vi } from "vitest";

import { runReleaseIt } from "./runReleaseIt.js";

const mockError = vi.fn();
const mockSetFailed = vi.fn();

vi.mock("@actions/core", () => ({
	get error() {
		return mockError;
	},
	get setFailed() {
		return mockSetFailed;
	},
}));

const mock$$ = vi.fn();

vi.mock("../execa.js", () => ({
	get $$() {
		return mock$$;
	},
}));

vi.mock("../tryCatchInfoAction.js", () => ({
	async tryCatchInfoAction(_: string, action: () => Promise<unknown>) {
		return await action();
	},
}));

describe("runReleaseIt", () => {
	it("logs an error if running release-it has a non-zero exit code", async () => {
		mock$$.mockResolvedValue({ exitCode: 1 });

		await runReleaseIt();

		expect(mockError.mock.calls).toMatchInlineSnapshot(`
			[
			  [
			    "Error running release-it: Error: Exit code 1.",
			  ],
			]
		`);
		expect(mockSetFailed.mock.calls).toMatchInlineSnapshot(`
			[
			  [
			    [Error: Exit code 1.],
			  ],
			]
		`);
	});

	it("logs an error if running release-it has stderr output", async () => {
		mock$$.mockResolvedValue({ stderr: "Oh no!" });

		await runReleaseIt();

		expect(mockError.mock.calls).toMatchInlineSnapshot(`
			[
			  [
			    "Error running release-it: Error: Oh no!",
			  ],
			]
		`);
		expect(mockSetFailed.mock.calls).toMatchInlineSnapshot(`
			[
			  [
			    [Error: Oh no!],
			  ],
			]
		`);
	});

	it("logs an error if running release-it crashes altogether", async () => {
		mock$$.mockRejectedValue(new Error("Oh no!"));

		await runReleaseIt();

		expect(mockError.mock.calls).toMatchInlineSnapshot(`
			[
			  [
			    "Error running release-it: Error: Oh no!",
			  ],
			]
		`);
		expect(mockSetFailed.mock.calls).toMatchInlineSnapshot(`
			[
			  [
			    [Error: Oh no!],
			  ],
			]
		`);
	});

	it("does not log an error if running release-it runs smoothly", async () => {
		mock$$.mockResolvedValue({ exitCode: 0 });

		await runReleaseIt();

		expect(mockError).not.toHaveBeenCalled();
		expect(mockSetFailed).not.toHaveBeenCalled();
	});

	it("does not releaseItArgs when provided as an empty string", async () => {
		mock$$.mockResolvedValue({ exitCode: 0 });

		await runReleaseIt("");

		expect(mock$$).toHaveBeenCalledWith(["npx release-it --verbose", ""], "");
		expect(mockError).not.toHaveBeenCalled();
		expect(mockSetFailed).not.toHaveBeenCalled();
	});

	it("includes releaseItArgs when provided as a non-empty string", async () => {
		mock$$.mockResolvedValue({ exitCode: 0 });

		await runReleaseIt("major --preRelease=beta");

		expect(mock$$).toHaveBeenCalledWith(
			["npx release-it --verbose", ""],
			" major --preRelease=beta",
		);
		expect(mockError).not.toHaveBeenCalled();
		expect(mockSetFailed).not.toHaveBeenCalled();
	});
});
