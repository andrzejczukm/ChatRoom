<script>
	import Dialog from './Dialog.svelte';

	export let text;
	export let onConfirm;

	export function show() {
		visible = true;
	}

	function cancel() {
		visible = false;
	}

	async function confirm() {
		visible = false;
		onConfirm();
	}

	let visible = false;
</script>

<button class="open-button" on:click={show}>
	<slot />
</button>
<Dialog bind:visible>
	<h2>Confirmation required</h2>
	<p>{text}</p>
	<div class="actions">
		<button on:click={cancel}>Cancel</button>
		<button on:click={confirm}>Yes</button>
	</div>
</Dialog>

<style>
	button {
		display: block;
		border: none;
		background: none;
		padding: 0;
		cursor: pointer;
	}

	h2 {
		margin: 0;
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
