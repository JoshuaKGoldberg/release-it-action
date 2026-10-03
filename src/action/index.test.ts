import * as core from "@actions/core";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockContext = { actor: "test-actor" };

vi.mock("@actions/github", () => ({
	get context() {
		return mockContext;
	},
}));

const mockRunReleaseItAction = vi.fn();

vi.mock("./runReleaseItAction.js", () => ({
	get runReleaseItAction() {
		return mockRunReleaseItAction;
	},
}));

vi.mock("@actions/core", () => ({
	setFailed: vi.fn(),
}));
const mockCore = vi.mocked(core);

describe("action entry", () => {
	beforeEach(() => {
		vi.resetModules();
	});

	it("runs the action with the GitHub context", async () => {
		await import("./index.js");

		expect(mockRunReleaseItAction).toHaveBeenCalledWith(mockContext);
		expect(mockCore.setFailed).not.toHaveBeenCalled();
	});

	it("fails the run when the action throws unexpectedly", async () => {
		mockRunReleaseItAction.mockRejectedValueOnce(new Error("Oh no!"));

		await import("./index.js");

		expect(mockCore.setFailed).toHaveBeenCalledWith("Error: Oh no!");
	});
});
