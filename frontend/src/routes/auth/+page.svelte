<script lang="ts">
	import Navbar from '$lib/components/Navbar.svelte';
	import { sign_in, sign_up, sign_out, getSessionData } from './page.svelte';
	import { onMount } from 'svelte';
	import type { SessionData } from '../../types.js';
	import UserInfo from '$lib/components/UserInfo.svelte';

	let sessionData: SessionData | null = $state(null);

	let signup = $state({
		username: '',
		email: '',
		password: ''
	});

	let signin = $state({
		email: '',
		password: '',
		remember_me: false
	});

	async function sign_up_wrapper() {
		await sign_up(signup.username, signup.password, signup.email);
		sessionData = await getSessionData();
	}

	async function sign_in_wrapper() {
		await sign_in(signin.email, signin.password, signin.remember_me);
		sessionData = await getSessionData();
	}

	async function sign_out_wrapper() {
		await sign_out();
		sessionData = await getSessionData();
	}

	onMount(async () => {
		sessionData = await getSessionData();
	});
</script>

<h1>Auth page</h1>
<Navbar />
<UserInfo {sessionData} />

<h2>Sign up</h2>
<div class="auth-input">
	<input bind:value={signup.username} type="text" placeholder="username" />
	<input bind:value={signup.email} type="email" placeholder="email" />
	<input bind:value={signup.password} type="password" placeholder="password" />
	<button onclick={sign_up_wrapper}>Sign up</button>
</div>

<h2>Sign in</h2>
<div class="auth-input">
	<input bind:value={signin.email} type="email" placeholder="email" />
	<input bind:value={signin.password} type="password" placeholder="password" />
	<label>Remember me: <input bind:checked={signin.remember_me} type="checkbox" /></label>
	<button onclick={sign_in_wrapper}>Sign in</button>
</div>

<h2>Sign out</h2>
<button onclick={sign_out_wrapper}>Sign out</button>

<style>
	.auth-input {
		display: flex;
		flex-direction: column;
		width: 256px;
		gap: 4px;
	}
</style>
