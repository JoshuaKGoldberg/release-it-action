import * as core from "@actions/core";

import { $$ } from "../execa.js";
import { tryCatchInfoAction } from "../tryCatchInfoAction.js";

export async function runReleaseIt() {
	await tryCatchInfoAction("running release-it", async () => {
		try {
			const { exitCode, stderr } = await $$`release-it --verbose`;
			if (exitCode || stderr) {
				throw new Error(stderr || `Exit code ${exitCode}.`);
			}
		} catch (error) {
			core.error(`Error running release-it: ${error as string}`);
			core.setFailed(error as string);
		}
	});
}
