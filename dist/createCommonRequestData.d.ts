import { CommonData } from "./types.js";
export declare function createCommonRequestData(commonData: CommonData): {
    headers: {
        "X-GitHub-Api-Version": string;
    };
    branch: string;
    owner: string;
    repo: string;
};
