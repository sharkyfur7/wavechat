<script lang="ts">
	import type { User } from 'better-auth';

	const { userName, content, date }: { userName: string; content: string; date: Date } = $props();

	let hours = $derived(date.getHours().toString().padStart(2, '0'));
	let minutes = $derived(date.getMinutes().toString().padStart(2, '0'));
</script>

<div class="msg">
	<span class="time">[{hours}:{minutes}]</span>
	<span class="name">&lt;{userName}&gt;</span>
	<span>{content}</span>
</div>

<style>
	.msg {
		display: flex;
		gap: 6px;
	}

	.name {
		font-weight: bold;
	}

	.time {
		opacity: 0.5;
		/* useful for displaying time! */
		font-variant-numeric: tabular-nums;
	}
</style>
