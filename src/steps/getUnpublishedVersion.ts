import { $ } from "execa";
import * as fs from "node:fs/promises";

const $quiet = $({ reject: false });

export interface UnpublishedVersion {
	/**
	 * The version's Git tag if it points at HEAD, meaning HEAD is its release commit.
	 */
	headTag: string | undefined;
	version: string;
}

interface PackageData {
	name?: string;
	private?: boolean;
	publishConfig?: { registry?: string };
	version?: string;
}

export async function getUnpublishedVersion(): Promise<
	undefined | UnpublishedVersion
> {
	const {
		name,
		private: isPrivate,
		publishConfig,
		version,
	} = JSON.parse(await fs.readFile("package.json", "utf8")) as PackageData;

	if (isPrivate || !name || !version) {
		return undefined;
	}

	const registryArgs = publishConfig?.registry
		? ["--registry", publishConfig.registry]
		: [];
	const view =
		await $quiet`npm view ${name}@${version} version --json ${registryArgs}`;
	if (!view.exitCode) {
		return undefined;
	}

	if (!view.stdout.includes('"E404"')) {
		throw new Error(`Could not check npm for ${name}@${version}.`);
	}

	const tagNames = [version, `v${version}`];
	const existingTags = (await $quiet`git tag --list ${tagNames}`).stdout
		.split("\n")
		.filter(Boolean);

	// A version that was never tagged was never released, e.g. a new package.
	if (!existingTags.length) {
		return undefined;
	}

	const headTags = (await $quiet`git tag --points-at HEAD`).stdout.split("\n");

	return {
		headTag: existingTags.find((tag) => headTags.includes(tag)),
		version,
	};
}
