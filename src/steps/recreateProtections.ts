import type { RequestParameters } from "@octokit/types";

import { tryCatchInfoAction } from "../tryCatchInfoAction.js";
import { ExistingProtections, Octokit } from "../types.js";

export interface RecreateProtectionsOptions {
	commonRequestData: RequestParameters;
	existingProtections: ExistingProtections | undefined;
	octokit: Octokit;
}

export async function recreateProtections({
	commonRequestData,
	existingProtections,
	octokit,
}: RecreateProtectionsOptions) {
	if (!existingProtections) {
		return;
	}

	await tryCatchInfoAction(
		"re-creating branch protections",
		async () =>
			await octokit.request(
				`PUT /repos/{owner}/{repo}/branches/{branch}/protection`,
				{
					...commonRequestData,
					allow_deletions: !!existingProtections.allow_deletions?.enabled,
					allow_force_pushes: !!existingProtections.allow_force_pushes?.enabled,
					allow_fork_syncing: !!existingProtections.allow_fork_syncing?.enabled,
					block_creations: !!existingProtections.block_creations?.enabled,
					enforce_admins: !!existingProtections.enforce_admins?.enabled,
					lock_branch: !!existingProtections.lock_branch?.enabled,
					required_conversation_resolution:
						!!existingProtections.required_conversation_resolution?.enabled,
					required_linear_history:
						!!existingProtections.required_linear_history?.enabled,
					required_pull_request_reviews:
						existingProtections.required_pull_request_reviews
							? {
									// TODO: https://github.com/JoshuaKGoldberg/release-it-action/issues/13
									// bypass_pull_request_allowances: {
									// 	apps: currentBranchProtections.data.required_pull_request_reviews
									// 		.bypass_pull_request_allowances?.apps,
									// 	teams:
									// 		currentBranchProtections.data.required_pull_request_reviews
									// 			.bypass_pull_request_allowances?.teams,
									// 	users:
									// 		currentBranchProtections.data.required_pull_request_reviews
									// 			.bypass_pull_request_allowances?.users,
									// },
									dismiss_stale_reviews:
										existingProtections.required_pull_request_reviews
											.dismiss_stale_reviews,
									// TODO: https://github.com/JoshuaKGoldberg/release-it-action/issues/14
									// dismissal_restrictions: {
									// 	apps: currentBranchProtections.data.required_pull_request_reviews.dismissal_restrictions?.apps?.map(
									// 		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
									// 		(app) => app.slug!,
									// 	),
									// 	teams:
									// 		currentBranchProtections.data.required_pull_request_reviews.dismissal_restrictions?.teams?.map(
									// 			(team) => team.slug,
									// 		),
									// 	users:
									// 		currentBranchProtections.data.required_pull_request_reviews.dismissal_restrictions?.users?.map(
									// 			(user) => user.login,
									// 		),
									// },
									require_code_owner_reviews:
										existingProtections.required_pull_request_reviews
											.require_code_owner_reviews,
									required_approving_review_count:
										existingProtections.required_pull_request_reviews
											.required_approving_review_count,
							  }
							: null,
					required_signatures:
						!!existingProtections.required_signatures?.enabled,
					restrictions: existingProtections.restrictions
						? {
								apps: existingProtections.restrictions.apps.map(
									// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
									(app) => app.slug!,
								),
								teams: existingProtections.restrictions.teams.map(
									// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
									(team) => team.slug!,
								),
								users: existingProtections.restrictions.users.map(
									// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
									(user) => user.login!,
								),
						  }
						: null,

					// @ts-expect-error -- The left types use 'null', while the right are 'undefined'...
					required_status_checks: existingProtections.required_status_checks
						? {
								checks: existingProtections.required_status_checks.checks.map(
									(check) => ({
										app_id: check.app_id ?? undefined,
										context: check.context,
									}),
								),
								strict: existingProtections.required_status_checks.strict,
						  }
						: null,
				},
			),
	);
}
