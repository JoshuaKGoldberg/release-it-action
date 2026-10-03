import { describe, expect, it, vi } from "vitest";

import { Octokit } from "../types.js";
import { fetchProtections } from "./fetchProtections.js";

const mockInfo = vi.fn();
const mockWarning = vi.fn();

vi.mock("@actions/core", () => ({
	get info() {
		return mockInfo;
	},
	get warning() {
		return mockWarning;
	},
}));

const branch = "test-branch";
const mockRequest = vi.fn();
const mockOctokit = { request: mockRequest } as unknown as Octokit;
const requestData = { branch, owner: "test-owner", repo: "test-repo" };

function createRequestError(status: number, message: string) {
	return Object.assign(new Error(message), {
		name: "HttpError",
		response: { data: { message } },
		status,
	});
}

describe("fetchProtections", () => {
	it("returns protections", async () => {
		const mockProtections = {};
		mockRequest.mockResolvedValueOnce({ data: mockProtections });

		const actual = await fetchProtections({
			octokit: mockOctokit,
			requestData,
		});

		expect(actual).toBe(mockProtections);
		expect(mockRequest).toHaveBeenCalledWith(
			"GET /repos/{owner}/{repo}/branches/{branch}/protection",
			requestData,
		);
		expect(mockInfo.mock.calls).toMatchInlineSnapshot(`
			[
			  [
			    "Start: fetching existing branch protections for test-branch",
			  ],
			  [
			    "Result from fetching existing branch protections for test-branch: {}",
			  ],
			]
		`);
	});

	it("returns undefined when the branch is not protected", async () => {
		mockRequest.mockRejectedValueOnce(
			createRequestError(404, "Branch not protected"),
		);

		const actual = await fetchProtections({
			octokit: mockOctokit,
			requestData,
		});

		expect(actual).toBeUndefined();
		expect(mockWarning).not.toHaveBeenCalled();
	});

	it("returns undefined with a warning when the branch doesn't exist", async () => {
		mockRequest.mockRejectedValueOnce(
			createRequestError(404, "Branch not found"),
		);

		const actual = await fetchProtections({
			octokit: mockOctokit,
			requestData,
		});

		expect(actual).toBeUndefined();
		expect(mockWarning.mock.calls).toMatchInlineSnapshot(`
			[
			  [
			    "Branch test-branch doesn't exist, so it has no branch protections to bypass.",
			  ],
			]
		`);
	});

	it("returns undefined with a warning when branch protections aren't available on the repository's plan", async () => {
		mockRequest.mockRejectedValueOnce(
			createRequestError(
				403,
				"Upgrade to GitHub Pro or make this repository public to enable this feature.",
			),
		);

		const actual = await fetchProtections({
			octokit: mockOctokit,
			requestData,
		});

		expect(actual).toBeUndefined();
		expect(mockWarning.mock.calls).toMatchInlineSnapshot(`
			[
			  [
			    "Branch protections aren't available on this repository's GitHub plan, so test-branch has none to bypass.",
			  ],
			]
		`);
	});

	it("throws when the token can't see the branch's protections", async () => {
		mockRequest.mockRejectedValueOnce(createRequestError(404, "Not Found"));

		await expect(
			fetchProtections({ octokit: mockOctokit, requestData }),
		).rejects.toThrowErrorMatchingInlineSnapshot(
			`[Error: Could not fetch existing branch protections for test-branch: HttpError: Not Found]`,
		);
	});

	it("throws when GitHub responds with a server error", async () => {
		mockRequest.mockRejectedValueOnce(createRequestError(502, "Server Error"));

		await expect(
			fetchProtections({ octokit: mockOctokit, requestData }),
		).rejects.toThrowErrorMatchingInlineSnapshot(
			`[Error: Could not fetch existing branch protections for test-branch: HttpError: Server Error]`,
		);
	});

	it("throws when fetching protections is forbidden", async () => {
		mockRequest.mockRejectedValueOnce(
			createRequestError(403, "Resource not accessible by integration"),
		);

		await expect(
			fetchProtections({ octokit: mockOctokit, requestData }),
		).rejects.toThrowErrorMatchingInlineSnapshot(
			`[Error: Could not fetch existing branch protections for test-branch: HttpError: Resource not accessible by integration]`,
		);
	});
});
