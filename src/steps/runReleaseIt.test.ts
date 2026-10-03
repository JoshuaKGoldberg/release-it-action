import { describe, expect, it, vi } from "vitest";

import { runReleaseIt } from "./runReleaseIt.js";

const mockError = vi.fn();
const mockInfo = vi.fn();
const mockSetFailed = vi.fn();
const mockWarning = vi.fn();

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
	get warning() {
		return mockWarning;
	},
}));

const mock$$ = vi.fn();

vi.mock("../execa.js", () => ({
	get $$captured() {
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

const mockTryCatchInfoAction = vi.fn(
	async (_: string, action: () => Promise<unknown>) => await action(),
);

vi.mock("../tryCatchInfoAction.js", () => ({
	get tryCatchInfoAction() {
		return mockTryCatchInfoAction;
	},
}));

describe("runReleaseIt", () => {
	it("logs an error if running release-it has a non-zero exit code", async () => {
		mock$$.mockResolvedValue({ exitCode: 1 });

		await runReleaseIt();

		expect(mockError).not.toHaveBeenCalled();
		expect(mockSetFailed.mock.calls).toMatchInlineSnapshot(`
			[
			  [
			    "Error running release-it: Error: Exit code 1.",
			  ],
			]
		`);
	});

	it("does not log an error if running release-it succeeds with stderr output", async () => {
		mock$$.mockResolvedValue({ exitCode: 0, stderr: "npm notice" });

		await runReleaseIt();

		expect(mockError).not.toHaveBeenCalled();
		expect(mockSetFailed).not.toHaveBeenCalled();
	});

	it("logs an error if running release-it crashes altogether", async () => {
		mock$$.mockRejectedValue(new Error("Oh no!"));

		await runReleaseIt();

		expect(mockError).not.toHaveBeenCalled();
		expect(mockSetFailed.mock.calls).toMatchInlineSnapshot(`
			[
			  [
			    "Error running release-it: Error: Oh no!",
			  ],
			]
		`);
	});

	it("logs only the short message of a release-it command failure", async () => {
		mock$$.mockRejectedValue(
			Object.assign(new Error("Command failed...\n\nrelease-it output"), {
				shortMessage:
					"Command failed with exit code 1: npx release-it --verbose",
			}),
		);

		await runReleaseIt();

		expect(mockSetFailed).toHaveBeenCalledWith(
			"Error running release-it: Command failed with exit code 1: npx release-it --verbose",
		);
	});

	it("logs a warning instead of an error if release-it fails and the branch was superseded", async () => {
		mock$$.mockResolvedValue({ exitCode: 1 });
		mockGetHeadSha.mockResolvedValue("start-sha");
		mockCheckSuperseded.mockResolvedValue(true);

		await runReleaseIt();

		expect(mockCheckSuperseded).toHaveBeenCalledWith("start-sha");
		expect(mockWarning.mock.calls).toMatchInlineSnapshot(`
			[
			  [
			    "release-it failed, but the branch has moved past start-sha. A newer release run will handle releasing: Error: Exit code 1.",
			  ],
			]
		`);
		expect(mockError).not.toHaveBeenCalled();
		expect(mockSetFailed).not.toHaveBeenCalled();
	});

	it("logs an error without checking for superseding when skipSupersededCheck is true", async () => {
		mock$$.mockResolvedValue({ exitCode: 1 });
		mockGetHeadSha.mockResolvedValue("start-sha");
		mockCheckSuperseded.mockResolvedValue(true);

		await runReleaseIt("", { skipSupersededCheck: true });

		expect(mockCheckSuperseded).not.toHaveBeenCalled();
		expect(mockWarning).not.toHaveBeenCalled();
		expect(mockSetFailed).toHaveBeenCalledWith(
			"Error running release-it: Error: Exit code 1.",
		);
	});

	it("logs an error if release-it fails and the branch was not superseded", async () => {
		mock$$.mockResolvedValue({ exitCode: 1 });
		mockGetHeadSha.mockResolvedValue("start-sha");
		mockCheckSuperseded.mockResolvedValue(false);

		await runReleaseIt();

		expect(mockError).not.toHaveBeenCalled();
		expect(mockSetFailed).toHaveBeenCalled();
	});

	it.each([
		"npm error 403 403 Forbidden - PUT https://registry.npmjs.org/test - You cannot publish over the previously published versions: 1.2.3.",
		'npm error 409 Conflict - PUT https://registry.npmjs.org/test - Cannot publish over previously staged version "1.2.3".',
	])(
		"logs info instead of an error if release-it fails with a publish conflict that is allowed: %s",
		async (all) => {
			mock$$.mockRejectedValue(Object.assign(new Error("Oh no!"), { all }));
			mockGetHeadSha.mockResolvedValue("start-sha");
			mockCheckSuperseded.mockResolvedValue(false);

			await runReleaseIt("", { allowPublishConflict: true });

			expect(mockInfo).toHaveBeenCalledWith(
				"release-it failed because npm already has this version. A previous release run must have published it: Error: Oh no!",
			);
			expect(mockError).not.toHaveBeenCalled();
			expect(mockSetFailed).not.toHaveBeenCalled();
		},
	);

	it("logs an error if release-it fails with a publish conflict that is not allowed", async () => {
		mock$$.mockRejectedValue(
			Object.assign(new Error("Oh no!"), {
				all: 'Cannot publish over previously staged version "1.2.3".',
			}),
		);
		mockGetHeadSha.mockResolvedValue("start-sha");
		mockCheckSuperseded.mockResolvedValue(false);

		await runReleaseIt("");

		expect(mockError).not.toHaveBeenCalled();
		expect(mockSetFailed).toHaveBeenCalled();
	});

	it("logs an error if release-it fails without a publish conflict when one is allowed", async () => {
		mock$$.mockRejectedValue(
			Object.assign(new Error("Oh no!"), { all: "npm error code E401" }),
		);
		mockGetHeadSha.mockResolvedValue("start-sha");
		mockCheckSuperseded.mockResolvedValue(false);

		await runReleaseIt("", { allowPublishConflict: true });

		expect(mockError).not.toHaveBeenCalled();
		expect(mockSetFailed).toHaveBeenCalled();
	});

	it("logs an error if release-it fails without output when a publish conflict is allowed", async () => {
		mock$$.mockRejectedValueOnce(new Error("Oh no!"));
		mockGetHeadSha.mockResolvedValueOnce("start-sha");
		mockCheckSuperseded.mockResolvedValueOnce(false);

		await runReleaseIt("", { allowPublishConflict: true });

		expect(mockInfo).not.toHaveBeenCalledWith(
			expect.stringContaining("npm already has this version"),
		);
		expect(mockSetFailed).toHaveBeenCalled();
	});

	it("returns false and logs the error when running release-it throws unexpectedly", async () => {
		const { tryCatchInfoAction } = await vi.importActual<
			typeof import("../tryCatchInfoAction.js")
		>("../tryCatchInfoAction.js");
		mockTryCatchInfoAction.mockImplementationOnce(tryCatchInfoAction);
		mock$$.mockRejectedValueOnce(new Error("Command failed"));
		mockGetHeadSha.mockResolvedValueOnce("start-sha");
		mockCheckSuperseded.mockRejectedValueOnce(new Error("Oh no!"));

		expect(await runReleaseIt()).toBe(false);
		expect(mockInfo).toHaveBeenCalledWith(
			"Error running release-it: Error: Oh no!",
		);
	});

	it("logs an error without checking for superseding if the starting sha is unknown", async () => {
		mock$$.mockResolvedValue({ exitCode: 1 });
		mockGetHeadSha.mockResolvedValue(undefined);

		await runReleaseIt();

		expect(mockCheckSuperseded).not.toHaveBeenCalled();
		expect(mockSetFailed).toHaveBeenCalled();
	});

	it("returns true when release-it succeeds", async () => {
		mock$$.mockResolvedValueOnce({ exitCode: 0 });

		expect(await runReleaseIt()).toBe(true);
	});

	it("returns false when release-it fails and the run is failed", async () => {
		mock$$.mockRejectedValueOnce(new Error("Oh no!"));
		mockGetHeadSha.mockResolvedValueOnce("start-sha");
		mockCheckSuperseded.mockResolvedValueOnce(false);

		expect(await runReleaseIt()).toBe(false);
		expect(mockSetFailed).toHaveBeenCalled();
	});

	it("returns false without failing the run when release-it fails and the branch was superseded", async () => {
		mock$$.mockRejectedValueOnce(new Error("Oh no!"));
		mockGetHeadSha.mockResolvedValueOnce("start-sha");
		mockCheckSuperseded.mockResolvedValueOnce(true);

		expect(await runReleaseIt()).toBe(false);
		expect(mockWarning).toHaveBeenCalled();
		expect(mockSetFailed).not.toHaveBeenCalled();
	});

	it("does not log an error if running release-it runs smoothly", async () => {
		mock$$.mockResolvedValue({ exitCode: 0 });

		await runReleaseIt();

		expect(mockError).not.toHaveBeenCalled();
		expect(mockSetFailed).not.toHaveBeenCalled();
	});

	it("does not include releaseItArgs when provided as an empty string", async () => {
		mock$$.mockResolvedValue({ exitCode: 0 });

		await runReleaseIt("");

		expect(mock$$).toHaveBeenCalledWith(["npx release-it --verbose ", ""], []);
		expect(mockError).not.toHaveBeenCalled();
		expect(mockSetFailed).not.toHaveBeenCalled();
	});

	it("includes releaseItArgs when provided as a non-empty string", async () => {
		mock$$.mockResolvedValue({ exitCode: 0 });

		await runReleaseIt("major --preRelease=beta");

		expect(mock$$).toHaveBeenCalledWith(
			["npx release-it --verbose ", ""],
			["major", "--preRelease=beta"],
		);
		expect(mockError).not.toHaveBeenCalled();
		expect(mockSetFailed).not.toHaveBeenCalled();
	});

	it("keeps a quoted releaseItArgs value with spaces as a single argument", async () => {
		mock$$.mockResolvedValue({ exitCode: 0 });

		await runReleaseIt('--github.releaseName="Release v1"');

		expect(mock$$).toHaveBeenCalledWith(
			["npx release-it --verbose ", ""],
			["--github.releaseName=Release v1"],
		);
		expect(mockError).not.toHaveBeenCalled();
		expect(mockSetFailed).not.toHaveBeenCalled();
	});

	it("logs an error without running release-it when releaseItArgs has an unterminated quote", async () => {
		mockGetHeadSha.mockResolvedValue("start-sha");
		mockCheckSuperseded.mockResolvedValue(false);

		await runReleaseIt('--github.releaseName="oops');

		expect(mock$$).not.toHaveBeenCalled();
		expect(mockSetFailed).toHaveBeenCalledWith(
			'Error running release-it: Error: Could not parse arguments (Got EOF while in a quoted string): --github.releaseName="oops',
		);
	});
});
