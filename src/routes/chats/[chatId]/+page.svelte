<script>
	import { page } from '$app/stores';
	import { onDestroy, onMount } from 'svelte';
	import { getLoggedInUser } from '../../../database/auth';
	import { updateUsernameInChat, getChatMembersIdsToNamesMap } from '../../../database/chats';
	import { subscribeChatMessages, sendTextMessage } from '../../../database/messaging';
	import Spinner from '../../../components/shared/Spinner.svelte';

	$: currentChatId = $page.params.chatId;

	let user = null;
	let messageText = '';

	async function sendMessage() {
		if (messageText.trim() !== '') {
			const messageTextCopy = `${messageText}`;
			messageText = '';
			await sendTextMessage(currentChatId, user.id, messageTextCopy);
			console.log('messageText ' + messageTextCopy);
		} else {
			console.log("Can't sand a blank message!");
		}
	}

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
	let userDictionary = null;

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
			await updateUsernameInChat(chatId, user.id, user.displayName);
		}
		userDictionary = await getChatMembersIdsToNamesMap(chatId);
	}

	$: onChatChanged(currentChatId);
</script>

{#if user !== null}
	{#if messages === null || userDictionary === null}
		<div class="spinner-container">
			<Spinner />
		</div>
	{:else}
		<p>{currentChatId}</p>
		<div class="messages-container">
			{#each messages as message}
				<div class="message">
					<p><strong>{userDictionary.get(message.userId)}</strong>: {message.content}</p>
				</div>
			{/each}
		</div>
		<form class="input-field" on:submit|preventDefault={sendMessage}>
			<textarea
				type="text"
				id="new-username"
				bind:value={messageText}
				placeholder="Write a message..."
			/>
			<button type="submit">send</button>
		</form>
	{/if}
{/if}

<style>
	.messages-container {
		overflow-y: scroll;
		height: calc(100vh - 80.875px - 6px - 59px - 170px);
		padding-bottom: 10px;
	}
	.spinner-container {
		width: 100%;
		display: flex;
		justify-content: center;
		padding: 48px 0;
	}

	.input-field {
		border: 1px solid #ccc;
		border-radius: 6px;
		padding: 10px;
		margin-bottom: 70px;
		height: 50px;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.input-field textarea {
		min-height: 20px;
		border: 1px solid #ccc;
		border-radius: 6px;
		padding: 10px;
		margin-right: 10px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
	}

	.input-field button {
		background-color: #709692;
		border: none;
		border-radius: 6px;
		padding: 8px 16px;
		width: 100%;
		cursor: pointer;
		color: white;
		font-size: normal;
		font-weight: normal;
		transition: background-color 0.3s ease;
		width: 100px;
		margin-right: 20px;
	}
</style>
