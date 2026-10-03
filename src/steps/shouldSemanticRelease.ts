import * as core from "@actions/core";
import { $ } from "execa";
import { getCommitMeaning } from "should-semantic-release/lib/getCommitMeaning.js";

// Streamed so long histories aren't capped by an output buffer.
const $streamed = $({ buffer: { stdout: false }, reject: false });

export async function shouldSemanticRelease() {
	core.info("Checking commits for release readiness...");

	const gitLog = $streamed`git log --pretty=format:%s`;

	for await (const message of gitLog) {
		core.info(`Checking commit: ${message}`);

		const meaning = getCommitMeaning(message);
		switch (meaning) {
			case "meaningful":
				core.info("Found a meaningful commit. Returning true.");
				return true;
			case "release":
				core.info("Found a release commit. Returning false.");
				return false;
			default:
				core.info(`Found type ${String(meaning.type)}. Continuing.`);
		}
	}

	const { failed, message } = await gitLog;
	if (failed) {
		throw new Error(message);
	}

	core.info(
		"No commits found that indicate a semantic release is necessary. Returning false.",
	);
	return false;
}
