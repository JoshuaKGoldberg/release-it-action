import * as core from "@actions/core";
import { setTimeout } from "node:timers/promises";

import { $quiet } from "../execa.js";
import { readPackageData } from "../packageData.js";
import { getHeadTags, getVersionTagNames } from "../versionTags.js";

// npm can take a few minutes after a publish before it shows the new version.
const recentTagSeconds = 10 * 60;
const recheckAttempts = 36;
const recheckDelayMs = 5_000;

export interface UnpublishedVersion {
	/**
	 * The version's Git tag if it points at HEAD, meaning HEAD is its release commit.
	 */
	headTag: string | undefined;
	version: string;
}

export async function getUnpublishedVersion(
	githubToken: string,
): Promise<undefined | UnpublishedVersion> {
	const {
		name,
		private: isPrivate,
		publishConfig,
		version,
	} = (await readPackageData()) ?? {};

	if (isPrivate || !name || !version) {
		return undefined;
	}

	const scopedRegistry = name.startsWith("@")
		? publishConfig?.[`${name.split("/")[0]}:registry`]
		: undefined;
	const registry =
		typeof scopedRegistry === "string" && scopedRegistry
			? scopedRegistry
			: publishConfig?.registry;
	const registryArgs = registry ? ["--registry", registry] : [];
	const isOnNpm = async () => {
		const view = await $quiet({
			env: { GITHUB_TOKEN: githubToken },
		})`npm view ${name}@${version} version --json ${registryArgs}`;
		if (!view.exitCode) {
			return true;
		}

		if (!view.stdout.includes('"E404"')) {
			throw new Error(
				`Could not check npm for ${name}@${version}: ${describeNpmError(view.stdout)}. Make sure the registry is reachable and npm is authenticated to read the package. If this package isn't meant to be on npm, set the skip-npm-publish option or mark it as private.`,
			);
		}

		return false;
	};

	if (await isOnNpm()) {
		return undefined;
	}

	const tagNames = getVersionTagNames(version);
	const existingTags = (await $quiet`git tag --list ${tagNames}`).stdout
		.split("\n")
		.filter(Boolean);

	// A version that was never tagged was never released, e.g. a new package.
	if (!existingTags.length) {
		return undefined;
	}

	const tagSeconds = Number(
		(await $quiet`git log -1 --format=%ct ${existingTags[0]}`).stdout,
	);
	if (Date.now() / 1000 - tagSeconds < recentTagSeconds) {
		core.info(
			`Version ${version} was tagged recently but isn't on npm yet. Waiting for npm to show it.`,
		);

		for (let attempt = 0; attempt < recheckAttempts; attempt += 1) {
			await setTimeout(recheckDelayMs);
			if (await isOnNpm()) {
				return undefined;
			}
		}
	}

	const headTags = await getHeadTags();

	return {
		headTag: existingTags.find((tag) => headTags.includes(tag)),
		version,
	};
}

function describeNpmError(stdout: string) {
	try {
		const { error } = JSON.parse(stdout) as { error?: { summary?: string } };
		return error?.summary ?? "unknown error";
	} catch {
		return "unknown error";
	}
}
