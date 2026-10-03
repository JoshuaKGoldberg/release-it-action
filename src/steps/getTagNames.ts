import * as fs from "node:fs/promises";

export interface TagNamesPackageData {
	name: string;
	"release-it"?: ReleaseItConfig;
	version: string;
}

interface ReleaseItConfig {
	git?: { tagName?: unknown };
}

export async function getTagNames(packageData: TagNamesPackageData) {
	const { name, version } = packageData;
	const tagName =
		(await readReleaseItJson())?.git?.tagName ??
		packageData["release-it"]?.git?.tagName;

	if (typeof tagName === "string" && tagName) {
		const rendered = tagName
			.replaceAll("${version}", version)
			.replaceAll("${npm.name}", name)
			.replaceAll("${name}", name);

		if (!rendered.includes("${")) {
			return [rendered];
		}
	}

	return [version, `v${version}`];
}

async function readReleaseItJson() {
	try {
		return JSON.parse(
			await fs.readFile(".release-it.json", "utf8"),
		) as ReleaseItConfig;
	} catch {
		return undefined;
	}
}
