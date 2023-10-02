declare module "release-it" {
	export interface ReleaseItOptions {
		verbose?: boolean;
	}

	export interface ReleaseItResult {
		changelog: string;
		latestVersion: string;
		name: string;
		version: string;
	}

	export default function releaseIt(
		options?: ReleaseItOptions,
	): Promise<ReleaseItResult>;
}
