<script>
	import { onMount } from 'svelte';
	import '../app.css';
	import { goto } from '$app/navigation';
	import { getLoggedInUser, logOutUser } from '../database/auth.js';

	let user = null;

	onMount(() => {
		user = getLoggedInUser();
	});

	async function logOut() {
		await logOutUser();
		// goto('/login');
		location.reload();
	}
</script>

<header>
	<div class="header-right">
		<h1 class="logo"><a href="/">Holiday Chat Room</a></h1>
		<div class="links">
			<a href="/about">About</a>
			<a class="active" href="/chats">Chats</a>
			<a href="/catalog">Catalogs</a>
			{#if user !== null}
				<a href="/profile">Profile</a>
				<button on:click={logOut}>Logout</button>
			{:else}
				<a href="/login">Profile</a>
				<a href="/login">Login</a>
			{/if}
		</div>
	</div>
</header>
<slot />

<footer>
	<div class="footer-content">
		<p>© 2024 Holiday Chat Room. Project created for Cloud Computing.</p>
	</div>
</footer>

<style>
	header {
		background-color: rgb(235, 235, 235);
		position: sticky;
		margin-bottom: 10px;
	}

	.header-right {
		margin-left: 30px;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.logo {
		font-size: 2em;
		color: #000;
		font-weight: 1000;
	}

	.logo a {
		text-decoration: none;
		color: inherit;
	}

	.links a {
		margin-left: 30px;
		margin-right: 30px;
		text-decoration: none;
		color: #111111;
		font-weight: bold;
	}

	.links button {
		font-family: Roboto;
		font-size: medium;
		margin-left: 30px;
		margin-right: 30px;
		text-decoration: none;
		color: #111111;
		font-weight: bold;
		background: none;
		border: none;
		cursor: pointer;
		display: inline;
		padding: 0;
	}

	.links a:hover {
		color: #709692;
		/* rgb(117, 117, 117); */
		transition: background-color 0.3s ease;
	}

	footer {
		background-color: whitesmoke;
		padding: 20px 0;
		text-align: center;
		position: absolute;
		bottom: 0;
		width: 100%;
	}

	.footer-content {
		max-width: 1200px;
		margin: 0 auto;
	}

	.footer-content p {
		margin: 0;
	}
</style>
