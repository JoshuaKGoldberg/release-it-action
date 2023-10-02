import * as core from "@actions/core";

export async function tryCatchInfoAction<T>(
	label: string,
	action: () => Promise<T>,
) {
	core.info(`Start: ${label}`);
	try {
		const result = await action();
		core.info(`Result from ${label}: ${JSON.stringify(result, null, 4)}`);
		return result;
	} catch (error) {
		core.info(`Error ${label}: ${error as string}`);
		return undefined;
	}
}
