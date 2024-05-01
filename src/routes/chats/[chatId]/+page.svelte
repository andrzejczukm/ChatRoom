<script>
	import { page } from '$app/stores';
	import { onDestroy, onMount } from 'svelte';
	import { getLoggedInUser } from '../../../database/auth';
	import { subscribeChatMessages } from '../../../database/messaging';
	import Spinner from '../../../components/shared/Spinner.svelte';

	$: currentChatId = $page.params.chatId;

	let user = null;

	let unsubscribeMessages = () => {};

	onMount(() => {
		user = getLoggedInUser();
		// redirects are handled by +layout.svelte
	});

	onDestroy(() => {
		unsubscribeMessages();
	});

	let messages = null;

	function setMessagesListener(chatId) {
		// unsubscribe from the previous chat
		unsubscribeMessages();
		// subscribe to chat messages
		unsubscribeMessages = subscribeChatMessages(chatId, (newMessages) => {
			messages = newMessages;
		});
	}

	$: setMessagesListener(currentChatId);
</script>

{#if user !== null}
	<p>{currentChatId}</p>
	{#if messages === null}
		<div class="spinner-container">
			<Spinner />
		</div>
	{:else}
		<p>there are {messages.length} messages</p>
	{/if}
{/if}

<style>
	.spinner-container {
		width: 100%;
		display: flex;
		justify-content: center;
		padding: 48px 0;
	}
</style>
