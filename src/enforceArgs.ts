const increment =
	/^(?:(?:pre)?(?:major|minor|patch)|pre(?:release)?|v?\d+\.\d+\.\d+(?:[-+]\S*)?)$/;

export function enforceArgs(args: string[], enforcedArgs: string[]) {
	const end = args.indexOf("--");
	const options = end === -1 ? args : args.slice(0, end);

	return [
		...(enforcedArgs.includes("--no-increment")
			? withoutIncrements(options)
			: options),
		...enforcedArgs,
	];
}

function withoutIncrements(args: string[]) {
	return args.filter(
		(arg, index) =>
			!increment.test(arg) ||
			["--increment", "-i"].includes(args[index - 1] ?? ""),
	);
}
