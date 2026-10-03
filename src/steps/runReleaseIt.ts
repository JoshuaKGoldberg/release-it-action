import * as core from "@actions/core";

import { $$captured } from "../execa.js";
import { parseArgsString } from "../parseArgsString.js";
import { tryCatchInfoAction } from "../tryCatchInfoAction.js";
import { checkSuperseded, getHeadSha } from "./checkSuperseded.js";

export interface RunReleaseItOptions {
	allowPublishConflict?: boolean;
	githubToken: string;
	skipSupersededCheck?: boolean;
}

const publishConflict =
	/cannot publish over (?:the )?previously (?:published|staged) version/i;

export async function runReleaseIt(
	releaseItArgs: string,
	{
		allowPublishConflict,
		githubToken,
		skipSupersededCheck,
	}: RunReleaseItOptions,
) {
	await tryCatchInfoAction("running release-it", async () => {
		const startSha = await getHeadSha();

		try {
			const args = parseArgsString(releaseItArgs);
			await $$captured({
				env: { GITHUB_TOKEN: githubToken },
			})`npx release-it --verbose ${args}`;
		} catch (error) {
			if (
				!skipSupersededCheck &&
				startSha &&
				(await checkSuperseded(startSha, githubToken))
			) {
				core.warning(
					`release-it failed, but the branch has moved past ${startSha}. A newer release run will handle releasing: ${describeError(error)}`,
				);
				return;
			}

			if (
				allowPublishConflict &&
				publishConflict.test((error as { all?: string }).all ?? "")
			) {
				core.info(
					`release-it failed because npm already has this version. A previous release run must have published it: ${describeError(error)}`,
				);
				return;
			}

			core.setFailed(`Error running release-it: ${describeError(error)}`);
		}
	});
}

function describeError(error: unknown) {
	return (error as { shortMessage?: string }).shortMessage ?? String(error);
}
