export interface MockCommandResult {
    exitCode?: number;
    stdout?: string;
}
export type MockCommandResults = Record<string, (() => MockCommandResult) | MockCommandResult>;
type CommandImplementation = (strings: TemplateStringsArray, ...values: unknown[]) => Promise<MockCommandResult>;
export declare function mockCommands(mock: {
    mockImplementation(implementation: CommandImplementation): unknown;
}, results: MockCommandResults): void;
export {};
//# sourceMappingURL=mockCommands.d.ts.map