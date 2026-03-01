import { authClient } from '$lib/auth-client';

export async function getSessionData() {
	return (await authClient.getSession()).data;
}

export async function sign_up(username: string, password: string, email: string) {
	const { data, error } = await authClient.signUp.email(
		{
			email: email, // user email address
			password: password, // user password -> min 8 characters by default
			name: username // user display name
		},
		{
			onRequest: () => {},
			onSuccess: async () => {},
			onError: (ctx) => {
				alert(ctx.error.message);
				console.log(ctx.error);
			}
		}
	);

	if (!error) {
		return data.user;
	} else {
		return null;
	}
}

export async function sign_in(email: string, password: string, remember_me = true) {
	const { data, error } = await authClient.signIn.email(
		{
			email: email,
			password: password,
			rememberMe: remember_me
		},
		{
			onRequest: () => {},
			onSuccess: async () => {},
			onError: (ctx) => {
				alert(ctx.error.message);
			}
		}
	);

	if (!error) {
		return data.user;
	} else {
		return null;
	}
}

export async function sign_out() {
	await authClient.signOut();
}
