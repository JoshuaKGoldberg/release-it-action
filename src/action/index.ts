import * as core from "@actions/core";
import * as github from "@actions/github";

import { runReleaseItAction } from "./runReleaseItAction.js";

try {
	await runReleaseItAction(github.context);
} catch (error) {
	core.setFailed(String(error));
}
