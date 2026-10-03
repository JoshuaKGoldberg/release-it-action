const planUpgradeRequired = /^Upgrade to GitHub .+ to enable this feature/;

export function getRequestErrorDetails(error: unknown) {
	const { response, status } = error as {
		response?: { data?: { message?: string } };
		status?: number;
	};

	return { message: response?.data?.message ?? "", status };
}

export function isPlanUpgradeRequired(error: unknown) {
	const { message, status } = getRequestErrorDetails(error);

	return status === 403 && planUpgradeRequired.test(message);
}
