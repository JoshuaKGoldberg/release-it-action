export function parseArgsString(input: string): string[] {
	const args: string[] = [];
	let current = "";
	let inArg = false;
	let quote: string | undefined;

	for (let i = 0; i < input.length; i += 1) {
		const character = input[i];

		if (quote) {
			if (character === quote) {
				quote = undefined;
			} else {
				current += character;
			}
			continue;
		}

		switch (character) {
			case " ":
			case "\t":
				if (inArg) {
					args.push(current);
					current = "";
					inArg = false;
				}
				break;

			case '"':
			case "'":
				quote = character;
				inArg = true;
				break;

			case "\\":
				if (input[i + 1] === " ") {
					current += " ";
					i += 1;
				} else {
					current += character;
				}
				inArg = true;
				break;

			default:
				current += character;
				inArg = true;
		}
	}

	if (quote) {
		throw new Error(`Unterminated ${quote} quote in arguments: ${input}`);
	}

	if (inArg) {
		args.push(current);
	}

	return args;
}
