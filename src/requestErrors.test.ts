import { describe, expect, it } from "vitest";

import {
	getRequestErrorDetails,
	isPlanUpgradeRequired,
} from "./requestErrors.js";

describe(getRequestErrorDetails, () => {
	it("returns the response message and status when they exist", () => {
		expect(
			getRequestErrorDetails({
				response: { data: { message: "Branch not found" } },
				status: 404,
			}),
		).toEqual({ message: "Branch not found", status: 404 });
	});

	it("returns an empty message and undefined status for an error without a response", () => {
		expect(getRequestErrorDetails(new Error("Oh no!"))).toEqual({
			message: "",
			status: undefined,
		});
	});
});

describe(isPlanUpgradeRequired, () => {
	const message =
		"Upgrade to GitHub Pro or make this repository public to enable this feature.";

	it("returns true for a 403 asking to upgrade the GitHub plan", () => {
		expect(
			isPlanUpgradeRequired({ response: { data: { message } }, status: 403 }),
		).toBe(true);
	});

	it("returns false for a 403 with a different message", () => {
		expect(
			isPlanUpgradeRequired({
				response: { data: { message: "Resource not accessible" } },
				status: 403,
			}),
		).toBe(false);
	});

	it("returns false for a plan upgrade message without a 403", () => {
		expect(
			isPlanUpgradeRequired({ response: { data: { message } }, status: 404 }),
		).toBe(false);
	});
});
