<script>
	// login or register
	let isLogin = true;
	let alertMessage = '';

	let email = '';
	let password = '';
	let passwordRepeat = '';

	function changeAuthType() {
		isLogin = !isLogin;
	}

	function handleSubmit() {
		if (isLogin) {
			logIn();
		} else {
			register();
		}
	}

	function logIn() {
		console.log('logging in');
		//TODO: implement when authentication works
	}

	function register() {
		if (password !== passwordRepeat) {
			alertMessage = 'Passwords must match';
			return;
		}
		if (password.length < 6) {
			alertMessage = 'Password should contain at least 6 characters';
			return;
		}
		console.log('registering');
		//TODO: implement when authentication works
	}
</script>

<div class="auth-container">
	<div class="form-container">
		<form on:submit|preventDefault={handleSubmit} class="auth-form">
			<header class="form-header">
				<h2>{isLogin ? 'Login' : 'Register'}</h2>
			</header>

			<div class="form-input">
				<label for="email">Email</label>
				<input id="email" type="email" bind:value={email} required />
			</div>

			<div class="form-input">
				<label for="password">Password</label>
				<input id="password" bind:value={password} type="password" required />
			</div>

			{#if !isLogin}
				<div class="form-input">
					<label class="auth-label" for="repeat">Repeat password</label>
					<input
						class="auth-input"
						id="repeat"
						bind:value={passwordRepeat}
						type="password"
						required
					/>
				</div>
			{/if}

			{#if alertMessage !== ''}
				<span class="auth-error">{alertMessage}</span>
			{/if}

			<button type="submit" class="login-btn">
				{isLogin ? 'Log in' : 'Register'}
			</button>
			<button type="reset" on:click={changeAuthType} class="change-auth">
				{isLogin ? "I don't have an account yet" : 'I have an account already'}
			</button>
		</form>
	</div>
</div>

<style>
	h2 {
		margin: 0;
	}

	.form-header {
		width: 100%;
		display: flex;
		justify-content: center;
	}

	.auth-container {
		display: flex;
		align-items: center;
		justify-content: center;
		padding-top: 6em;
	}

	form.auth-form,
	.form-container {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.form-container {
		width: 360px;
		padding: 24px;
		border-radius: 24px;
		background-color: whitesmoke;
	}

	form.auth-form {
		width: 100%;
	}

	.form-input {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.form-input input {
		border: none;
		border-radius: 2px;
		padding: 6px;
	}

	.auth-error {
		font-size: small;
		color: red;
	}

	button.change-auth {
		border: none;
		background-color: inherit;
		width: fit-content;
		text-decoration: underline;
		padding: 0;
		cursor: pointer;
	}

	button.login-btn {
		background-color: #b1cab5;
		border: none;
		border-radius: 6px;
		padding: 12px 0;
		cursor: pointer;
	}
</style>
