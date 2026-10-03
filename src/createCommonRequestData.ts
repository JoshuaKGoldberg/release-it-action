import { CommonData } from "./types.js";

export function createCommonRequestData(commonData: CommonData) {
	return {
		...commonData,
		headers: {
			"X-GitHub-Api-Version": "2022-11-28",
		},
	};
}
