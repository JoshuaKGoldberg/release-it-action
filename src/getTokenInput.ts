import * as core from "@actions/core";
import * as process from "node:process";

export function getOptionalTokenInput(
	name: string,
	backup: string,
): string | undefined {
	const token = core.getInput(name) || process.env[backup];
	return token;
}

export function getRequiredTokenInput(name: string, backup: string): string {
	const token = getOptionalTokenInput(name, backup);
	if (!token) {
		throw new Error(
			`No ${name} input or ${backup} environment variable defined.`,
		);
	}

	return token;
}
