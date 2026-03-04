<script lang="ts">
	import ChatMessageComponent from './ChatMessageComponent.svelte';

	let { messages } = $props();
</script>

<div class="chatbox">
	{#each messages as message}
		<ChatMessageComponent
			userName={message.user.name}
			content={message.content}
			date={new Date(message.createdAt)}
		/>
	{/each}
</div>

<style>
	.chatbox {
		height: 256px;
		width: 600px;
		overflow-y: auto;
		border: 1px solid black;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
	}
</style>
