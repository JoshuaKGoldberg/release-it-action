import * as core from "@actions/core";

export const cancellation = new AbortController();

export function cancelOnSignals() {
	for (const signal of ["SIGINT", "SIGTERM"] as const) {
		process.on(signal, () => {
			core.setFailed(
				`Received ${signal}. Canceling the release and cleaning up.`,
			);
			cancellation.abort(new Error(`Received ${signal}.`));
		});
	}
}
