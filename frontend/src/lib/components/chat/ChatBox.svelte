<script lang="ts">
	import ChatMessageComponent from './ChatMessageComponent.svelte';
	import type { ChatMessage } from '@wavechat/shared';

	let { messages }: { messages: ChatMessage[] } = $props();
</script>

<div class="chatbox">
	{#each messages as message (message.id)}
		<ChatMessageComponent
			userName={message.user.name}
			content={message.content}
			date={new Date(message.createdAt)}
		/>
	{/each}
</div>

<style>
	.chatbox {
		height: 300px;
		overflow-y: auto;
		border: 1px solid black;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
	}
</style>
