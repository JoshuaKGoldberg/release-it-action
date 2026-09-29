import { describe, expect, it, vi } from "vitest";

import { checkSuperseded, getHeadSha } from "./checkSuperseded.js";

const mock$quiet = vi.fn();

vi.mock("execa", () => ({
	$:
		() =>
		(strings: TemplateStringsArray, ...values: unknown[]) =>
			mock$quiet(strings, ...values) as unknown,
}));

interface MockResult {
	exitCode?: number;
	stdout?: string;
}

function mockCommands(results: Record<string, MockResult>) {
	mock$quiet.mockImplementation(
		(strings: TemplateStringsArray, ...values: unknown[]) => {
			const command = strings.reduce(
				(soFar, string, i) =>
					soFar + string + (i < values.length ? String(values[i]) : ""),
				"",
			);
			return Promise.resolve({ exitCode: 0, stdout: "", ...results[command] });
		},
	);
}

const startSha = "start-sha";

describe("getHeadSha", () => {
	it("returns the HEAD sha when git succeeds", async () => {
		mockCommands({ "git rev-parse HEAD": { stdout: startSha } });

		expect(await getHeadSha()).toBe(startSha);
	});

	it("returns undefined when git fails", async () => {
		mockCommands({ "git rev-parse HEAD": { exitCode: 128 } });

		expect(await getHeadSha()).toBeUndefined();
	});
});

describe("checkSuperseded", () => {
	it("returns false when HEAD is detached", async () => {
		mockCommands({ "git rev-parse --abbrev-ref HEAD": { stdout: "HEAD" } });

		expect(await checkSuperseded(startSha)).toBe(false);
	});

	it("returns false when fetching the branch fails", async () => {
		mockCommands({
			"git fetch origin main": { exitCode: 1 },
			"git rev-parse --abbrev-ref HEAD": { stdout: "main" },
		});

		expect(await checkSuperseded(startSha)).toBe(false);
	});

	it("returns false when the remote branch has not moved", async () => {
		mockCommands({
			"git rev-parse --abbrev-ref HEAD": { stdout: "main" },
			"git rev-parse FETCH_HEAD": { stdout: startSha },
		});

		expect(await checkSuperseded(startSha)).toBe(false);
	});

	it("returns true when the remote branch moved and release-it rolled back", async () => {
		mockCommands({
			"git rev-parse --abbrev-ref HEAD": { stdout: "main" },
			"git rev-parse FETCH_HEAD": { stdout: "remote-sha" },
			"git rev-parse HEAD": { stdout: startSha },
		});

		expect(await checkSuperseded(startSha)).toBe(true);
	});

	it("returns true when the remote branch moved and does not include the local release commit", async () => {
		mockCommands({
			"git merge-base --is-ancestor local-sha remote-sha": { exitCode: 1 },
			"git rev-parse --abbrev-ref HEAD": { stdout: "main" },
			"git rev-parse FETCH_HEAD": { stdout: "remote-sha" },
			"git rev-parse HEAD": { stdout: "local-sha" },
		});

		expect(await checkSuperseded(startSha)).toBe(true);
	});

	it("returns false when the remote branch includes the local release commit", async () => {
		mockCommands({
			"git merge-base --is-ancestor local-sha remote-sha": { exitCode: 0 },
			"git rev-parse --abbrev-ref HEAD": { stdout: "main" },
			"git rev-parse FETCH_HEAD": { stdout: "remote-sha" },
			"git rev-parse HEAD": { stdout: "local-sha" },
		});

		expect(await checkSuperseded(startSha)).toBe(false);
	});

	it("returns false when checking for an ancestor fails altogether", async () => {
		mockCommands({
			"git merge-base --is-ancestor local-sha remote-sha": { exitCode: 128 },
			"git rev-parse --abbrev-ref HEAD": { stdout: "main" },
			"git rev-parse FETCH_HEAD": { stdout: "remote-sha" },
			"git rev-parse HEAD": { stdout: "local-sha" },
		});

		expect(await checkSuperseded(startSha)).toBe(false);
	});
});
