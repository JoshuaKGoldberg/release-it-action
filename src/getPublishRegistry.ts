import { $ } from "execa";

const $quiet = $({ reject: false });

export const defaultRegistry = "https://registry.npmjs.org/";

export interface PublishRegistryData {
	name?: string;
	publishConfig?: Record<string, unknown>;
}

export async function getPublishRegistry({
	name,
	publishConfig,
}: PublishRegistryData) {
	const scopedRegistryKey = getScopedRegistryKey(name);
	const keys = scopedRegistryKey
		? [scopedRegistryKey, "registry"]
		: ["registry"];

	// This matches npm: a publishConfig key, even an empty one, overrides npm config.
	for (const key of keys) {
		const registry =
			publishConfig && Object.hasOwn(publishConfig, key)
				? publishConfig[key]
				: await getNpmConfigRegistry(key);

		if (typeof registry === "string" && registry) {
			return registry;
		}
	}

	return defaultRegistry;
}

export function getScopedRegistryKey(name: string | undefined) {
	return name?.startsWith("@") ? `${name.split("/")[0]}:registry` : undefined;
}

async function getNpmConfigRegistry(key: string) {
	const { exitCode, stdout } = await $quiet`npm config get ${key}`;

	// npm refuses to print some values, such as URLs with credentials or UUIDs.
	if (exitCode) {
		throw new Error(`Could not read ${key} from npm config.`);
	}

	const value = stdout.trim();

	return value === "undefined" ? undefined : value;
}
