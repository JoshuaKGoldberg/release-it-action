import { beforeEach, describe, expect, it, vi } from "vitest";

import { ExistingRuleset, Octokit } from "../types.js";
import { updateRulesetsEnforcement } from "./updateRulesetsEnforcement.js";

const mockInfo = vi.fn();

vi.mock("@actions/core", () => ({
	get info() {
		return mockInfo;
	},
}));

const mockTryCatchSetFailedAction = vi.fn(
	async (_: string, action: () => Promise<unknown>) => await action(),
);

vi.mock("../tryCatchAction.js", async (importOriginal) => ({
	...(await importOriginal<typeof import("../tryCatchAction.js")>()),
	get tryCatchSetFailedAction() {
		return mockTryCatchSetFailedAction;
	},
}));

const mockRequest = vi.fn();
const mockOctokit = { request: mockRequest } as unknown as Octokit;
const requestData = {
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

	it("logs and does not request when existingRulesets is empty", async () => {
		await updateRulesetsEnforcement({
			enforcement: () => "disabled",
			existingRulesets: [],
			octokit: mockOctokit,
			requestData,
		});

		expect(mockInfo).toHaveBeenCalledWith(
			"No existing repository rulesets found to update.",
		);
		expect(mockRequest).not.toHaveBeenCalled();
	});

	it("updates each ruleset through tryCatchSetFailedAction when setFailedOnError is true", async () => {
		await updateRulesetsEnforcement({
			enforcement: (ruleset) => ruleset.enforcement,
			existingRulesets,
			octokit: mockOctokit,
			requestData,
			setFailedOnError: true,
		});

		expect(mockInfo).not.toHaveBeenCalled();
		expect(mockTryCatchSetFailedAction).toHaveBeenCalledTimes(2);
		expect(mockRequest).toHaveBeenCalledTimes(2);
	});

	it("does not hand the API responses to the logger when setFailedOnError is true", async () => {
		mockRequest.mockResolvedValue({ data: {}, headers: {}, status: 200 });

		await updateRulesetsEnforcement({
			enforcement: (ruleset) => ruleset.enforcement,
			existingRulesets,
			octokit: mockOctokit,
			requestData,
			setFailedOnError: true,
		});

		for (const { value } of mockTryCatchSetFailedAction.mock.results) {
			expect(await value).toBeUndefined();
		}
	});

	it("updates each ruleset with the computed enforcement", async () => {
		await updateRulesetsEnforcement({
			enforcement: (ruleset) => ruleset.enforcement,
			existingRulesets,
			octokit: mockOctokit,
			requestData,
		});

		expect(mockInfo.mock.calls).toMatchInlineSnapshot(`
			[
			  [
			    "Start: setting ruleset 1 (A) enforcement to active",
			  ],
			  [
			    "Start: setting ruleset 2 (B) enforcement to evaluate",
			  ],
			]
		`);
		expect(mockTryCatchSetFailedAction).not.toHaveBeenCalled();
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

	it("throws without updating later rulesets when an update fails", async () => {
		mockRequest.mockRejectedValueOnce(new Error("Oh no!"));

		await expect(
			updateRulesetsEnforcement({
				enforcement: () => "disabled",
				existingRulesets,
				octokit: mockOctokit,
				requestData,
			}),
		).rejects.toThrowErrorMatchingInlineSnapshot(
			`[Error: Could not set ruleset 1 (A) enforcement to disabled: Error: Oh no!]`,
		);
		expect(mockRequest).toHaveBeenCalledTimes(1);
	});
});
