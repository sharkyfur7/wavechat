<script lang="ts">
	import type { User } from 'better-auth';

	const { userName, content, date } = $props();
</script>

<div class="msg">
	<span class="time">[{date.getHours()}:{date.getMinutes()}]</span>
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
	}
</style>
