import { $quiet } from "../execa.js";

export async function checkSuperseded(startSha: string, githubToken: string) {
	const branch = await $quiet`git rev-parse --abbrev-ref HEAD`;
	if (branch.exitCode || branch.stdout === "HEAD") {
		return false;
	}

	const fetch = await $quiet({
		env: { GITHUB_TOKEN: githubToken },
	})`git fetch origin ${branch.stdout}`;
	if (fetch.exitCode) {
		return false;
	}

	const remoteSha = (await $quiet`git rev-parse FETCH_HEAD`).stdout;
	if (!remoteSha || remoteSha === startSha) {
		return false;
	}

	// release-it resets HEAD back to startSha when it rolls back a failed push.
	const localSha = await getHeadSha();
	if (!localSha || localSha === startSha) {
		return true;
	}

	const isAncestor =
		await $quiet`git merge-base --is-ancestor ${localSha} ${remoteSha}`;
	return isAncestor.exitCode === 1;
}

export async function getHeadSha() {
	const { exitCode, stdout } = await $quiet`git rev-parse HEAD`;
	return exitCode ? undefined : stdout;
}
