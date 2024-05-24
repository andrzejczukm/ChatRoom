<script>
    import { writable} from 'svelte/store'
    import { page } from '$app/stores';
    import {listAllImages, downloadSelected } from '../../../database/catalog';
	import { onMount } from 'svelte';

let imageUrls = writable([]);

$: chatId = $page.params.chatId;
    onMount(async () => {
    const urls = await listAllImages(chatId);
    imageUrls.set(urls);
});


</script>

<meta name="viewport" content="width=device-width, initial-scale=1.0">

<div class="grid-container">
    {#each $imageUrls as imageObj}
      <div>
        <figure>
          <label class="image-wrapper">
            <input type="checkbox" class="image-checkbox" image-url={imageObj.imageUrl}, image-title={imageObj.imageTitle}>
            <img src={imageObj.imageUrl} alt={imageObj.imageTitle}>
          </label>
          <figcaption>{imageObj.imageTitle}</figcaption>
        </figure>
      </div>
    {/each}
  </div>
<button on:click={downloadSelected} id='downloadSelected'> Download Selected</button>



    


<style>
.image-checkbox {
    position: absolute;
    opacity: 0;
    pointer-events: none;
}

.image-wrapper img {
    width: 100%;
    height: 100%;
    cursor: pointer;
    border: 2px solid transparent;
    transition: border-color 0.3s;
}

.grid-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(256px, 1fr));
    gap: 10px;
    background-color: #709692;
    padding: 10px;
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
    border-color: blue;
}

* {
    box-sizing: border-box;
}

figcaption {
    text-align: center;
}

</style>