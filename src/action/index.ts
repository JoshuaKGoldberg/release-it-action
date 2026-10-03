import * as github from "@actions/github";

import { cancelOnSignals } from "../cancellation.js";
import { runReleaseItAction } from "./runReleaseItAction.js";

cancelOnSignals();

await runReleaseItAction(github.context);
