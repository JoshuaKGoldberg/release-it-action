import * as fs from "node:fs/promises";

import {
	getPublishRegistry,
	PublishRegistryData,
} from "./getPublishRegistry.js";

const defaultRegistry = "https://registry.npmjs.org/";

export async function getNpmAuthTokenKey() {
	const registry =
		getPublishRegistry(await readPackageData()) ?? defaultRegistry;
	const { host, pathname } = new URL(registry);

	return `//${host}${pathname.endsWith("/") ? pathname : `${pathname}/`}:_authToken`;
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
