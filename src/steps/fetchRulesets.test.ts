import { beforeEach, describe, expect, it, vi } from "vitest";

import { Octokit } from "../types.js";
import { fetchRulesets } from "./fetchRulesets.js";

const mockInfo = vi.fn();
const mockWarning = vi.fn();

vi.mock("@actions/core", () => ({
	get info() {
		return mockInfo;
	},
	get warning() {
		return mockWarning;
	},
}));

const branch = "test-branch";
const mockPaginate = vi.fn();
const mockRequest = vi.fn();
const mockOctokit = {
	paginate: mockPaginate,
	request: mockRequest,
} as unknown as Octokit;
const requestData = { branch, owner: "test-owner", repo: "test-repo" };

function createRequestError(status: number, message: string) {
	return Object.assign(new Error(message), {
		name: "HttpError",
		response: { data: { message } },
		status,
	});
}

describe("fetchRulesets", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("throws when fetching branch rules fails", async () => {
		mockPaginate.mockRejectedValueOnce(new Error("Oh no!"));

		await expect(
			fetchRulesets({ octokit: mockOctokit, requestData }),
		).rejects.toThrowErrorMatchingInlineSnapshot(
			`[Error: Could not fetch existing branch rules for test-branch: Error: Oh no!]`,
		);
		expect(mockPaginate).toHaveBeenCalledTimes(1);
		expect(mockRequest).not.toHaveBeenCalled();
	});

	it("throws when fetching branch rules is forbidden", async () => {
		mockPaginate.mockRejectedValueOnce(
			createRequestError(403, "Resource not accessible by integration"),
		);

		await expect(
			fetchRulesets({ octokit: mockOctokit, requestData }),
		).rejects.toThrowErrorMatchingInlineSnapshot(
			`[Error: Could not fetch existing branch rules for test-branch: HttpError: Resource not accessible by integration]`,
		);
		expect(mockWarning).not.toHaveBeenCalled();
	});

	it("throws when fetching branch rules is forbidden without a message", async () => {
		mockPaginate.mockRejectedValueOnce(
			Object.assign(new Error("Forbidden"), { name: "HttpError", status: 403 }),
		);

		await expect(
			fetchRulesets({ octokit: mockOctokit, requestData }),
		).rejects.toThrowErrorMatchingInlineSnapshot(
			`[Error: Could not fetch existing branch rules for test-branch: HttpError: Forbidden]`,
		);
		expect(mockWarning).not.toHaveBeenCalled();
	});

	it("returns an empty array with a warning when rulesets aren't available on the repository's plan", async () => {
		mockPaginate.mockRejectedValueOnce(
			createRequestError(
				403,
				"Upgrade to GitHub Pro or make this repository public to enable this feature.",
			),
		);

		const actual = await fetchRulesets({ octokit: mockOctokit, requestData });

		expect(actual).toEqual([]);
		expect(mockRequest).not.toHaveBeenCalled();
		expect(mockWarning.mock.calls).toMatchInlineSnapshot(`
			[
			  [
			    "Repository rulesets aren't available on this repository's GitHub plan, so test-branch has none to bypass.",
			  ],
			]
		`);
	});

	it("returns an empty array when no rules apply to the branch", async () => {
		mockPaginate.mockResolvedValueOnce([]);

		const actual = await fetchRulesets({ octokit: mockOctokit, requestData });

		expect(actual).toEqual([]);
		expect(mockPaginate).toHaveBeenCalledTimes(1);
		expect(mockRequest).not.toHaveBeenCalled();
	});

	it("fetches each unique repository ruleset and skips others", async () => {
		const rulesetA = { enforcement: "active", id: 1, name: "A" };
		const rulesetB = { enforcement: "evaluate", id: 2, name: "B" };

		mockPaginate.mockResolvedValueOnce([
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
		]);
		mockRequest
			.mockResolvedValueOnce({ data: rulesetA })
			.mockResolvedValueOnce({ data: rulesetB });

		const actual = await fetchRulesets({ octokit: mockOctokit, requestData });

		expect(actual).toEqual([rulesetA, rulesetB]);
		expect(mockPaginate).toHaveBeenCalledWith(
			"GET /repos/{owner}/{repo}/rules/branches/{branch}",
			{ ...requestData, per_page: 100 },
		);
		expect(mockRequest.mock.calls).toMatchInlineSnapshot(`
			[
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
		expect(mockInfo).toHaveBeenCalledWith(
			"Skipping Organization ruleset 3 (test-owner): only repository rulesets can be bypassed.",
		);
	});

	it("throws when a ruleset fails to be fetched", async () => {
		mockPaginate.mockResolvedValueOnce([
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
		]);
		mockRequest.mockRejectedValueOnce(new Error("Oh no!"));

		await expect(
			fetchRulesets({ octokit: mockOctokit, requestData }),
		).rejects.toThrowErrorMatchingInlineSnapshot(
			`[Error: Could not fetch existing ruleset 1: Error: Oh no!]`,
		);
		expect(mockRequest).toHaveBeenCalledTimes(1);
	});
});
