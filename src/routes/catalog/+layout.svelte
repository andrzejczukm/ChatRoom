<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { getLoggedInUser } from '../../database/auth';

	onMount(() => {
		const user = getLoggedInUser();
		if (user === null) {
			// redirect a user if not logged in
			goto('/login');
		}
	});
</script>

<slot />
