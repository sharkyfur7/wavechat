import { PUBLIC_API_URL } from '$env/static/public';
import type { Channel, Server } from '@wavechat/shared';

export async function fetchInitialChatData(): Promise<{ channels: Channel[]; servers: Server[] }> {
	const [channel_res, servers_res] = await Promise.all([
		fetch(`${PUBLIC_API_URL}/getUserChannels`, { credentials: 'include' }),
		fetch(`${PUBLIC_API_URL}/getUserServers`, { credentials: 'include' })
	]);

	const [channels_data, servers_data] = await Promise.all([channel_res.json(), servers_res.json()]);

	return {
		channels: channels_data.channels,
		servers: servers_data.servers
	};
}
