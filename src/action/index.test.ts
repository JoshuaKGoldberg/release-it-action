import { beforeEach, describe, expect, it, vi } from "vitest";

const mockContext = { actor: "test-actor" };

vi.mock("@actions/github", () => ({
	get context() {
		return mockContext;
	},
}));

const mockCancelOnSignals = vi.fn();

vi.mock("../cancellation.js", () => ({
	get cancelOnSignals() {
		return mockCancelOnSignals;
	},
}));

const mockRunReleaseItAction = vi.fn();

vi.mock("./runReleaseItAction.js", () => ({
	get runReleaseItAction() {
		return mockRunReleaseItAction;
	},
}));

describe("action entry", () => {
	beforeEach(() => {
		vi.resetModules();
	});

	it("handles cancellation signals before running the action with the GitHub context", async () => {
		await import("./index.js");

		expect(mockCancelOnSignals).toHaveBeenCalledOnce();
		expect(mockRunReleaseItAction).toHaveBeenCalledWith(mockContext);
		expect(mockCancelOnSignals.mock.invocationCallOrder[0]).toBeLessThan(
			mockRunReleaseItAction.mock.invocationCallOrder[0],
		);
	});
});
