import { describe, expect, it, vi } from "vitest";

import { getTokenInput } from "./getTokenInput.js";

const mockGetInfo = vi.fn();

vi.mock("@actions/core", () => ({
	get getInput() {
		return mockGetInfo;
	},
}));

const mockEnv = vi.fn<() => unknown>();

vi.mock("node:process", () => ({
	get env() {
		return mockEnv();
	},
}));

const backup = "FAKE_BACKUP";
const token = "abc123";
const name = "fake-name";

describe("getTokenInput", () => {
	it("returns the core input when it exists", () => {
		mockGetInfo.mockReturnValueOnce(token);

		const actual = getTokenInput(name, backup);

		expect(actual).toBe(token);
	});

	it("returns the process.env backup when it exists and †he core input doesn't", () => {
		mockGetInfo.mockReturnValueOnce(undefined);
		mockEnv.mockReturnValueOnce({ [backup]: token });

		const actual = getTokenInput(name, backup);

		expect(actual).toBe(token);
	});

	it("throws an error when neither the core input nor process.env backup exist", () => {
		mockGetInfo.mockReturnValueOnce(undefined);
		mockEnv.mockReturnValueOnce({});

		expect(() =>
			getTokenInput(name, backup),
		).toThrowErrorMatchingInlineSnapshot(
			`[Error: No fake-name input or FAKE_BACKUP environment variable defined.]`,
		);
	});
});
