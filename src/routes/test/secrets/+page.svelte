<script>
	import GoBack from '../../../components/GoBack.svelte';

	/** @type {import('./$types').ActionData} */
	export let form;

	$: caption = form?.caption ?? '';

	const imageUrl =
		'https://firebasestorage.googleapis.com/v0/b/chatroomtranslations.appspot.com/o/dog.jpg?alt=media&token=bd6446c5-bccd-4a46-9180-49c88bf138e6';
</script>

<GoBack />
<main>
	<img src={imageUrl} alt="dog" />
	<div class="caption-container">
		<form method="POST" action="?/caption">
			<input type="text" name="imageUrl" value={imageUrl} hidden />
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
