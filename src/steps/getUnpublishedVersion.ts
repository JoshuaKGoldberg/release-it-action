import * as core from "@actions/core";
import { $ } from "execa";
import * as fs from "node:fs/promises";
import { setTimeout } from "node:timers/promises";

import {
	getPublishRegistry,
	getScopedRegistryKey,
	PublishRegistryData,
} from "../getPublishRegistry.js";

const $quiet = $({ reject: false });

// npm can take a few minutes after a publish before it shows the new version.
const recentTagSeconds = 10 * 60;
const recheckAttempts = 12;
const recheckDelayMs = 15_000;

export interface UnpublishedVersion {
	/**
	 * The version's Git tag if it points at HEAD, meaning HEAD is its release commit.
	 */
	headTag: string | undefined;
	version: string;
}

interface PackageData extends PublishRegistryData {
	private?: boolean;
	version?: string;
}

export async function getUnpublishedVersion(): Promise<
	undefined | UnpublishedVersion
> {
	const packageData = JSON.parse(
		await fs.readFile("package.json", "utf8"),
	) as PackageData;
	const { name, private: isPrivate, version } = packageData;

	if (isPrivate || !name || !version) {
		return undefined;
	}

	const registry = await getPublishRegistry(packageData);
	// npm view prefers a scope's registry config over --registry.
	const registryArg = `--${getScopedRegistryKey(name) ?? "registry"}=${registry}`;
	const isOnNpm = async () => {
		const view =
			await $quiet`npm view ${name}@${version} version --json ${registryArg}`;
		if (!view.exitCode) {
			return true;
		}

		if (!view.stdout.includes('"E404"')) {
			throw new Error(`Could not check npm for ${name}@${version}.`);
		}

		return false;
	};

	if (await isOnNpm()) {
		return undefined;
	}

	const tagNames = [version, `v${version}`];
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

	const headTags = (await $quiet`git tag --points-at HEAD`).stdout.split("\n");

	return {
		headTag: existingTags.find((tag) => headTags.includes(tag)),
		version,
	};
}
