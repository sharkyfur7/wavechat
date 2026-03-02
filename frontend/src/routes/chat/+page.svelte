<script lang="ts">
	import Navbar from '$lib/components/Navbar.svelte';
	import UserInfo from '$lib/components/UserInfo.svelte';
	import ChatMessageComponent from '$lib/components/ChatMessageComponent.svelte';
	import { chatStore } from '$lib/stores/chatStore.svelte';
	import { getSessionData } from '../auth/page.svelte';
	import type { Channel, SessionData } from '../../types';
	import { onDestroy, onMount, untrack } from 'svelte';
	import { PUBLIC_API_URL } from '$env/static/public';
	import { sleep } from '$lib/util';

	let sessionData: SessionData | null = $state(null);
	let channelId: number | null = $state(null);
	let message = $state('');
	let channels: Channel[] = $state([]);

	async function sendMessage() {
		if (!channelId) return;

		let trimmed_message = message.trim();
		if (trimmed_message === "") return;

		chatStore.sendMessage(channelId, trimmed_message);
		message = '';
	}

	onMount(async () => {
		sessionData = await getSessionData();
		let channel_response = await fetch(`${PUBLIC_API_URL}/getUserChannels`, {
			credentials: 'include'
		})

		channels = (await channel_response.json()).channels;

		await chatStore.connect();
		// sleep because it doesnt subscribe to the channel after
		// connecting for some reason lmao
		await sleep(10);
		channelId = channels[0].id;
		chatStore.subscribe(channelId);
	});

	onDestroy(() => chatStore.disconnect());

	$effect(() => {
		if (channelId) {
			const id = channelId; // to make typescript not angry

			// so that reading state inside these funcs
			// doesnt re-trigger the $effect again
			untrack(() => {
				chatStore.subscribe(id);
				chatStore.loadMessages(id);
			})
		}
	});
</script>

<h1>Chat page</h1>
<Navbar />
<UserInfo {sessionData} />

<div>
	Websocket state: {chatStore.wsState}<br />
	ChannelId: {channelId}
</div>

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

	<div>
		<select bind:value={channelId} name="channel">
			{#each channels as channel}
				<option value={channel.id}>{channel.name}</option>
			{/each}
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
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
	}
</style>
