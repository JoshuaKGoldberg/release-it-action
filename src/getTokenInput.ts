import * as core from "@actions/core";
import * as process from "node:process";

export function getTokenInput(name: string, backup: string) {
	const token = core.getInput(name) || process.env[backup];
	if (!token) {
		throw new Error(
			`No ${name} input or ${backup} environment variable defined.`,
		);
	}

	return token;
}
