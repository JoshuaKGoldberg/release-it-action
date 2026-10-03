const increment =
	/^(?:(?:pre)?(?:major|minor|patch)|pre(?:release)?|v?\d+\.\d+\.\d+(?:[-+]\S*)?)$/;

export function withoutIncrement(args: string[]) {
	const end = args.indexOf("--");
	const options = end === -1 ? args : args.slice(0, end);

	return [
		...options.filter(
			(arg, index) =>
				!increment.test(arg) ||
				["--increment", "-i"].includes(options[index - 1] ?? ""),
		),
		"--no-increment",
	];
}
