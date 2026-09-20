import { beforeEach, describe, expect, it, vi } from "vitest";

import { ExistingRuleset, Octokit } from "../types.js";
import { updateRulesetsEnforcement } from "./updateRulesetsEnforcement.js";

const mockInfo = vi.fn();

vi.mock("@actions/core", () => ({
	get info() {
		return mockInfo;
	},
}));

vi.mock("../tryCatchInfoAction.js", () => ({
	async tryCatchInfoAction(_: string, action: () => Promise<unknown>) {
		return await action();
	},
}));

const mockRequest = vi.fn();
const mockOctokit = { request: mockRequest } as unknown as Octokit;
const commonRequestData = {
	branch: "test-branch",
	owner: "test-owner",
	repo: "test-repo",
};

const existingRulesets = [
	{ enforcement: "active", id: 1, name: "A" },
	{ enforcement: "evaluate", id: 2, name: "B" },
] as ExistingRuleset[];

describe("updateRulesetsEnforcement", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("logs and does not request when existingRulesets is undefined", async () => {
		await updateRulesetsEnforcement({
			commonRequestData,
			enforcement: () => "disabled",
			existingRulesets: undefined,
			octokit: mockOctokit,
		});

		expect(mockInfo.mock.calls).toMatchInlineSnapshot(`
			[
			  [
			    "No existing repository rulesets found to update.",
			  ],
			]
		`);
		expect(mockRequest).not.toHaveBeenCalled();
	});

	it("logs and does not request when existingRulesets is empty", async () => {
		await updateRulesetsEnforcement({
			commonRequestData,
			enforcement: () => "disabled",
			existingRulesets: [],
			octokit: mockOctokit,
		});

		expect(mockInfo).toHaveBeenCalledWith(
			"No existing repository rulesets found to update.",
		);
		expect(mockRequest).not.toHaveBeenCalled();
	});

	it("updates each ruleset with the computed enforcement", async () => {
		await updateRulesetsEnforcement({
			commonRequestData,
			enforcement: (ruleset) => ruleset.enforcement,
			existingRulesets,
			octokit: mockOctokit,
		});

		expect(mockInfo).not.toHaveBeenCalled();
		expect(mockRequest.mock.calls).toMatchInlineSnapshot(`
			[
			  [
			    "PUT /repos/{owner}/{repo}/rulesets/{ruleset_id}",
			    {
			      "branch": "test-branch",
			      "enforcement": "active",
			      "owner": "test-owner",
			      "repo": "test-repo",
			      "ruleset_id": 1,
			    },
			  ],
			  [
			    "PUT /repos/{owner}/{repo}/rulesets/{ruleset_id}",
			    {
			      "branch": "test-branch",
			      "enforcement": "evaluate",
			      "owner": "test-owner",
			      "repo": "test-repo",
			      "ruleset_id": 2,
			    },
			  ],
			]
		`);
	});
});
