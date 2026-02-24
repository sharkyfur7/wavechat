import { createAuthClient } from 'better-auth/client';

import { PUBLIC_API_URL } from '$env/static/public';

export const authClient = createAuthClient({
	baseURL: PUBLIC_API_URL,
	basePath: '/auth',
	fetchOptions: {
		credentials: 'include'
	}
});
