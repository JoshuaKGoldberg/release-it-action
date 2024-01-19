import * as github from "@actions/github";

import { runReleaseItAction } from "./runReleaseItAction.js";

await runReleaseItAction(github.context);
