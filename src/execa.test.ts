import { describe, expect, it } from "vitest";

import { cancellation } from "./cancellation.js";
import { $$captured } from "./execa.js";

describe("$$captured", () => {
	it("stops its subprocess when the run is canceled", async () => {
		const subprocess = $$captured`${process.execPath} -e ${"setTimeout(() => {}, 60_000)"}`;

		cancellation.abort(new Error("Received SIGINT."));

		await expect(subprocess).rejects.toMatchObject({ isCanceled: true });
	});
});
