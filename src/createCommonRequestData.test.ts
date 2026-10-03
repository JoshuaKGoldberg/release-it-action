import { describe, expect, it } from "vitest";

import { createCommonRequestData } from "./createCommonRequestData.js";

describe("createCommonRequestData", () => {
	it("adds the GitHub API version header to the common data", () => {
		expect(
			createCommonRequestData({ branch: "main", owner: "owner", repo: "repo" }),
		).toEqual({
			branch: "main",
			headers: { "X-GitHub-Api-Version": "2022-11-28" },
			owner: "owner",
			repo: "repo",
		});
	});
});
