import { PUBLIC_API_URL, PUBLIC_WEBSOCKET_URL } from '$env/static/public';
import { sleep } from '$lib/util';
import type { ChatMessage } from '@wavechat/shared';

function createChatStore() {
	let messageHistory: ChatMessage[] = $state([]);
	let ws: WebSocket | null = $state(null);
	let subscribed_channel_id: number | null = null;
	let ws_state = $state<'CONNECTING' | 'OPEN' | 'DISCONNECTED'>('CONNECTING');
	const MAX_RECONNECT_RETRIES = 5;
	const RECONNECT_MS = 4000;
	let reconnect_try = 0;

	function connect(): Promise<void> {
		disconnect();

		return new Promise((resolve) => {
			ws = new WebSocket(PUBLIC_WEBSOCKET_URL);

			ws.onopen = () => {
				ws_state = 'OPEN';
				reconnect_try = 0;
				resolve();
			};

			ws.onclose = async () => {
				ws_state = 'DISCONNECTED';

				reconnect_try += 1;
				if (reconnect_try > MAX_RECONNECT_RETRIES) {
					return;
				}

				await sleep(RECONNECT_MS);
				await connect();
			};

			ws.onmessage = (event) => {
				const { type, payload } = JSON.parse(event.data);
				if (type === 'message') {
					messageHistory.push(payload as ChatMessage);
				}
			};
		});
	}

	function subscribe(channelId: number) {
		if (ws) {
			ws.send(JSON.stringify({ type: 'subscribe', payload: { channelId } }));
			subscribed_channel_id = channelId;
		}
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
		subscribed_channel_id = null;
	}

	return {
		get messages() {
			return messageHistory;
		},
		get wsState() {
			return ws_state;
		},
		get subscribed_channel_id() {
			return subscribed_channel_id;
		},
		connect,
		disconnect,
		subscribe,
		loadMessages,
		sendMessage
	};
}

export const chatStore = createChatStore();
