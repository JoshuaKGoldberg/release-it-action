import * as core from "@actions/core";
import * as github from "@actions/github";
import releaseIt from "release-it";
import { shouldSemanticRelease } from "should-semantic-release";

const githubToken = process.env.GITHUB_TOKEN;
if (!githubToken) {
	throw new Error("No GITHUB_TOKEN environment variable defined.");
}

const octokit = github.getOctokit(githubToken);

const branch = "main"; // core.getInput("branch") || "main";
const owner = "JoshuaKGoldberg"; // core.getInput("owner") || github.context.repo.owner;
const repo = "testing-branch-protections"; // core.getInput("repo") || github.context.repo.repo;

await (async () => {
	if (!(await shouldSemanticRelease({ verbose: true }))) {
		// core.debug(
		core.debug(
			"Skipping: no semantic commits found by should-semantic-release.",
		);
		return;
	}

	const existingProtections = await tryCatchAsync(
		async () =>
			await octokit.request(
				"GET /repos/{owner}/{repo}/branches/{branch}/protection",
				{
					branch,
					headers: {
						"X-GitHub-Api-Version": "2022-11-28",
					},
					owner,
					repo,
				},
			),
	);

	if (existingProtections) {
		core.debug(
			`Temporarily deleting existing protections: ${JSON.stringify(
				existingProtections,
				null,
				4,
			)}`,
		);
		const result = await octokit.request(
			`DELETE /repos/{owner}/{repo}/branches/{branch}/protection`,
			{
				branch,
				headers: {
					"X-GitHub-Api-Version": "2022-11-28",
				},
				owner,
				repo,
			},
		);
		core.debug(
			`Deleting existing protections result: ${JSON.stringify(
				result,
				null,
				4,
			)}`,
		);
	}

	try {
		const result = await releaseIt({ verbose: true });
		core.debug(`release-it result: ${JSON.stringify(result, null, 4)}`);
	} catch (error) {
		console.error("release-it error:", error);
	} finally {
		if (existingProtections) {
			core.debug("Re-creating existing protections.");
			const result = await octokit.request(
				`PUT /repos/{owner}/{repo}/branches/{branch}/protection`,
				{
					allow_deletions: !!existingProtections.data.allow_deletions?.enabled,
					allow_force_pushes:
						!!existingProtections.data.allow_force_pushes?.enabled,
					block_creations: !!existingProtections.data.block_creations?.enabled,
					branch,
					enforce_admins: !!existingProtections.data.enforce_admins?.enabled,
					owner,
					repo,
					required_conversation_resolution:
						!!existingProtections.data.required_conversation_resolution
							?.enabled,
					required_linear_history:
						!!existingProtections.data.required_linear_history?.enabled,
					required_pull_request_reviews: existingProtections.data
						.required_pull_request_reviews
						? {
								// TODO
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
									existingProtections.data.required_pull_request_reviews
										.dismiss_stale_reviews,
								// TODO
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
									existingProtections.data.required_pull_request_reviews
										.require_code_owner_reviews,
								required_approving_review_count:
									existingProtections.data.required_pull_request_reviews
										.required_approving_review_count,
						  }
						: null,
					required_signatures:
						!!existingProtections.data.required_signatures?.enabled,
					restrictions: existingProtections.data.restrictions
						? {
								apps: existingProtections.data.restrictions.apps.map(
									// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
									(app) => app.slug!,
								),
								teams: existingProtections.data.restrictions.teams.map(
									// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
									(team) => team.slug!,
								),
								users: existingProtections.data.restrictions.users.map(
									// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
									(user) => user.login!,
								),
						  }
						: null,

					/* eslint-disable @typescript-eslint/no-unsafe-member-access */
					allow_fork_syncing:
						// @ts-expect-error -- Types seem to be missing this property?
						!!existingProtections.data.allow_fork_syncing?.enabled,
					// @ts-expect-error -- Types seem to be missing this property?
					lock_branch: !!existingProtections.data.lock_branch?.enabled,
					/* eslint-enable @typescript-eslint/no-unsafe-member-access */

					// @ts-expect-error -- The left types use 'null', while the right are 'undefined'...
					required_status_checks: existingProtections.data
						.required_status_checks
						? {
								checks:
									existingProtections.data.required_status_checks.checks.map(
										(check) => ({
											app_id: check.app_id ?? undefined,
											context: check.context,
										}),
									),
								strict: existingProtections.data.required_status_checks.strict,
						  }
						: null,
				},
			);
			core.debug(
				`Re-creating branch protection result: ${JSON.stringify(
					result,
					null,
					4,
				)}`,
			);
		}
	}
})();

async function tryCatchAsync<T>(action: () => Promise<T>) {
	try {
		return await action();
	} catch {
		return undefined;
	}
}
