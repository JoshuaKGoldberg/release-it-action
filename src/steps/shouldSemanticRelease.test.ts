import * as core from "@actions/core";
import { $ } from "execa";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

import { shouldSemanticRelease } from "./shouldSemanticRelease.js";

vi.mock("@actions/core");
const mockCore = vi.mocked(core);

const directories: string[] = [];

async function createDirectory() {
	const directory = await fs.mkdtemp(
		path.join(os.tmpdir(), "release-it-action-"),
	);
	directories.push(directory);
	return directory;
}

async function createRepository(newestFirst: string[]) {
	const directory = await createDirectory();
	const $repository = $({ env: { GIT_DIR: directory } });

	await $repository`git init --bare --quiet --initial-branch=main`;

	const input = [...newestFirst]
		.reverse()
		.map(
			(message, i) =>
				`commit refs/heads/main\ncommitter Test <test@example.com> ${(1_700_000_000 + i).toString()} +0000\ndata ${Buffer.byteLength(message).toString()}\n${message}\n`,
		)
		.join("");
	await $repository({ input })`git fast-import --quiet`;

	vi.stubEnv("GIT_DIR", directory);
}

function getCheckedCommits() {
	return mockCore.info.mock.calls
		.map(([message]) => message)
		.filter((message) => message.startsWith("Checking commit: "));
}

describe("shouldSemanticRelease", () => {
	afterEach(async () => {
		vi.unstubAllEnvs();
		await Promise.all(
			directories
				.splice(0)
				.map((directory) => fs.rm(directory, { force: true, recursive: true })),
		);
	});

	it("returns true at the latest commit when it is meaningful", async () => {
		await createRepository(["fix: b", "chore: release v1.0.0", "feat: a"]);

		expect(await shouldSemanticRelease()).toBe(true);
		expect(getCheckedCommits()).toEqual(["Checking commit: fix: b"]);
		expect(mockCore.info).toHaveBeenCalledWith(
			"Found a meaningful commit. Returning true.",
		);
	});

	it("returns true when a meaningful commit comes after ignored commits", async () => {
		await createRepository([
			"docs: c",
			"chore: b",
			"feat!: a",
			"chore: release v1.0.0",
		]);

		expect(await shouldSemanticRelease()).toBe(true);
		expect(getCheckedCommits()).toEqual([
			"Checking commit: docs: c",
			"Checking commit: chore: b",
			"Checking commit: feat!: a",
		]);
	});

	it("returns false when a release commit comes before any meaningful commit", async () => {
		await createRepository(["docs: b", "chore: release v1.0.0", "feat: a"]);

		expect(await shouldSemanticRelease()).toBe(false);
		expect(getCheckedCommits()).toEqual([
			"Checking commit: docs: b",
			"Checking commit: chore: release v1.0.0",
		]);
		expect(mockCore.info).toHaveBeenCalledWith(
			"Found a release commit. Returning false.",
		);
	});

	it("returns false when no commits indicate a release is necessary", async () => {
		await createRepository(["docs: b", "chore: a"]);

		expect(await shouldSemanticRelease()).toBe(false);
		expect(mockCore.info).toHaveBeenLastCalledWith(
			"No commits found that indicate a semantic release is necessary. Returning false.",
		);
	});

	it("reads the whole history when it is larger than 1 MiB", async () => {
		const filler = Array.from(
			{ length: 20_000 },
			(_, i) =>
				`chore(deps): update dependency example to v1.2.${i.toString()} (#${i.toString()})`,
		);
		expect(Buffer.byteLength(filler.join("\n"))).toBeGreaterThan(1024 * 1024);

		await createRepository([...filler, "chore: release v1.0.0", "feat: a"]);

		expect(await shouldSemanticRelease()).toBe(false);
		expect(getCheckedCommits()).toHaveLength(filler.length + 1);
	});

	it("ignores stderr output from a successful git log", async () => {
		await createRepository(["docs: b", "chore: release v1.0.0"]);
		vi.stubEnv("GIT_TRACE", "1");
		expect((await $`git log -1`).stderr).not.toBe("");

		expect(await shouldSemanticRelease()).toBe(false);
	});

	it("throws when git log fails", async () => {
		vi.stubEnv("GIT_DIR", await createDirectory());

		await expect(shouldSemanticRelease()).rejects.toThrow(
			"Command failed with exit code 128",
		);
	});
});
