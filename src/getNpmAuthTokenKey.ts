import * as fs from "node:fs/promises";

import {
	getPublishRegistry,
	PublishRegistryData,
} from "./getPublishRegistry.js";

export async function getNpmAuthTokenKey() {
	const registry = await getPublishRegistry(await readPackageData());

	return `${getNerfDart(registry)}:_authToken`;
}

// This matches npm's nerf-dart, which drops the last path segment of a registry URL.
function getNerfDart(registry: string) {
	const { host, pathname, protocol } = new URL(registry);
	const parent = new URL(".", `${protocol}//${host}${pathname}`);

	return `//${parent.host}${parent.pathname}`;
}

async function readPackageData(): Promise<PublishRegistryData> {
	try {
		return JSON.parse(
			await fs.readFile("package.json", "utf8"),
		) as PublishRegistryData;
	} catch {
		return {};
	}
}
