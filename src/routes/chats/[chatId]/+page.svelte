<script>
	import { page } from '$app/stores';
	import { onDestroy, onMount } from 'svelte';
	import { getLoggedInUser } from '../../../database/auth';
	import { updateUsernameInChat, getChatRoomData } from '../../../database/chats';
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
	let chatData = null;

	// messages pagination
	let pageSize = 40;
	let currentDisplayedMessages = pageSize;
	let isMoreMessagesLoading = false;

	function onNewMessages(newMessages) {
		messages = newMessages;
		isMoreMessagesLoading = false;
	}

	/**
	 * Fires when a user switches between the chats
	 * @param chatId currently viewed chat
	 */
	async function onChatChanged(chatId) {
		// unsubscribe from the previous chat, reset chatData and pagination
		unsubscribeMessages();
		chatData = null;
		currentDisplayedMessages = pageSize;
		// subscribe to chat messages
		unsubscribeMessages = subscribeChatMessages(chatId, currentDisplayedMessages, onNewMessages);
		// update username within the chat
		if (user !== null) {
			await updateUsernameInChat(chatId, user.id, user.displayName);
		}
		// refresh chat room data
		chatData = await getChatRoomData(chatId);
	}

	function loadMoreMessages() {
		isMoreMessagesLoading = true;
		// unsubscribe from listener with more messages
		unsubscribeMessages();
		// subscribe with a greater page size
		currentDisplayedMessages += pageSize;
		unsubscribeMessages = subscribeChatMessages(
			currentChatId,
			currentDisplayedMessages,
			onNewMessages
		);
	}

	$: onChatChanged(currentChatId);
</script>

{#if user !== null}
	{#if messages === null || chatData === null}
		<div class="spinner-container">
			<Spinner />
		</div>
	{:else}
		<div class="list-container">
			<p>{chatData.name}</p>
			<a href={`${currentChatId}/manage`} class="settings-btn">Settings</a>
		</div>
		<hr class="separator" />
		<div class="messages-container">
			{#if isMoreMessagesLoading || messages.length === currentDisplayedMessages}
				<div class="load-more-container">
					{#if isMoreMessagesLoading}
						<Spinner radius={13} />
					{:else}
						<button class="btn btn-primary" on:click={loadMoreMessages}>Load more messages</button>
					{/if}
				</div>
			{/if}
			{#each messages as message}
				<div class="message">
					<p>
						<span class="user-mess">
							{chatData.membersIdsToNames.get(message.userId)}
						</span>
						<span class="timestamp-mess">{message.timestamp.toDate().toLocaleString()}</span>
					</p>
					<p>
						<span class="message-bubble">
							{message.content}
						</span>
					</p>
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
	.timestamp-mess {
		font-size: small;
		font-weight: normal;
	}
	.user-mess {
		justify-content: left;
		font-family: Roboto;
		font-size: 16px;
	}
	.message {
		padding: 5px;
		display: flex;
		flex-direction: column;
		justify-content: center;
	}

	.message p {
		margin: 0;
		padding: 2px;
		font-weight: bold;
	}

	.strong {
		font-weight: 100;
	}
	.message-bubble {
		margin-bottom: 10px;
		border-radius: 6px;
		padding: 5px 10px;
		height: fit-content;
		weight: fit-content;
		color: rgb(0, 0, 0);
		font-size: 16px;
		font-weight: 400;
	}

	.messages-container {
		overflow-y: scroll;
		height: calc(100vh - 80.875px - 6px - 59px - 170px);
		padding-bottom: 10px;
	}

	.load-more-container {
		width: 100%;
		display: flex;
		flex-direction: row;
		justify-content: center;
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

	.settings-btn {
		display: block;
		text-decoration: none;
		background-color: white;
		color: #709692;
		border: 1px solid;
		font-family: Roboto;
		font-weight: bold;
	}

	.list-container {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		font-family: Roboto;
		font-weight: bold;
	}
	.list-container p {
		font-size: x-large;
		font-family: Roboto;
		color: black;
		font-weight: 800;
	}

	.list-container a {
		width: auto;
		height: fit-content;
		font-weight: bold;
		font-size: 1em;
		border-radius: 4px;
		padding: 5px;
		cursor: pointer;
	}
	.separator {
		border: none;
		border-top: 1px solid #000;
		margin: 0;
	}
</style>
