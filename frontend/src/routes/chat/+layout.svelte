<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import type { Channel, Server } from '@wavechat/shared';
	import '../../app.css';
	import type { SessionData } from '../../types';
	import { onDestroy, onMount } from 'svelte';
	import { chatStore } from '$lib/stores/chatStore.svelte';
	import { resolve } from '$app/paths';
	import Navbar from '$lib/components/Navbar.svelte';
	import UserInfo from '$lib/components/UserInfo.svelte';

	let { data, children } = $props();

	let loading = $state(true);
	let selected_server_id: string = $state('');
	let channels_server_mode = $state(true);

	let user_servers: Server[] = $state([]);
	let all_channels: Channel[] = $state([]);
	let server_channels: Channel[] = $derived(
		all_channels.filter((c) => c.serverId === selected_server_id)
	);
	let private_channels: Channel[] = $derived(all_channels.filter((c) => c.serverId === null));
	let session_data: SessionData | null = $state(null);

	function openPrivateMessages() {
		channels_server_mode = false;
		chatStore.clearMessages();
	}

	onMount(async () => {
		session_data = data.session_data ?? null;

		if (!session_data) {
			loading = false;
			return;
		}

		await chatStore.connect();

		all_channels = data.channels ?? [];
		user_servers = data.servers ?? [];
		selected_server_id = user_servers[0].id ?? '';
		loading = false;
	});

	onDestroy(() => chatStore.disconnect());
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{#if loading}
	<div class="loading">Loading...</div>
{:else}
	<h1>Chat page</h1>
	<Navbar />
	<UserInfo sessionData={session_data} />

	<div class="interface">
		<div>
			<button onclick={openPrivateMessages}>Private channels</button>

			<!-- Server + channel lists -->
			<div class="server-interface">
				<!-- Server list -->
				<div class="servers">
					{#each user_servers as server (server.id)}
						<a
							onclick={() => {
								selected_server_id = server.id;
								channels_server_mode = true;
							}}
							href={resolve('/chat/[channelId]', {
								channelId: all_channels.filter((c) => c.serverId === server.id)[0].id // some channel in the target server
							})}
						>
							{server.name}
						</a>
					{/each}
				</div>

				{#if channels_server_mode}
					<!-- Server channel list -->
					<div class="channels">
						{#each server_channels as channel (channel.id)}
							<a href={resolve('/chat/[channelId]', { channelId: channel.id })}>
								#{channel.name}
							</a>
						{/each}
					</div>
				{:else}
					<!-- Private channel list -->
					<div class="channels">
						{#each private_channels as channel (channel.id)}
							<a href={resolve('/chat/[channelId]', { channelId: channel.id })}>
								#{channel.name}
							</a>
						{/each}
					</div>
				{/if}
			</div>
		</div>

		<!-- Chat window -->
		<main class="content">
			{@render children()}
		</main>

		<!-- Member list -->
		<div></div>
	</div>
{/if}

<style>
	.loading {
		left: 0;
		right: 0;
		margin: 0 auto;
		position: absolute;
		width: fit-content;
	}

	.content {
		backdrop-filter: brightness(150%);
	}

	.interface {
		display: grid;
		grid-template-columns: 1fr 4fr 1fr;
	}

	.server-interface {
		display: grid;
		grid-template-columns: 1fr 1fr;
	}

	.servers > a,
	.channels > a {
		display: block;
		width: 100%;
	}

	.servers > a:hover,
	.channels > a:hover {
		backdrop-filter: brightness(50%);
	}
</style>
