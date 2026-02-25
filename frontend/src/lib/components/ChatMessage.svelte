<script lang="ts">
	import type { User } from 'better-auth';

	const { userName, content } = $props();
</script>

<div>
	<span class="name">{userName}</span>{content}
</div>

<style>
	.name {
		margin-right: 1em;
	}
</style>
