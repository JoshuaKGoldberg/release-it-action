import { $ } from "execa";

const $quiet = $({ reject: false });

export async function getHeadTags() {
	return (await $quiet`git tag --points-at HEAD`).stdout.split("\n");
}

export function getVersionTagNames(version: string) {
	return [version, `v${version}`];
}
