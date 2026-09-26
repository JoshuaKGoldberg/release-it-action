import { describe, expect, it, vi } from "vitest";

import { runReleaseIt } from "./runReleaseIt.js";

const mockError = vi.fn();
const mockInfo = vi.fn();
const mockSetFailed = vi.fn();

vi.mock("@actions/core", () => ({
	get error() {
		return mockError;
	},
	get info() {
		return mockInfo;
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

const mockCheckSuperseded = vi.fn();
const mockGetHeadSha = vi.fn();

vi.mock("./checkSuperseded.js", () => ({
	get checkSuperseded() {
		return mockCheckSuperseded;
	},
	get getHeadSha() {
		return mockGetHeadSha;
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

	it("logs info instead of an error if release-it fails and the branch was superseded", async () => {
		mock$$.mockResolvedValue({ exitCode: 1 });
		mockGetHeadSha.mockResolvedValue("start-sha");
		mockCheckSuperseded.mockResolvedValue(true);

		await runReleaseIt();

		expect(mockCheckSuperseded).toHaveBeenCalledWith("start-sha");
		expect(mockInfo.mock.calls).toMatchInlineSnapshot(`
			[
			  [
			    "release-it failed, but the branch has moved past start-sha. A newer release run will handle releasing: Error: Exit code 1.",
			  ],
			]
		`);
		expect(mockError).not.toHaveBeenCalled();
		expect(mockSetFailed).not.toHaveBeenCalled();
	});

	it("logs an error if release-it fails and the branch was not superseded", async () => {
		mock$$.mockResolvedValue({ exitCode: 1 });
		mockGetHeadSha.mockResolvedValue("start-sha");
		mockCheckSuperseded.mockResolvedValue(false);

		await runReleaseIt();

		expect(mockError).toHaveBeenCalled();
		expect(mockSetFailed).toHaveBeenCalled();
	});

	it("logs an error without checking for superseding if the starting sha is unknown", async () => {
		mock$$.mockResolvedValue({ exitCode: 1 });
		mockGetHeadSha.mockResolvedValue(undefined);

		await runReleaseIt();

		expect(mockCheckSuperseded).not.toHaveBeenCalled();
		expect(mockSetFailed).toHaveBeenCalled();
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
