import * as core from "@actions/core";
import { parseCommandString } from "execa";

import { $$captured } from "../execa.js";
import { tryCatchInfoAction } from "../tryCatchInfoAction.js";
import { checkSuperseded, getHeadSha } from "./checkSuperseded.js";

export interface RunReleaseItOptions {
	allowPublishConflict?: boolean;
}

const publishConflict =
	/cannot publish over (?:the )?previously (?:published|staged) version/i;

export async function runReleaseIt(
	releaseItArgs?: string,
	{ allowPublishConflict }: RunReleaseItOptions = {},
) {
	const args = parseCommandString(releaseItArgs ?? "");

	await tryCatchInfoAction("running release-it", async () => {
		const startSha = await getHeadSha();

		try {
			const { exitCode } = await $$captured`npx release-it --verbose ${args}`;
			if (exitCode) {
				throw new Error(`Exit code ${exitCode.toString()}.`);
			}
		} catch (error) {
			if (startSha && (await checkSuperseded(startSha))) {
				core.warning(
					`release-it failed, but the branch has moved past ${startSha}. A newer release run will handle releasing: ${error as string}`,
				);
				return;
			}

			if (
				allowPublishConflict &&
				publishConflict.test((error as { all?: string }).all ?? "")
			) {
				core.info(
					`release-it failed because npm already has this version. A previous release run must have published it: ${error as string}`,
				);
				return;
			}

			core.error(`Error running release-it: ${error as string}`);
			core.setFailed(error as string);
		}
	});
}
