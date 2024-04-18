<script>
	import { goto } from '$app/navigation';
	import { logOutUser } from '../database/auth';

	async function logOut() {
		//TODO: remove this function, move it elsewhere
		await logOutUser();
		goto('/login');
	}
</script>

<div>
	<a href="/test/subscribe">Test subscription</a>
</div>
<div>
	<a href="/test/secrets">Test secrets</a>
</div>
<button on:click={logOut}>Logout</button>
