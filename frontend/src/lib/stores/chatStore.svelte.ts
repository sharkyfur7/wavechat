import { PUBLIC_API_URL, PUBLIC_WEBSOCKET_URL } from '$env/static/public';
import { sleep } from '$lib/util';
import type { ChatMessage } from '@wavechat/shared';

function createChatStore() {
	let messageHistory: ChatMessage[] = $state([]);
	let ws: WebSocket | null = $state(null);
	let ws_state = $state<'CONNECTING' | 'OPEN' | 'DISCONNECTED'>('CONNECTING');
	let currentChannelId = $state(-1);

	function connect() {
		disconnect();
		ws = new WebSocket(PUBLIC_WEBSOCKET_URL);

		ws.onopen = () => {
			ws_state = 'OPEN';
			if (currentChannelId) subscribe(currentChannelId);
		};

		ws.onclose = async () => {
			ws_state = 'DISCONNECTED';
			await sleep(3000);
			connect();
		};

		ws.onmessage = (event) => {
			const { type, payload } = JSON.parse(event.data);
			if (type === 'message') {
				messageHistory.push(payload as ChatMessage);
			}
		};
	}

	function subscribe(channelId: number) {
		currentChannelId = channelId;
		ws?.send(JSON.stringify({ type: 'subscribe', payload: { channelId } }));
	}

	async function loadMessages(channelId: number) {
		const response = await fetch(`${PUBLIC_API_URL}/channels/${channelId}/messages`, {
			credentials: 'include'
		});
		const messages = await response.json();
		messageHistory = messages;
	}

	async function sendMessage(channelId: number, content: string) {
		await fetch(`${PUBLIC_API_URL}/channels/${channelId}/messages`, {
			method: 'POST',
			body: JSON.stringify({ content }),
			headers: { 'Content-Type': 'application/json' },
			credentials: 'include'
		});
	}

	function disconnect() {
		ws?.close();
	}

	return {
		get messages() {
			return messageHistory;
		},
		get wsState() {
			return ws_state;
		},
		connect,
		disconnect,
		subscribe,
		loadMessages,
		sendMessage
	};
}

export const chatStore = createChatStore();
