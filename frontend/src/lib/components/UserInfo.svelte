<script lang="ts">
	import type { Session, User } from 'better-auth';
	import type { SessionData } from '../../types';

	let { sessionData }: { sessionData: SessionData | null } = $props();
</script>

<div>
	<b>/// User info ///</b>

	<div>
		<b>UserId:</b>
		{sessionData?.user.id ?? '<Signed out>'}
	</div>

	<div>
		<b>Username:</b>
		{sessionData?.user.name ?? '<Signed out>'}
	</div>

	<div>
		<b>Email:</b>
		{sessionData?.user.email ?? '<Signed out>'}
	</div>
</div>
