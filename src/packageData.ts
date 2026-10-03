import * as fs from "node:fs/promises";

export interface PackageData {
	name?: string;
	private?: boolean;
	publishConfig?: Record<string, unknown> & { registry?: string };
	"release-it"?: ReleaseItConfig;
	version?: string;
}

export interface ReleaseItConfig {
	github?: { draft?: boolean; release?: boolean; web?: boolean };
}

export async function readPackageData() {
	try {
		return JSON.parse(await fs.readFile("package.json", "utf8")) as PackageData;
	} catch (error) {
		if ((error as { code?: string }).code === "ENOENT") {
			return undefined;
		}

		throw error;
	}
}
