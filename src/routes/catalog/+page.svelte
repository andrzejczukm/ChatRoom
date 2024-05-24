<script>
    import { writable} from 'svelte/store'
    import { page } from '$app/stores';
	import { getLoggedInUser } from '../../database/auth';
    import { getRandomFolder, getImageUrlFromFolderRef, getChatName } from '../../database/catalog';
	import { onDestroy, onMount } from 'svelte';
    import { db, storage } from '../../database/config';
    import {
	collection,
	addDoc,
	onSnapshot,
	query,
	where,
	Timestamp,
	getDoc,
	doc,
	updateDoc,
	setDoc,
	getDocs,
	arrayUnion,
	arrayRemove,
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, listAll } from 'firebase/storage';

const chatRoomsCollection = collection(db, 'chatRooms');
    // Reactive declaration to log the page store value whenever it changes
    let user = null;
    let imageUrls = writable([]); // Array to store image URLs


    onMount(async () => {
        user = await getLoggedInUser();
        // console.log({ user: user });
        // console.log({ userId: user.id });
        if (user) {
            const userChatsQuery = query(chatRoomsCollection, where('members', 'array-contains', user.id));
            const userChats = await getDocs(userChatsQuery);
            // console.log(userChats)
            const urls = []; // Temporary array to store image URLs

            for (const chat of userChats.docs) {
                const folderRef = await getRandomFolder(chat.id);
                const chatName = await getChatName(chat.id)
                if (folderRef) {
                    const url = await getImageUrlFromFolderRef(folderRef);
                    if (url) {
                        urls.push({ imageUrl: url, chatName: chatName, chatId : chat.id }); // Add URL to the temporary array
                    }
                }
            }

            // Update the writable store with the array of image URLs
            imageUrls.set(urls);
        }
    });

    
</script>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<div class="grid-container">
    {#each $imageUrls as imageObj}
    <div>
        <figure>
            <a href="catalog/{imageObj.chatId}" target="_blank">
            <div class="image-wrapper">
            <img src="{imageObj.imageUrl}"/></div></a>
            <a href="catalog/{imageObj.chatId}" target="_blank">
            <figcaption>{imageObj.chatName}</figcaption></a>
        </figure>
    </div>
{/each}
</div>

<style>
    img {
        width: 100%;
        height: 100%;
        display: block; /* Remove extra space below image */
    }
    
    .grid-container {
    display: flex;
    flex-wrap: wrap;
    /* display: grid;
    grid-template-columns: auto auto auto auto; */
    gap: 10px;
    background-color: #709692;
    padding: 10px;
    justify-content: space-evenly;
    align-content: center;
    }

    .image-wrapper {
    width: 256px; /* Set desired width */
    height: 256px; /* Set desired height */
    margin: 10px; /* Adjust margin as needed */
    overflow: hidden; /* Hide overflow content */
    background-color: white; /* Set background color to white */
    justify-content: center; /* Center horizontally */
    align-items: center; /* Center vertically */
}

    * {
    box-sizing: border-box;
    }

    figcaption {
    text-align: center;
    }
</style>