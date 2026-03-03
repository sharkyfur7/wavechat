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

	let input_create_server_name = $state('');
	let input_add_server_memberid = $state('');
	let input_add_server_serverid = $state('');

	async function apiCall(endpoint: string, body: object) {
		const response = await fetch(`${PUBLIC_API_URL}/${endpoint}`, {
			method: 'POST',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body)
		});
		return { data: await response.json(), status: response.status };
	}

	async function createServer() {
		let name = input_create_server_name.trim();
		if (name === '') return;
		input_create_server_name = '';

		const response = await apiCall('createServer', { name });
		alert(`${response.data} (${response.status})`);
	}

	async function addServerMember() {
		let userId = input_add_server_memberid.trim();
		let serverId = input_add_server_serverid.trim();
		if (userId === '' || serverId === '') return;
		input_add_server_memberid = '';
		input_add_server_serverid = '';

		const response = await apiCall('addServerMember', { userId, serverId });
		alert(`${response.data?.error || response.data?.status} (${response.status})`);
	}

	async function createChannel() {
		let channelName = input_create_channel_name.trim();
		if (channelName === '') return;
		input_create_channel_name = '';

		const response = await apiCall('createChannel', { channelName });
		alert(`${response.data} (${response.status})`);
	}

	async function addMember() {
		let userId = input_add_member_id.trim();
		let channelId = input_add_member_channel_id.trim();
		if (userId === '' || channelId === '') return;
		input_add_member_id = '';
		input_add_member_channel_id = '';

		const response = await apiCall('addChannelMember', { userId, channelId });
		alert(`${response.data?.error || response.data?.status} (${response.status})`);
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

	<h3>Create server</h3>
	<input bind:value={input_create_server_name} type="text" placeholder="server name" />
	<button onclick={createServer}>Create</button>

	<h3>Add server member</h3>
	<input bind:value={input_add_server_memberid} type="text" placeholder="user id" />
	<input bind:value={input_add_server_serverid} type="text" placeholder="server id" />
	<button onclick={addServerMember}>Add</button>
</div>
