import { describe, expect, it, vi } from "vitest";

import { Octokit } from "../types.js";
import { recreateProtections } from "./recreateProtections.js";

const mockTryCatchSetFailedAction = vi.fn(
	async (_: string, action: () => Promise<unknown>) => await action(),
);

vi.mock("../tryCatchAction.js", () => ({
	get tryCatchSetFailedAction() {
		return mockTryCatchSetFailedAction;
	},
}));

const requestData = {
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
const mockUser = {
	avatar_url: "",
	events_url: "",
	followers_url: "",
	following_url: "",
	gists_url: "",
	gravatar_id: null,
	html_url: "",
	id: 0,
	node_id: "",
	organizations_url: "",
	received_events_url: "",
	repos_url: "",
	site_admin: false,
	starred_url: "",
	subscriptions_url: "",
	type: "User",
	url: "",
} as const;
const mockApp = {
	created_at: "",
	description: null,
	events: [],
	external_url: "",
	html_url: "",
	id: 0,
	name: "",
	node_id: "",
	owner: { ...mockUser, login: "app-owner" },
	permissions: {},
	updated_at: "",
};
const mockRequest = vi.fn();
const mockOctokit = { request: mockRequest } as unknown as Octokit;

describe("recreateProtections", () => {
	it("does not recreate protections when existingProtections is undefined", async () => {
		await recreateProtections({
			existingProtections: undefined,
			octokit: mockOctokit,
			requestData,
		});

		expect(mockRequest).not.toHaveBeenCalled();
	});

	it("recreates protections when existingProtections is a minimal set of protections", async () => {
		await recreateProtections({
			existingProtections: {},
			octokit: mockOctokit,
			requestData,
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
			      "required_status_checks": null,
			      "restrictions": null,
			    },
			  ],
			]
		`);
	});

	it("does not hand the API responses to the logger", async () => {
		mockRequest.mockResolvedValue({ data: {}, headers: {}, status: 200 });

		await recreateProtections({
			existingProtections: { required_signatures: { enabled: true, url: "" } },
			octokit: mockOctokit,
			requestData,
		});

		expect(mockTryCatchSetFailedAction).toHaveBeenCalledTimes(2);
		for (const { value } of mockTryCatchSetFailedAction.mock.results) {
			expect(await value).toBeUndefined();
		}
	});

	it("omits review restrictions when existingProtections has required_pull_request_reviews without them", async () => {
		await recreateProtections({
			existingProtections: {
				required_pull_request_reviews: {
					dismiss_stale_reviews: false,
					require_code_owner_reviews: false,
				},
			},
			octokit: mockOctokit,
			requestData,
		});

		expect(mockRequest).toHaveBeenCalledWith(
			"PUT /repos/{owner}/{repo}/branches/{branch}/protection",
			expect.objectContaining({
				required_pull_request_reviews: {
					bypass_pull_request_allowances: undefined,
					dismiss_stale_reviews: false,
					dismissal_restrictions: undefined,
					require_code_owner_reviews: false,
					required_approving_review_count: undefined,
				},
			}),
		);
	});

	it("allows any app to provide required checks that were not limited to an app", async () => {
		await recreateProtections({
			existingProtections: {
				required_status_checks: {
					checks: [
						{ app_id: null, context: "any-app-check" },
						{ app_id: 15368, context: "github-actions-check" },
					],
					contexts: ["any-app-check", "github-actions-check"],
					strict: false,
				},
			},
			octokit: mockOctokit,
			requestData,
		});

		expect(mockRequest).toHaveBeenCalledWith(
			"PUT /repos/{owner}/{repo}/branches/{branch}/protection",
			expect.objectContaining({
				required_status_checks: {
					checks: [
						{ app_id: -1, context: "any-app-check" },
						{ app_id: 15368, context: "github-actions-check" },
					],
					strict: false,
				},
			}),
		);
	});

	it("recreates protections when existingProtections is a full set of protections", async () => {
		await recreateProtections({
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
					bypass_pull_request_allowances: {
						apps: [
							null,
							{ ...mockApp },
							{ ...mockApp, slug: "bypass-app-slug" },
						],
						teams: [{ ...mockTeam, slug: "bypass-team-slug" }],
						users: [{ ...mockUser, login: "bypass-user-login" }],
					},
					dismiss_stale_reviews: true,
					dismissal_restrictions: {
						apps: [{ ...mockApp, slug: "dismissal-app-slug" }],
						teams: [{ ...mockTeam, slug: "dismissal-team-slug" }],
						teams_url: "dismissal-teams-url",
						url: "dismissal-url",
						users: [{ ...mockUser, login: "dismissal-user-login" }],
						users_url: "dismissal-users-url",
					},
					require_code_owner_reviews: true,
					require_last_push_approval: true,
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
			requestData,
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
			        "bypass_pull_request_allowances": {
			          "apps": [
			            "bypass-app-slug",
			          ],
			          "teams": [
			            "bypass-team-slug",
			          ],
			          "users": [
			            "bypass-user-login",
			          ],
			        },
			        "dismiss_stale_reviews": true,
			        "dismissal_restrictions": {
			          "apps": [
			            "dismissal-app-slug",
			          ],
			          "teams": [
			            "dismissal-team-slug",
			          ],
			          "users": [
			            "dismissal-user-login",
			          ],
			        },
			        "require_code_owner_reviews": true,
			        "require_last_push_approval": true,
			        "required_approving_review_count": 1,
			      },
			      "required_status_checks": {
			        "checks": [
			          {
			            "app_id": -1,
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
			  [
			    "POST /repos/{owner}/{repo}/branches/{branch}/protection/required_signatures",
			    {
			      "branch": "test-branch",
			      "owner": "test-owner",
			      "repo": "test-repo",
			    },
			  ],
			]
		`);
	});
});
