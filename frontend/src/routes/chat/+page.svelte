<script lang="ts">
	import Navbar from '$lib/components/Navbar.svelte';
	import { onDestroy, onMount } from 'svelte';
	import { getSessionData } from '../auth/page.svelte';
	import { PUBLIC_API_URL, PUBLIC_WEBSOCKET_URL } from '$env/static/public';
	import UserInfo from '$lib/components/UserInfo.svelte';
	import type { SessionData } from '../../types';
	import { sleep } from '$lib/util';
	import ChatMessageComponent from '$lib/components/ChatMessageComponent.svelte';
	import type { ChatMessage } from '../../types';

	let message_history: ChatMessage[] = $state([]);

	let message = $state('');
	let channelId = $state(0);
	let sessionData: SessionData | null = $state(null);
	let ws: WebSocket;
	let ws_id: number;
	let ws_state = $state('CONNECTING');

	async function wsConnect() {
		ws?.close();
		ws = new WebSocket(PUBLIC_WEBSOCKET_URL);
		ws_id = Math.round(Math.random() * 1000);

		ws.onopen = async (event) => {
			ws_state = 'OPEN';

			await sleep(50);
			ws.send(JSON.stringify({ type: 'subscribe', channelId: 0 }));
		};

		ws.onclose = async (event) => {
			ws_state = 'DISCONNECTED... reconnecting...';
			await sleep(3000);
			wsConnect();
		};

		ws.onmessage = (event) => {
			const { type, message } = JSON.parse(event.data);

			if (type === 'message') {
				let msg: ChatMessage = message;

				message_history.push(message);
				message_history = message_history; // trigger reactivity
			}
		};
	}

	async function sendMessage() {
		const response = await fetch(`${PUBLIC_API_URL}/message`, {
			method: 'POST',
			body: JSON.stringify({ content: message, channelId: channelId }),
			headers: {
				'Content-Type': 'application/json'
			},
			credentials: 'include'
		});

		alert(await response.json());
		message = '';
	}

	onMount(async () => {
		sessionData = await getSessionData();
		await wsConnect();
	});

	onDestroy(() => {
		ws?.close();
	});
</script>

<h1>Chat page</h1>
<Navbar />
<UserInfo {sessionData} />

<div>
	Websocket state: {ws_state}<br />
	ChannelId: {channelId}
</div>

<div>
	<div id="chatbox">
		{#each message_history as message}
			<ChatMessageComponent
				userName={message.userName}
				content={message.content}
				date={new Date(message.createdAt)}
			/>
		{/each}
	</div>

	<div>
		<select bind:value={channelId} name="channel">
			<option value={0}>default</option>
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
