import { getUnpublishedVersion } from "./getUnpublishedVersion.js";

export async function waitForPublished(attempts = 6, delayMs = 10_000) {
	for (let attempt = 0; attempt < attempts; attempt += 1) {
		if (attempt) {
			await new Promise((resolve) => setTimeout(resolve, delayMs));
		}

		try {
			if (!(await getUnpublishedVersion())) {
				return true;
			}
		} catch {
			// npm view can fail transiently; keep checking.
		}
	}

	return false;
}
