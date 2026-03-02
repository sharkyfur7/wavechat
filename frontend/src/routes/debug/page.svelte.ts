import { authClient } from '$lib/auth-client';

export async function getSessionData() {
	return (await authClient.getSession()).data;
}
