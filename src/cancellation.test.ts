import { afterEach, describe, expect, it, vi } from "vitest";

const mockSetFailed = vi.fn();

vi.mock("@actions/core", () => ({
	get setFailed() {
		return mockSetFailed;
	},
}));

const signals = ["SIGINT", "SIGTERM"] as const;

type Signal = (typeof signals)[number];

const existingListeners = new Map(
	signals.map((signal) => [signal, process.rawListeners(signal)]),
);

function getAddedListeners(signal: Signal) {
	return process
		.rawListeners(signal)
		.filter(
			(listener) => !existingListeners.get(signal)?.includes(listener),
		) as NodeJS.SignalsListener[];
}

function receive(signal: Signal) {
	for (const listener of getAddedListeners(signal)) {
		listener(signal);
	}
}

describe("cancelOnSignals", () => {
	afterEach(() => {
		for (const signal of signals) {
			for (const listener of getAddedListeners(signal)) {
				process.removeListener(signal, listener);
			}
		}

		vi.resetModules();
	});

	it("listens for SIGINT and SIGTERM without canceling yet", async () => {
		const { cancellation, cancelOnSignals } = await import("./cancellation.js");

		cancelOnSignals();

		expect(getAddedListeners("SIGINT")).toHaveLength(1);
		expect(getAddedListeners("SIGTERM")).toHaveLength(1);
		expect(cancellation.signal.aborted).toBe(false);
		expect(mockSetFailed).not.toHaveBeenCalled();
	});

	it.each(signals)("cancels and fails the run on %s", async (signal) => {
		const { cancellation, cancelOnSignals } = await import("./cancellation.js");

		cancelOnSignals();
		receive(signal);

		expect(cancellation.signal.reason).toEqual(
			new Error(`Received ${signal}.`),
		);
		expect(mockSetFailed).toHaveBeenCalledWith(
			`Received ${signal}. Canceling the release and cleaning up.`,
		);
	});

	it("keeps listening after a signal so a later one does not kill the process while it cleans up", async () => {
		const { cancellation, cancelOnSignals } = await import("./cancellation.js");

		cancelOnSignals();
		receive("SIGINT");
		receive("SIGTERM");

		expect(getAddedListeners("SIGINT")).toHaveLength(1);
		expect(getAddedListeners("SIGTERM")).toHaveLength(1);
		expect(cancellation.signal.reason).toEqual(new Error("Received SIGINT."));
	});
});
