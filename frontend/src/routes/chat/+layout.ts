import { fetchInitialChatData } from '$lib/services/chatData.svelte';
import { getSessionData } from '$lib/util';

export async function load() {
	const session_data = await getSessionData();

	if (!session_data) return;

	const { channels, servers } = await fetchInitialChatData();

	return {
		session_data,
		channels,
		servers
	};
}
