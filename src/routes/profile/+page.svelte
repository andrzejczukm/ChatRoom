<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { getLoggedInUser, logOutUser, updateUserDisplayName } from '../../database/auth.js';

	let user = null;
	let newUsername = '';

	onMount(() => {
		user = getLoggedInUser();
		console.log(user);
	});

	async function changeUsername() {
		if (newUsername.trim() !== '') {
			await updateUserDisplayName(newUsername);
			user = getLoggedInUser();
			newUsername = '';
		} else {
			console.log("Username can't be blank!");
		}
	}
</script>

<div class="container">
	{#if user !== null}
		<div class="form">
			<div class="greeting">Hi {user.displayName}!</div>
			<div class="input-field">
				<div class="label">Your email:</div>
				<div class="label2">{user.email}</div>
			</div>
			<div class="input-field">
				<!-- <label for="new-username">New Username:</label> -->

				<div class="label">Change of username:</div>
				<div class="input-field2">
					<input
						type="text"
						id="new-username"
						bind:value={newUsername}
						placeholder={user.displayName}
					/>
					<button on:click={changeUsername}>ok</button>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.greeting {
		font-size: 1.5rem;
		text-align: center;
		font-family: 'Roboto', sans-serif;
		font-weight: bold;
		color: #111111;
		margin-bottom: 60px;
	}

	.label {
		text-align: center;
		font-family: 'Roboto', sans-serif;
		font-size: 1.1rem;
		max-width: 300px;
		font-weight: normal;
		color: #111111;
		margin-left: 20px;
	}

	.label2 {
		text-align: center;
		font-family: 'Roboto', sans-serif;
		font-size: 1.1rem;
		max-width: 300px;
		font-weight: bold;
		color: #111111;
		margin-right: 35px;
	}

	.input-field {
		min-height: 50px;
		border: 1px solid #ccc;
		border-radius: 6px;
		padding: 10px;
		margin-bottom: 10px;
		display: flex;
		flex-direction: row;
		gap: 200px;
		align-items: center;
		justify-content: space-between;
	}

	.input-field2 {
		padding: 10px;
		display: flex;
		flex-direction: row;
		gap: 20px;
		align-items: center;
		justify-content: right;
		min-width: 400px;
		margin-right: 0;
	}

	/* .input-field label {
		max-width: 200px;
	} */

	.input-field input[type='text'] {
		width: 100%;
		padding: 8px;
		border: 1px solid #ccc;
		border-radius: 4px;
		box-sizing: border-box;
		max-width: 200px;
		font-size: normal;
	}

	.input-field button {
		background-color: #709692;
		border: none;
		border-radius: 6px;
		padding: 8px 16px;
		width: 100%;
		cursor: pointer;
		color: white;
		font-size: normal;
		font-weight: normal;
		transition: background-color 0.3s ease;
		max-width: 200px;
		margin-right: 20px;
	}

	.input-field button:hover {
		background-color: #5c7a7d;
	}

	.container {
		max-width: 1300px;
		margin: 0 auto;
		padding: 20px;
	}
</style>
