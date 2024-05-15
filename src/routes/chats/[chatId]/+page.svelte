<script>
	import { page } from '$app/stores';
	import { onDestroy, onMount } from 'svelte';
	import { getLoggedInUser } from '../../../database/auth';
	import { updateUsernameInChat } from '../../../database/chats';
	import { subscribeChatMessages } from '../../../database/messaging';
	import Spinner from '../../../components/shared/Spinner.svelte';

	$: currentChatId = $page.params.chatId;

	let user = null;

	let unsubscribeMessages = () => {};

	onMount(() => {
		user = getLoggedInUser();
		// redirects are handled by +layout.svelte
		updateUsernameInChat(currentChatId, user.id, user.displayName);
	});

	onDestroy(() => {
		unsubscribeMessages();
	});

	let messages = null;

	/**
	 * Fires when a user switches between the chats
	 * @param chatId currently viewed chat
	 */
	async function onChatChanged(chatId) {
		// unsubscribe from the previous chat
		unsubscribeMessages();
		// subscribe to chat messages
		unsubscribeMessages = subscribeChatMessages(chatId, (newMessages) => {
			messages = newMessages;
		});
		// update username within the chat
		if (user !== null) {
			console.log(chatId);
			await updateUsernameInChat(chatId, user.id, user.displayName);
		}
	}

	$: onChatChanged(currentChatId);
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
