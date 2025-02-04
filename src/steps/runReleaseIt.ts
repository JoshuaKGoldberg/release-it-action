import * as core from "@actions/core";

import { $$ } from "../execa.js";
import { tryCatchInfoAction } from "../tryCatchInfoAction.js";

export async function runReleaseIt(releaseItArgs?: string) {
	const args = releaseItArgs ? ` ${releaseItArgs}` : "";

	await tryCatchInfoAction("running release-it", async () => {
		try {
			const { exitCode, stderr } = await $$`npx release-it --verbose${args}`;
			if (exitCode || stderr) {
				throw new Error(stderr || `Exit code ${exitCode.toString()}.`);
			}
		} catch (error) {
			core.error(`Error running release-it: ${error as string}`);
			core.setFailed(error as string);
		}
	});
}
