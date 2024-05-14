<script>
	export let text;
	export let onConfirm;

	function show() {
		visible = true;
	}

	function cancel() {
		visible = false;
	}

	function confirm() {
		visible = false;
		onConfirm();
	}

	let visible = false;
</script>

<button class="open-button" on:click={show}>
	<slot />
</button>
{#if visible}
	<div class="overlay">
		<main class="card-container">
			<h2>Confirmation required</h2>
			<p>{text}</p>
			<div class="actions">
				<button on:click={cancel}>Cancel</button>
				<button on:click={confirm}>Yes</button>
			</div>
		</main>
	</div>
{/if}

<style>
	h2 {
		margin: 0;
	}

	button {
		display: block;
		border: none;
		background: none;
		padding: 0;
		cursor: pointer;
	}

	.overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.7);
		z-index: 40;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.card-container {
		background-color: whitesmoke;
		border-radius: 12px;
		padding: 20px;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.actions {
		display: flex;
		flex-direction: row;
		gap: 24px;
		justify-content: end;
	}

	.actions button {
		font-size: large;
		color: #709692;
	}

	.actions button:hover {
		text-decoration: underline;
	}
</style>
