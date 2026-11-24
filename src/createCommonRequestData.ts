import { CommonData } from "./types.ts";

export function createCommonRequestData(commonData: CommonData) {
	return {
		...commonData,
		headers: {
			"X-GitHub-Api-Version": "2022-11-28",
		},
	};
}
