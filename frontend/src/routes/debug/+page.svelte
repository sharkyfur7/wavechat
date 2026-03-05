<script lang="ts">
	import Navbar from '$lib/components/Navbar.svelte';
	import UserInfo from '$lib/components/UserInfo.svelte';
	import { onMount } from 'svelte';
	import { getSessionData } from '../auth/page.svelte';
	import type { SessionData } from '../../types';
	import { PUBLIC_API_URL } from '$env/static/public';
	import { fetchInitialChatData } from '$lib/services/chatData.svelte';
	import type { Channel, Server } from '@wavechat/shared';

	let sessionData: SessionData | null = $state(null);
	let user_channels: Channel[] = $state([]);
	let user_servers: Server[] = $state([]);

	async function apiCall(endpoint: string, body: object) {
		const response = await fetch(`${PUBLIC_API_URL}/${endpoint}`, {
			method: 'POST',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body)
		});
		return { data: await response.json(), status: response.status };
	}

	async function createServer(e: Event) {
		e.preventDefault();
		const form = e.target as HTMLFormElement;
		const form_data = new FormData(form);

		const name = form_data.get('serverName')?.toString().trim() || '';
		if (!name) return;

		const response = await apiCall('createServer', { name });
		form.reset();
		alert(`${response.data?.error || response.data?.status} (${response.status})`);
	}

	async function addServerMember(e: Event) {
		e.preventDefault();
		const form = e.target as HTMLFormElement;
		const form_data = new FormData(form);

		const userId = form_data.get('userId')?.toString().trim() || '';
		const serverId = form_data.get('serverId')?.toString().trim() || '';
		if (!userId || !serverId) return;

		const response = await apiCall('addServerMember', { userId, serverId });
		form.reset();
		alert(`${response.data?.error || response.data?.status} (${response.status})`);
	}

	async function createChannel(e: Event) {
		e.preventDefault();
		const form = e.target as HTMLFormElement;
		const form_data = new FormData(form);

		const channelName = form_data.get('channelName')?.toString().trim() || '';
		const serverId = form_data.get('serverId')?.toString().trim() || '';
		if (!channelName) return;

		const response = await apiCall('createChannel', { channelName, serverId });
		form.reset();
		alert(`${response.data?.error || response.data?.status} (${response.status})`);
	}

	async function addMember(e: Event) {
		e.preventDefault();
		const form = e.target as HTMLFormElement;
		const form_data = new FormData(form);

		const channelId = form_data.get('channelId')?.toString().trim() || '';
		const userId = form_data.get('userId')?.toString().trim() || '';
		if (!channelId || !userId) return;

		const response = await apiCall('addChannelMember', { userId, channelId });
		form.reset();
		alert(`${response.data?.error || response.data?.status} (${response.status})`);
	}

	onMount(async () => {
		sessionData = await getSessionData();
		const { channels, servers } = await fetchInitialChatData();
		user_servers = servers;
		user_channels = channels;
	});
</script>

<h1>Chat page</h1>
<Navbar />
<UserInfo {sessionData} />

<div>
	<h2>Channel</h2>

	<h3>Create</h3>
	<form onsubmit={createChannel}>
		<input name="channelName" type="text" placeholder="channel name" />
		<select value="" name="serverId">
			<option value="">[None]</option>
			{#each user_servers as server (server.id)}
				<option value={server.id}>{server.name} ({server.id})</option>
			{/each}
		</select>
		<input type="submit" />
	</form>

	<h3>Add member</h3>
	<form onsubmit={addMember}>
		<input name="userId" type="text" placeholder="user id" />
		<select value="" name="channelId">
			<option value="">[None]</option>
			{#each user_channels as channel (channel.id)}
				<option value={channel.id}>
					{channel.name}
					({user_servers.find((t) => t.id === channel.serverId)?.name}) (id {channel.id})
				</option>
			{/each}
		</select>
		<input type="submit" />
	</form>

	<h3>Create server</h3>
	<form onsubmit={createServer}>
		<input name="serverName" type="text" placeholder="server name" />
		<input type="submit" />
	</form>

	<h3>Add server member</h3>
	<form onsubmit={addServerMember}>
		<input name="userId" type="text" placeholder="user id" />
		<select value="" name="serverId">
			<option value="">[None]</option>
			{#each user_servers as server (server.id)}
				<option value={server.id}>{server.name} ({server.id})</option>
			{/each}
		</select>
		<input type="submit" />
	</form>
</div>
