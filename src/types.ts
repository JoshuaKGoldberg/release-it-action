export interface ReleaseItActionOptions {
	branch: string;
	owner: string;
	repo: string;
	skipBranchProtections?: boolean;
	token: string;
}
