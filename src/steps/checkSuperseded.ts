import { $ } from "execa";

const $quiet = $({ reject: false });

export async function getHeadSha() {
	const { exitCode, stdout } = await $quiet`git rev-parse HEAD`;
	return exitCode ? undefined : stdout;
}

// A run is superseded when its branch moved past the commit it started from
// without including this run's release commit. Whatever moved the branch was
// itself a push, so its own release run is queued and will release everything.
export async function checkSuperseded(startSha: string) {
	const branch = await $quiet`git rev-parse --abbrev-ref HEAD`;
	if (branch.exitCode || branch.stdout === "HEAD") {
		return false;
	}

	const fetch = await $quiet`git fetch origin ${branch.stdout}`;
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
	return isAncestor.exitCode !== 0;
}
