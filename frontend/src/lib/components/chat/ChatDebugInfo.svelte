<script lang="ts">
	let { ws_state, channel_id, server_id } = $props();
</script>

<details>
	<summary>Debug info</summary>
	<table class="debug-table">
		<tbody>
			<tr>
				<td>ws_state</td>
				<td>{ws_state ?? 'null'}</td>
			</tr>

			<tr>
				<td>channel_id</td>
				<td>{channel_id ?? 'null'}</td>
			</tr>

			<tr>
				<td>server_id</td>
				<td>{server_id ?? 'null'}</td>
			</tr>
		</tbody>
	</table>
</details>

<style>
	.debug-table {
		border: 1px solid grey;
	}

	.debug-table > tbody > tr > td {
		min-width: 7em;
		padding: 2px 4px;
	}

	.debug-table > tbody > tr:nth-child(even) {
		backdrop-filter: brightness(150%);
		background: transparent;
	}
</style>
