import { describe, expect, test, vi } from "vitest";

import { runBypassingBranchRulesets } from "./runBypassingBranchRulesets.js";
import { UpdateRulesetsEnforcementOptions } from "./steps/updateRulesetsEnforcement.js";
import { ExistingRuleset, Octokit } from "./types.js";

const mockRequest = vi.fn();
const mockOctokit = { request: mockRequest } as unknown as Octokit;

const existingRulesets = [
	{ enforcement: "active", id: 1, name: "A" },
	{ enforcement: "evaluate", id: 2, name: "B" },
] as ExistingRuleset[];

const mockFetchRulesets = vi.fn().mockResolvedValue(existingRulesets);

vi.mock("./steps/fetchRulesets.js", () => ({
	get fetchRulesets() {
		return mockFetchRulesets;
	},
}));

const mockUpdateRulesetsEnforcement = vi.fn();

vi.mock("./steps/updateRulesetsEnforcement.js", () => ({
	get updateRulesetsEnforcement() {
		return mockUpdateRulesetsEnforcement;
	},
}));

describe("runBypassingBranchRulesets", () => {
	test("API calls", async () => {
		const run = vi.fn();

		await runBypassingBranchRulesets(
			{
				branch: "",
				owner: "",
				repo: "",
			},
			mockOctokit,
			run,
		);

		expect(mockFetchRulesets.mock.calls).toMatchInlineSnapshot(`
			[
			  [
			    {
			      "octokit": {
			        "request": [MockFunction],
			      },
			      "requestData": {
			        "branch": "",
			        "headers": {
			          "X-GitHub-Api-Version": "2022-11-28",
			        },
			        "owner": "",
			        "repo": "",
			      },
			    },
			  ],
			]
		`);
		expect(mockUpdateRulesetsEnforcement.mock.calls).toMatchInlineSnapshot(`
			[
			  [
			    {
			      "commonRequestData": {
			        "branch": "",
			        "headers": {
			          "X-GitHub-Api-Version": "2022-11-28",
			        },
			        "owner": "",
			        "repo": "",
			      },
			      "enforcement": [Function],
			      "existingRulesets": [
			        {
			          "enforcement": "active",
			          "id": 1,
			          "name": "A",
			        },
			        {
			          "enforcement": "evaluate",
			          "id": 2,
			          "name": "B",
			        },
			      ],
			      "octokit": {
			        "request": [MockFunction],
			      },
			    },
			  ],
			  [
			    {
			      "commonRequestData": {
			        "branch": "",
			        "headers": {
			          "X-GitHub-Api-Version": "2022-11-28",
			        },
			        "owner": "",
			        "repo": "",
			      },
			      "enforcement": [Function],
			      "existingRulesets": [
			        {
			          "enforcement": "active",
			          "id": 1,
			          "name": "A",
			        },
			        {
			          "enforcement": "evaluate",
			          "id": 2,
			          "name": "B",
			        },
			      ],
			      "octokit": {
			        "request": [MockFunction],
			      },
			    },
			  ],
			]
		`);

		const [disable, restore] = mockUpdateRulesetsEnforcement.mock.calls.map(
			(call) => (call[0] as UpdateRulesetsEnforcementOptions).enforcement,
		);

		expect(existingRulesets.map(disable)).toEqual(["disabled", "disabled"]);
		expect(existingRulesets.map(restore)).toEqual(["active", "evaluate"]);
		expect(run).toHaveBeenCalled();
	});

	test("order of operations", async () => {
		const order: string[] = [];

		mockUpdateRulesetsEnforcement.mockImplementation(
			({ enforcement }: UpdateRulesetsEnforcementOptions) => {
				order.push(`update:${enforcement(existingRulesets[0])}`);
			},
		);

		await runBypassingBranchRulesets(
			{ branch: "", owner: "", repo: "" },
			mockOctokit,
			async () => {
				order.push("run");
				await Promise.resolve();
			},
		);

		expect(order).toEqual(["update:disabled", "run", "update:active"]);
	});
});
