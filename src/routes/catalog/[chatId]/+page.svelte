<script>
	import { writable } from 'svelte/store';
	import { page } from '$app/stores';
	import { listAllImages, downloadSelected, getChatName } from '../../../database/catalog';
	import { onMount } from 'svelte';
	import Spinner from '../../../components/shared/Spinner.svelte';

	let imagesData = writable([]);
	let chatName = '';

	let selectedImagesIdx = [];
	let hoverDownloadWithCaptions = false;
	let hoverDownloadWithFilenames = false;

	$: chatId = $page.params.chatId;

	onMount(async () => {
		chatName = await getChatName(chatId);
		const fetchedImagesData = await listAllImages(chatId);
		imagesData.set(fetchedImagesData);
	});

	async function handleDownloadSelected(useCaptions) {
		const downloadImageData = selectedImagesIdx.map((i) => {
			const fullImageData = $imagesData[i];
			const desiredFilename = useCaptions ? fullImageData.caption : fullImageData.imageTitle;
			return { downloadUrl: fullImageData.imageUrl, desiredFilename };
		});
		await downloadSelected(downloadImageData);
	}

	function handleSelectAll() {
		// [0, 1, 2, ..., $imagesData.length - 1]
		selectedImagesIdx = [...Array($imagesData.length).keys()];
	}

	function handleSelectNone() {
		selectedImagesIdx = [];
	}
</script>

<meta name="viewport" content="width=device-width, initial-scale=1.0" />

{#if $imagesData.length === 0}
	<div class="spinner-container">
		<Spinner />
	</div>
{:else}
	<div class="main-container">
		<header>
			<h2>{chatName}</h2>
			<div class="button-container">
				<button
					on:click={() => handleDownloadSelected(true)}
					on:mouseenter={() => (hoverDownloadWithCaptions = true)}
					on:mouseleave={() => (hoverDownloadWithCaptions = false)}
					class="btn btn-primary">Download selected with captions</button
				>
				<button
					on:click={() => handleDownloadSelected(false)}
					on:mouseenter={() => (hoverDownloadWithFilenames = true)}
					on:mouseleave={() => (hoverDownloadWithFilenames = false)}
					class="btn btn-primary">Download selected with filenames</button
				>
				<button on:click={handleSelectAll} class="btn btn-secondary">Select all</button>
				<button on:click={handleSelectNone} class="btn btn-secondary">Select none</button>
			</div>
		</header>
		<div class="grid-container">
			{#each $imagesData as imageObj, idx}
				<div class="image-container">
					<label class="image-wrapper">
						<input
							type="checkbox"
							class="image-checkbox"
							bind:group={selectedImagesIdx}
							value={idx}
						/>
						<img src={imageObj.imageUrl} alt={imageObj.imageTitle} />
					</label>
					<p
						class="caption"
						class:highlighted={hoverDownloadWithCaptions && selectedImagesIdx.includes(idx)}
					>
						{imageObj.caption}
					</p>
					<p
						class="filename"
						class:highlighted={hoverDownloadWithFilenames && selectedImagesIdx.includes(idx)}
					>
						{imageObj.imageTitle}
					</p>
				</div>
			{/each}
		</div>
	</div>
{/if}

<style>
	.main-container {
		padding: 10px 40px 0;
		height: calc(100vh - 80.875px - 6px - 59px);
		overflow-y: scroll;
	}

	header {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
	}

	.image-checkbox {
		position: absolute;
		opacity: 0;
		pointer-events: none;
	}

	.button-container {
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
		gap: 12px;
	}

	.image-wrapper img {
		width: 100%;
		height: 100%;
		cursor: pointer;
		border: 5px solid transparent;
		transition: border-color 0.3s;
	}

	.image-container {
		display: flex;
		flex-direction: column;
		gap: 2px;
		align-items: center;
	}

	.image-container p {
		margin: 0;
		text-align: center;
		width: 100%;
		transition: color 0.25s ease;
		color: gray;
	}

	.image-container .caption {
		font-weight: 500;
	}

	.image-container .filename {
		font-style: italic;
	}

	.image-container .highlighted {
		color: black;
	}

	.grid-container {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(256px, 1fr));
		gap: 10px;
		/* background-color: #709692; */
		padding: 10px 0;
		justify-content: center;
		align-content: center;
	}

	.image-wrapper {
		width: 256px; /* Fixed width */
		height: 256px; /* Fixed height */
		overflow: hidden; /* Hide overflow content */
		display: flex;
		justify-content: center; /* Center horizontally */
		align-items: center; /* Center vertically */
		border: 2px solid transparent;
		transition: border-color 0.3s;
		background-color: white; /* Set background color to white */
	}

	.image-checkbox:checked + img {
		border-color: #709692;
	}

	* {
		box-sizing: border-box;
	}

	.spinner-container {
		width: 100%;
		display: flex;
		justify-content: center;
		padding: 48px 0;
	}
</style>
