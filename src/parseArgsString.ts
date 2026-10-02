import { split } from "shlex";

export function parseArgsString(input: string): string[] {
	try {
		return split(input);
	} catch (error) {
		throw new Error(
			`Could not parse arguments (${(error as Error).message}): ${input}`,
			{ cause: error },
		);
	}
}
