<script>
	export let visible;
</script>

{#if visible}
	<div class="overlay">
		<main class="card-container">
			<slot />
		</main>
	</div>
{/if}

<style>
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
</style>
