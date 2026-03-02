<script lang="ts">
	import Navbar from '$lib/components/Navbar.svelte';
	import UserInfo from '$lib/components/UserInfo.svelte';
	import { onMount } from 'svelte';
	import { getSessionData } from '../auth/page.svelte';
	import type { SessionData } from '../../types';
	import { PUBLIC_API_URL } from '$env/static/public';

	let sessionData: SessionData | null = $state(null);

	let input_create_channel_name = $state('');
	let input_add_member_id = $state('');
	let input_add_member_channel_id = $state('');

	async function createChannel() {
		let channelName = input_create_channel_name.trim();

		if (channelName === "") return;

		let response = await fetch(`${PUBLIC_API_URL}/createChannel`, {
			method: 'POST',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ channelName })
		});

		input_create_channel_name = '';
		alert(`${await response.json()} (${response.status})`);
	}

	async function addMember() {
		let userId = input_add_member_id.trim();
		let channelId = input_add_member_channel_id.trim();

		if (userId === "" || channelId === "") return;

		let response = await fetch(`${PUBLIC_API_URL}/addChannelMember`, {
			method: 'POST',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				userId: input_add_member_id,
				channelId: input_add_member_channel_id
			})
		});

		input_add_member_id = '';
		input_add_member_channel_id = ''
		let res = await response.json();
		console.log(res);
		alert(`${res?.error || res?.status} (${response.status})`);
	}

	onMount(async () => {
		sessionData = await getSessionData();
	});
</script>

<h1>Chat page</h1>
<Navbar />
<UserInfo {sessionData} />

<div>
	<h2>Channel</h2>
	<h3>Create</h3>
	<input bind:value={input_create_channel_name} type="text" placeholder="channel name" />
	<button onclick={createChannel}>Create</button>

	<h3>Add member</h3>
	<input bind:value={input_add_member_id} type="text" placeholder="user id" />
	<input bind:value={input_add_member_channel_id} type="text" placeholder="channel id" />
	<button onclick={addMember}>Add</button>
</div>
