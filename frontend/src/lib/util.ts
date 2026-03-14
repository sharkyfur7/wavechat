import { authClient } from '$lib/auth-client';

export function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getSessionData() {
	return (await authClient.getSession()).data;
}
