<script lang="ts">
	import { page } from '$app/state';
	import ChatBox from '$lib/components/chat/ChatBox.svelte';
	import { chatStore } from '$lib/stores/chatStore.svelte';
	import { onMount, untrack } from 'svelte';

	let { data } = $props();

	let message = $state('');

	let channelId = $derived(page.params.channelId);
	let current_channel = $derived(data?.channels?.filter((c) => c.id === channelId)[0]);

	async function sendMessage() {
		if (!channelId) return;
		const trimmed = message.trim();
		if (!trimmed) return;
		chatStore.sendMessage(channelId, trimmed);
		message = '';
	}

	onMount(async () => {});

	$effect(() => {
		if (!channelId) return;
		untrack(async () => {
			await chatStore.loadMessages(channelId);
			await chatStore.subscribe(channelId);
		});
	});
</script>

<header>#{current_channel?.name}</header>

<ChatBox messages={chatStore.messages}></ChatBox>

<form
	class="message-input"
	onsubmit={(e) => {
		e.preventDefault();
		sendMessage();
	}}
>
	<input bind:value={message} type="text" placeholder="Message #{current_channel?.name}" />
	<button type="submit">Send</button>
</form>

<style>
	.message-input {
		display: grid;
		grid-template-columns: 9fr 1fr;
		gap: 8px;
	}
</style>
