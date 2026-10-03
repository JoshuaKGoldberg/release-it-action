import { $ } from "execa";
import * as fs from "node:fs/promises";

export async function snapshotNpmUserConfig() {
	const { stdout: userConfig } = await $`npm config get userconfig`;
	const contents = await readFileIfExists(userConfig);

	return async () => {
		if (contents) {
			await fs.writeFile(userConfig, contents);
		} else {
			await fs.rm(userConfig, { force: true });
		}
	};
}

async function readFileIfExists(filePath: string) {
	try {
		return await fs.readFile(filePath);
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === "ENOENT") {
			return undefined;
		}

		throw error;
	}
}
