import { beforeEach, describe, expect, it, vi } from "vitest";

import { Octokit } from "../types.js";
import { fetchRulesets } from "./fetchRulesets.js";

const mockInfo = vi.fn();

vi.mock("@actions/core", () => ({
	get info() {
		return mockInfo;
	},
}));

vi.mock("../tryCatchInfoAction.js", () => ({
	async tryCatchInfoAction(_: string, action: () => Promise<unknown>) {
		try {
			return await action();
		} catch {
			return undefined;
		}
	},
}));

const branch = "test-branch";
const mockRequest = vi.fn();
const mockOctokit = { request: mockRequest } as unknown as Octokit;
const requestData = { branch, owner: "test-owner", repo: "test-repo" };

describe("fetchRulesets", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns undefined when fetching branch rules fails", async () => {
		mockRequest.mockRejectedValueOnce(new Error("Oh no!"));

		const actual = await fetchRulesets({ octokit: mockOctokit, requestData });

		expect(actual).toBeUndefined();
		expect(mockRequest).toHaveBeenCalledTimes(1);
	});

	it("returns an empty array when no rules apply to the branch", async () => {
		mockRequest.mockResolvedValueOnce({ data: [] });

		const actual = await fetchRulesets({ octokit: mockOctokit, requestData });

		expect(actual).toEqual([]);
		expect(mockRequest).toHaveBeenCalledTimes(1);
	});

	it("fetches each unique repository ruleset and skips others", async () => {
		const rulesetA = { enforcement: "active", id: 1, name: "A" };
		const rulesetB = { enforcement: "evaluate", id: 2, name: "B" };

		mockRequest
			.mockResolvedValueOnce({
				data: [
					{
						ruleset_id: 1,
						ruleset_source_type: "Repository",
						type: "deletion",
					},
					{
						ruleset_id: 1,
						ruleset_source_type: "Repository",
						type: "pull_request",
					},
					{
						ruleset_id: 3,
						ruleset_source: "test-owner",
						ruleset_source_type: "Organization",
						type: "deletion",
					},
					{ type: "non_fast_forward" },
					{
						ruleset_id: 2,
						ruleset_source_type: "Repository",
						type: "deletion",
					},
				],
			})
			.mockResolvedValueOnce({ data: rulesetA })
			.mockResolvedValueOnce({ data: rulesetB });

		const actual = await fetchRulesets({ octokit: mockOctokit, requestData });

		expect(actual).toEqual([rulesetA, rulesetB]);
		expect(mockRequest.mock.calls).toMatchInlineSnapshot(`
			[
			  [
			    "GET /repos/{owner}/{repo}/rules/branches/{branch}",
			    {
			      "branch": "test-branch",
			      "owner": "test-owner",
			      "repo": "test-repo",
			    },
			  ],
			  [
			    "GET /repos/{owner}/{repo}/rulesets/{ruleset_id}",
			    {
			      "branch": "test-branch",
			      "owner": "test-owner",
			      "repo": "test-repo",
			      "ruleset_id": 1,
			    },
			  ],
			  [
			    "GET /repos/{owner}/{repo}/rulesets/{ruleset_id}",
			    {
			      "branch": "test-branch",
			      "owner": "test-owner",
			      "repo": "test-repo",
			      "ruleset_id": 2,
			    },
			  ],
			]
		`);
		expect(mockInfo.mock.calls).toMatchInlineSnapshot(`
			[
			  [
			    "Skipping Organization ruleset 3 (test-owner): only repository rulesets can be bypassed.",
			  ],
			]
		`);
	});

	it("omits rulesets that fail to be fetched", async () => {
		const rulesetB = { enforcement: "active", id: 2, name: "B" };

		mockRequest
			.mockResolvedValueOnce({
				data: [
					{
						ruleset_id: 1,
						ruleset_source_type: "Repository",
						type: "deletion",
					},
					{
						ruleset_id: 2,
						ruleset_source_type: "Repository",
						type: "deletion",
					},
				],
			})
			.mockRejectedValueOnce(new Error("Oh no!"))
			.mockResolvedValueOnce({ data: rulesetB });

		const actual = await fetchRulesets({ octokit: mockOctokit, requestData });

		expect(actual).toEqual([rulesetB]);
	});
});
