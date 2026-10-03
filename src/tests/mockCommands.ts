export interface MockCommandResult {
	exitCode?: number;
	stdout?: string;
}

export type MockCommandResults = Record<
	string,
	(() => MockCommandResult) | MockCommandResult
>;

type CommandImplementation = (
	strings: TemplateStringsArray,
	...values: unknown[]
) => Promise<MockCommandResult>;

export function mockCommands(
	mock: { mockImplementation(implementation: CommandImplementation): unknown },
	results: MockCommandResults,
) {
	mock.mockImplementation((strings, ...values) => {
		const command = strings
			.reduce(
				(soFar, string, i) =>
					soFar +
					string +
					(i < values.length ? [values[i]].flat().join(" ") : ""),
				"",
			)
			.trim();
		const result = results[command];

		return Promise.resolve({
			exitCode: 0,
			stdout: "",
			...(typeof result === "function" ? result() : result),
		});
	});
}
