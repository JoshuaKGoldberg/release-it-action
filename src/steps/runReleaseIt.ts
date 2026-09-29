import * as core from "@actions/core";
import { parseCommandString } from "execa";

import { $$ } from "../execa.js";
import { tryCatchInfoAction } from "../tryCatchInfoAction.js";
import { checkSuperseded, getHeadSha } from "./checkSuperseded.js";

export async function runReleaseIt(
	releaseItArgs?: string,
	isAlreadyPublished?: () => Promise<boolean>,
) {
	const args = parseCommandString(releaseItArgs ?? "");

	await tryCatchInfoAction("running release-it", async () => {
		const startSha = await getHeadSha();

		try {
			const { exitCode, stderr } = await $$`npx release-it --verbose ${args}`;
			/* eslint-disable @typescript-eslint/no-unnecessary-condition, @typescript-eslint/prefer-nullish-coalescing, @typescript-eslint/restrict-template-expressions */
			if (exitCode || stderr) {
				throw new Error(stderr || `Exit code ${exitCode?.toString()}.`);
			}
			/* eslint-enable @typescript-eslint/no-unnecessary-condition, @typescript-eslint/prefer-nullish-coalescing, @typescript-eslint/restrict-template-expressions */
		} catch (error) {
			if (startSha && (await checkSuperseded(startSha))) {
				core.info(
					`release-it failed, but the branch has moved past ${startSha}. A newer release run will handle releasing: ${error as string}`,
				);
				return;
			}

			if (await isAlreadyPublished?.()) {
				core.info(
					`release-it failed, but the version is now on npm. A previous release run must have published it: ${error as string}`,
				);
				return;
			}

			core.error(`Error running release-it: ${error as string}`);
			core.setFailed(error as string);
		}
	});
}
