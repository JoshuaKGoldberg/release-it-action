import * as core from "@actions/core";
import { $ } from "execa";
import * as fs from "node:fs/promises";

export async function snapshotNpmUserConfig() {
	try {
		const { stdout: userConfig } = await $`npm config get userconfig`;
		const contents = await readFileIfExists(userConfig);

		return async () => {
			if (contents) {
				await fs.writeFile(userConfig, contents);
			} else {
				await fs.rm(userConfig, { force: true });
			}
		};
	} catch (error) {
		core.warning(
			`Could not snapshot the npmrc, so the npm token will be deleted from it after the run instead: ${error as string}`,
		);
		return undefined;
	}
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
