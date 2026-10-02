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

async function tryCatchAction<T>(
	label: string,
	action: () => Promise<T>,
	logError: (message: string) => void,
) {
	core.info(`Start: ${label}`);
	try {
		const result = await action();
		if ((result as unknown) !== undefined) {
			core.info(`Result from ${label}: ${JSON.stringify(result, null, 4)}`);
		}
		return result;
	} catch (error) {
		logError(`Error ${label}: ${error as string}`);
		return undefined;
	}
}
