import * as core from "@actions/core";

export async function tryCatchInfoAction<T>(
	label: string,
	action: () => Promise<T>,
) {
	return await tryCatchAction(label, action, core.info);
}

export async function tryCatchSetFailedAction<T>(
	label: string,
	action: () => Promise<T>,
) {
	return await tryCatchAction(label, action, core.setFailed);
}

export async function tryCatchThrowAction<T>(
	label: string,
	action: () => Promise<T>,
	failure: string,
) {
	core.info(`Start: ${label}`);

	let result: T;

	try {
		result = await action();
	} catch (error) {
		throw new Error(`${failure}: ${String(error)}`, { cause: error });
	}

	logResult(label, result);

	return result;
}

function logResult(label: string, result: unknown) {
	if (result !== undefined) {
		core.info(`Result from ${label}: ${JSON.stringify(result, null, 4)}`);
	}
}

async function tryCatchAction<T>(
	label: string,
	action: () => Promise<T>,
	logError: (message: string) => void,
) {
	core.info(`Start: ${label}`);
	try {
		const result = await action();
		logResult(label, result);
		return result;
	} catch (error) {
		logError(`Error ${label}: ${error as string}`);
		return undefined;
	}
}
