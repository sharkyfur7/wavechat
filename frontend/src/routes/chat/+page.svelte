<script lang="ts">
	import Navbar from '$lib/components/Navbar.svelte';
	import UserInfo from '$lib/components/UserInfo.svelte';
	import ChatMessageComponent from '$lib/components/ChatMessageComponent.svelte';
	import { chatStore } from '$lib/stores/chatStore.svelte';
	import { getSessionData } from '../auth/page.svelte';
	import type { SessionData } from '../../types';
	import { onDestroy, onMount, untrack } from 'svelte';
	import type { Server, Channel } from '@wavechat/shared';
	import { fetchInitialChatData } from '$lib/services/chatData.svelte';
	import ChatDebugInfo from '$lib/components/ChatDebugInfo.svelte';

	// Input state
	let selected_server_id: number | null = $state(null);
	let selected_channel_id: number | null = $state(null);
	let message = $state('');
	let channel_mode: 'server' | 'private' = $state('server');

	// Data state
	let session_data: SessionData | null = $state(null);
	let user_servers: Server[] = $state([]);
	let all_channels: Channel[] = $state([]);
	// private as in they are not a part of a server
	let private_channels: Channel[] = $derived(
		all_channels.filter((channel) => channel.serverId === null)
	);
	let current_channels: Channel[] = $derived.by(() => {
		if (channel_mode === 'server') {
			return all_channels.filter((channel) => channel.serverId === selected_server_id);
		} else {
			return private_channels;
		}
	});

	async function sendMessage() {
		if (!selected_channel_id) return;

		let trimmed_message = message.trim();
		if (trimmed_message === '') return;

		chatStore.sendMessage(selected_channel_id, trimmed_message);
		message = '';
	}

	async function initializeChat() {
		session_data = await getSessionData();
		if (!session_data) return;

		// gotta connect to da backend first!
		await chatStore.connect();

		const { channels, servers } = await fetchInitialChatData();
		user_servers = servers;
		all_channels = channels;
		selected_server_id = user_servers[0]?.id ?? null;
	}

	onMount(async () => {
		await initializeChat();
	});

	onDestroy(() => chatStore.disconnect());

	// channel mode change
	$effect(() => {
		if (channel_mode === 'server') selected_server_id = user_servers[0]?.id ?? null;
		if (channel_mode === 'private') selected_server_id = null;
		selected_channel_id = current_channels[0]?.id ?? null;
	});

	// channel change
	$effect(() => {
		if (selected_channel_id && chatStore.subscribed_channel_id !== selected_channel_id) {
			untrack(() => {
				//@ts-ignore
				chatStore.subscribe(selected_channel_id);
				//@ts-ignore
				chatStore.loadMessages(selected_channel_id);
			});
		}
	});
</script>

<h1>Chat page</h1>
<Navbar />

{#if session_data}
	<UserInfo sessionData={session_data} />

	<ChatDebugInfo
		ws_state={chatStore.wsState}
		channel_id={selected_channel_id}
		server_id={selected_server_id}
	></ChatDebugInfo>

	<div>
		<div id="chatbox">
			{#each chatStore.messages as message}
				<ChatMessageComponent
					userName={message.user.name}
					content={message.content}
					date={new Date(message.createdAt)}
				/>
			{/each}
		</div>

		<form>
			<label>
				<input bind:group={channel_mode} type="radio" name="channel_type" value="server" />
				Server channels
			</label>

			<label>
				<input bind:group={channel_mode} type="radio" name="channel_type" value="private" />
				Private channels
			</label>
		</form>

		<div>
			{#if channel_mode === 'server'}
				<select bind:value={selected_server_id} name="server">
					{#each user_servers as server}
						<option value={server.id}>{server.name}</option>
					{/each}
				</select>
			{/if}

			<select bind:value={selected_channel_id} name="channel">
				{#each current_channels as channel}
					<option value={channel.id}>{channel.name}</option>
				{/each}
			</select>

			<input style="width: 24em;" bind:value={message} type="text" />
			<button onclick={sendMessage}>send</button>
		</div>
	</div>
{:else}
	<h2>You are not signed in.</h2>
{/if}

<style>
	#chatbox {
		height: 256px;
		width: 600px;
		overflow-y: auto;
		border: 1px solid black;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
	}
</style>
