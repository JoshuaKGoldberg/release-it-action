import * as core from "@actions/core";

import { $$ } from "../execa.js";
import { tryCatchInfoAction } from "../tryCatchInfoAction.js";

export async function runReleaseIt(releaseItArgs?: string) {
	const args = releaseItArgs ? ` ${releaseItArgs}` : "";

	await tryCatchInfoAction("running release-it", async () => {
		try {
			const { exitCode, stderr } = await $$`npx release-it --verbose${args}`;
			/* eslint-disable @typescript-eslint/no-unnecessary-condition, @typescript-eslint/prefer-nullish-coalescing, @typescript-eslint/restrict-template-expressions */
			if (exitCode || stderr) {
				throw new Error(stderr || `Exit code ${exitCode?.toString()}.`);
			}
			/* eslint-enable @typescript-eslint/no-unnecessary-condition, @typescript-eslint/prefer-nullish-coalescing, @typescript-eslint/restrict-template-expressions */
		} catch (error) {
			core.error(`Error running release-it: ${error as string}`);
			core.setFailed(error as string);
		}
	});
}
