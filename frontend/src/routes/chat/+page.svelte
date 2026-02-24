<script lang="ts">
	import Navbar from '$lib/components/Navbar.svelte';
	import { onMount } from 'svelte';
	import { getSessionData } from '../auth/page.svelte';
	import type { Session, User } from 'better-auth';
	import { PUBLIC_API_URL } from '$env/static/public';
	import UserInfo from '$lib/components/UserInfo.svelte';
	import type { SessionData } from '../../types';

	let message = $state('');
	let sessionData: SessionData | null = $state(null);

	async function sendMessage() {
		const response = await fetch(`${PUBLIC_API_URL}/message`, {
			method: 'POST',
			body: JSON.stringify({ message }),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		alert(await response.json());
	}

	onMount(async () => {
		sessionData = await getSessionData();
	});
</script>

<h1>Chat page</h1>
<Navbar />
<UserInfo {sessionData} />

<div>
	<div id="chatbox"></div>

	<div>
		<select name="channel">
			<option>no channel</option>
		</select>
		<input style="width: 24em;" bind:value={message} type="text" />
		<button onclick={sendMessage}>send</button>
	</div>
</div>

<style>
	#chatbox {
		height: 200px;
		overflow-y: scroll;
		border: 1px solid black;
	}
</style>
