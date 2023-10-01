declare module "release-it" {
	export interface ReleaseItOptions {
		verbose?: boolean;
	}

	export default function releaseIt(
		options?: ReleaseItOptions,
	): Promise<unknown>;
}
