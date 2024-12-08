import { describe, expect, it, vi } from "vitest";

import { Octokit } from "../types.js";
import { fetchProtections } from "./fetchProtections.js";

vi.mock("../tryCatchInfoAction.js", () => ({
	async tryCatchInfoAction(_: string, action: () => Promise<unknown>) {
		return await action();
	},
}));

const branch = "test-branch";
const mockProtections = { protected: true };
const mockRequest = vi.fn().mockResolvedValue(mockProtections);
const mockOctokit = { request: mockRequest } as unknown as Octokit;
const requestData = { branch, owner: "test-owner", repo: "test-repo" };

describe("fetchProtections", () => {
	it("returns protections when skipBranchProtections is false", async () => {
		const actual = await fetchProtections({
			branch: "",
			octokit: mockOctokit,
			requestData,
			skipBranchProtections: false,
		});

		expect(actual).toBe(mockProtections);
	});

	it("does not return protections when skipBranchProtections is true", async () => {
		const actual = await fetchProtections({
			branch: "",
			octokit: mockOctokit,
			requestData,
			skipBranchProtections: true,
		});

		expect(actual).toBeUndefined();
	});
});
