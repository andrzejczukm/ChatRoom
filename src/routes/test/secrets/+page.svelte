<script>
	import { onMount } from 'svelte';
	import GoBack from '../../../components/GoBack.svelte';

	/** @type {import('./$types').ActionData} */
	export let form;

	$: caption = form?.caption ?? '';

	let files = [];
</script>

<GoBack />
<main>
	<div class="caption-container">
		<form method="POST" action="?/caption" enctype="multipart/form-data">
			<input type="file" name="imageInput" value="" bind:files />
			<button type="submit">Generate caption</button>
		</form>
		{#if caption !== ''}
			<p>{caption}</p>
		{/if}
	</div>
</main>

<style>
	main {
		display: flex;
		flex-direction: row;
		gap: 16px;
		align-items: center;
	}

	button {
		background-color: blue;
		color: white;
		font-size: large;
		height: 64px;
	}
</style>
