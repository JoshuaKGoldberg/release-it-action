import { describe, expect, it, vi } from "vitest";

import { Octokit } from "../types.js";
import { recreateProtections } from "./recreateProtections.js";

vi.mock("../tryCatchInfoAction.js", () => ({
	async tryCatchInfoAction(_: string, action: () => Promise<unknown>) {
		return await action();
	},
}));

const commonRequestData = {
	branch: "test-branch",
	owner: "test-owner",
	repo: "test-repo",
};
const mockTeam = {
	description: null,
	html_url: "",
	id: 0,
	members_url: "",
	name: "",
	node_id: "",
	parent: null,
	permission: "",
	repositories_url: "",
	type: "enterprise",
	url: "",
} as const;
const mockRequest = vi.fn();
const mockOctokit = { request: mockRequest } as unknown as Octokit;

describe("recreateProtections", () => {
	it("does not recreate protections when existingProtections is undefined", async () => {
		await recreateProtections({
			commonRequestData,
			existingProtections: undefined,
			octokit: mockOctokit,
		});

		expect(mockRequest).not.toHaveBeenCalled();
	});

	it("recreates protections when existingProtections is a minimal set of protections", async () => {
		await recreateProtections({
			commonRequestData,
			existingProtections: {},
			octokit: mockOctokit,
		});

		expect(mockRequest.mock.calls).toMatchInlineSnapshot(`
			[
			  [
			    "PUT /repos/{owner}/{repo}/branches/{branch}/protection",
			    {
			      "allow_deletions": false,
			      "allow_force_pushes": false,
			      "allow_fork_syncing": false,
			      "block_creations": false,
			      "branch": "test-branch",
			      "enforce_admins": false,
			      "lock_branch": false,
			      "owner": "test-owner",
			      "repo": "test-repo",
			      "required_conversation_resolution": false,
			      "required_linear_history": false,
			      "required_pull_request_reviews": null,
			      "required_signatures": false,
			      "required_status_checks": null,
			      "restrictions": null,
			    },
			  ],
			]
		`);
	});

	it("recreates protections when existingProtections is a full set of protections", async () => {
		await recreateProtections({
			commonRequestData,
			existingProtections: {
				allow_deletions: { enabled: true },
				allow_force_pushes: { enabled: true },
				allow_fork_syncing: { enabled: true },
				block_creations: { enabled: true },
				enforce_admins: { enabled: true, url: "enforce-admins-url" },
				lock_branch: { enabled: true },
				required_conversation_resolution: { enabled: true },
				required_linear_history: { enabled: true },
				required_pull_request_reviews: {
					dismiss_stale_reviews: true,
					require_code_owner_reviews: true,
					required_approving_review_count: 1,
				},
				required_signatures: { enabled: true, url: "required-signatures-url" },
				required_status_checks: {
					checks: [
						{
							app_id: null,
							context: "check-context-null",
						},
						{
							app_id: 123,
							context: "check-context-123",
						},
					],
					contexts: ["check-contexts-context"],
					strict: true,
				},
				restrictions: {
					apps: [{ slug: "app-slug" }],
					apps_url: "apps-url",
					teams: [{ ...mockTeam, slug: "team-slug" }],
					teams_url: "teams-url",
					url: "url",
					users: [{ login: "user-login" }],
					users_url: "users-url",
				},
			},
			octokit: mockOctokit,
		});

		expect(mockRequest.mock.calls).toMatchInlineSnapshot(`
			[
			  [
			    "PUT /repos/{owner}/{repo}/branches/{branch}/protection",
			    {
			      "allow_deletions": true,
			      "allow_force_pushes": true,
			      "allow_fork_syncing": true,
			      "block_creations": true,
			      "branch": "test-branch",
			      "enforce_admins": true,
			      "lock_branch": true,
			      "owner": "test-owner",
			      "repo": "test-repo",
			      "required_conversation_resolution": true,
			      "required_linear_history": true,
			      "required_pull_request_reviews": {
			        "dismiss_stale_reviews": true,
			        "require_code_owner_reviews": true,
			        "required_approving_review_count": 1,
			      },
			      "required_signatures": true,
			      "required_status_checks": {
			        "checks": [
			          {
			            "app_id": undefined,
			            "context": "check-context-null",
			          },
			          {
			            "app_id": 123,
			            "context": "check-context-123",
			          },
			        ],
			        "strict": true,
			      },
			      "restrictions": {
			        "apps": [
			          "app-slug",
			        ],
			        "teams": [
			          "team-slug",
			        ],
			        "users": [
			          "user-login",
			        ],
			      },
			    },
			  ],
			]
		`);
	});
});
