<script>
	import { writable } from 'svelte/store';
	import { getLoggedInUser } from '../../database/auth';
	import { getRandomFolder, getImageUrlFromFolderRef, getChatName } from '../../database/catalog';
	import { onMount } from 'svelte';
	import { db } from '../../database/config';
	import { collection, query, where, getDocs } from 'firebase/firestore';
	import Spinner from '../../components/shared/Spinner.svelte';

	const chatRoomsCollection = collection(db, 'chatRooms');
	let user = null;
	let imageUrls = writable([]); // Array to store image URLs

	onMount(async () => {
		user = await getLoggedInUser();
		if (user) {
			const userChatsQuery = query(
				chatRoomsCollection,
				where('members', 'array-contains', user.id)
			);
			const userChats = await getDocs(userChatsQuery);
			const urls = [];

			for (const chat of userChats.docs) {
				const folderRef = await getRandomFolder(chat.id);
				const chatName = await getChatName(chat.id);
				if (folderRef) {
					const url = await getImageUrlFromFolderRef(folderRef);
					if (url) {
						urls.push({ imageUrl: url, chatName: chatName, chatId: chat.id }); // Add URL to the temporary array
					}
				}
			}

			// Update the writable store with the array of image URLs
			imageUrls.set(urls);
		}
	});
</script>

<meta name="viewport" content="width=device-width, initial-scale=1.0" />
{#if $imageUrls.length === 0}
	<div class="spinner-container">
		<Spinner />
	</div>
{:else}
	<div class="grid-container">
		{#each $imageUrls as imageObj}
			<div>
				<figure>
					<a href="catalog/{imageObj.chatId}">
						<div class="image-wrapper">
							<img src={imageObj.imageUrl} alt={imageObj.chatId} />
						</div></a
					>
					<a href="catalog/{imageObj.chatId}">
						<!-- svelte-ignore a11y-structure -->
						<figcaption>{imageObj.chatName}</figcaption></a
					>
				</figure>
			</div>
		{/each}
	</div>
{/if}

<style>
	img {
		width: 100%;
		height: 100%;
		display: block;
	}

	.grid-container {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		/* background-color: #709692; */
		padding: 10px;
		justify-content: space-evenly;
		align-content: center;
	}

	.image-wrapper {
		width: 256px;
		height: 256px;
		margin: 10px;
		overflow: hidden;
		background-color: white;
		justify-content: center;
		align-items: center;
	}

	* {
		box-sizing: border-box;
	}

	figcaption {
		text-align: center;
		color: #709692;
		border: none;
		text-decoration: none;
	}
	a {
		text-decoration: none;
	}

	.spinner-container {
		width: 100%;
		display: flex;
		justify-content: center;
		padding: 48px 0;
	}
</style>
