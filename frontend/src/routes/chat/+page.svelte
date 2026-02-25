<script lang="ts">
	import Navbar from '$lib/components/Navbar.svelte';
	import { onDestroy, onMount } from 'svelte';
	import { getSessionData } from '../auth/page.svelte';
	import { PUBLIC_WEBSOCKET_URL } from '$env/static/public';
	import UserInfo from '$lib/components/UserInfo.svelte';
	import type { SessionData } from '../../types';
	import ChatMessage from '$lib/components/ChatMessage.svelte';

	interface Message {
		content: string;
		userId: string;
		userName: string;
	}
	let message_history: Message[] = $state([]);

	let message = $state('');
	let sessionData: SessionData | null = $state(null);
	let ws: WebSocket;
	let ws_state = $state('CONNECTING');

	async function wsConnect() {
		ws?.close();
		ws = new WebSocket(PUBLIC_WEBSOCKET_URL);
		ws.onopen = (event) => {
			ws_state = 'OPEN';
			ws.send(JSON.stringify({ type: 'subscribe', channelId: 0 }));
		};

		ws.onclose = (event) => {
			ws_state = 'DISCONNECTED... reconnecting...';
			console.log('WS connection lost... reconnecting');
			setTimeout(wsConnect, 3000);
		};

		ws.onmessage = (event) => {
			const { type, content, userId, userName } = JSON.parse(event.data);
			console.log(event.data); // weird

			if (type === 'message') {
				let msg: Message = { content, userId, userName };
				message_history.push(msg);
				message_history = message_history; // trigger reactivity
				console.log(`Recieved message "${content}" from ${userName}`);
			}
		};
	}

	async function sendMessage() {
		if (ws.readyState !== WebSocket.OPEN) {
			console.log('WebSocket not OPEN');
			return;
		}

		ws.send(JSON.stringify({ type: 'message', content: message, channelId: 0 }));
		message = '';
	}

	onMount(async () => {
		sessionData = await getSessionData();
		await wsConnect();
	});

	onDestroy(() => {
		ws?.close(); // s
	});
</script>

<h1>Chat page</h1>
<Navbar />
<UserInfo {sessionData} />

<div>
	Websocket state: {ws_state}
</div>

<div>
	<div id="chatbox">
		{#each message_history as message}
			<ChatMessage userName={message.userName} content={message.content} />
		{/each}
	</div>

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
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
	}
</style>
