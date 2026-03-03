<script lang="ts">
	import type { Session, User } from 'better-auth';
	import type { SessionData } from '../../types';

	let { sessionData }: { sessionData: SessionData | null } = $props();
</script>

<div class="wrapper">
	<table>
		<tbody>
			<tr>
				<td>Username</td>
				<td>{sessionData?.user.name ?? '<Signed out>'}</td>
			</tr>

			<tr>
				<td>User ID</td>
				<td>{sessionData?.user.id ?? '<Signed out>'}</td>
			</tr>
		</tbody>
	</table>
</div>

<style>
	.wrapper {
		margin: 8px 0px;
	}

	table {
		border: 1px solid grey;
	}

	td {
		min-width: 8em;
		padding: 2px 4px;
	}

	tr:nth-child(even) {
		backdrop-filter: brightness(150%);
		background: transparent;
	}
</style>
