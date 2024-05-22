<script>
	import { page } from '$app/stores';
	import { onDestroy, onMount } from 'svelte';
	import { UploadIcon, CheckIcon } from 'svelte-feather-icons';
	import { getLoggedInUser } from '../../../database/auth';
	import { updateUsernameInChat, getChatRoomData } from '../../../database/chats';
	import { subscribeChatMessages, sendTextMessage, sendFile } from '../../../database/messaging';
	import Spinner from '../../../components/shared/Spinner.svelte';

	$: currentChatId = $page.params.chatId;

	let user = null;
	let messageText = '';
	// fake file name - only used to reset the input
	let fileInputValue = '';
	let fileInputFiles = [];

	async function sendMessage() {
		// send text message
		if (messageText.trim() !== '') {
			const messageTextCopy = `${messageText}`;
			messageText = '';
			await sendTextMessage(currentChatId, user.id, messageTextCopy);
			console.log('messageText ' + messageTextCopy);
		} else {
			console.log("Can't sand a blank message!");
		}

		// send attached file
		if (fileInputFiles.length > 0) {
			// only a single file at a time is allowed
			const file = fileInputFiles[0];
			// reset file input
			fileInputValue = '';
			fileInputFiles = [];

			// check if the file is an image
			const isImageRegex = /.*\.png|.*\.jpg|.*\.jpeg/g;
			const matches = attachedFile.name.match(isImageRegex);
			const isImage = matches !== null;

			await sendFile(currentChatId, user.id, attachedFile, isImage);
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
		<p>{currentChatId}</p>
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
						<strong>{chatData.membersIdsToNames.get(message.userId)}</strong>: {message.content}
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
			<label class="file-input">
				{#if fileInputFiles.length === 0}
					<UploadIcon />
					<p>Upload file</p>
				{:else}
					<CheckIcon />
					<p>{fileInputFiles[0].name}</p>
				{/if}
				<input
					type="file"
					id="file-input"
					bind:files={fileInputFiles}
					bind:value={fileInputValue}
				/>
			</label>
			<button type="submit">Send</button>
		</form>
	{/if}
{/if}

<style>
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
		gap: 10px;
	}

	.input-field textarea {
		min-height: 20px;
		border: 1px solid #ccc;
		border-radius: 6px;
		padding: 10px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
	}

	.file-input input[type='file'] {
		opacity: 0;
		position: absolute;
		z-index: -10;
	}

	.file-input p {
		margin: 0;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	.file-input {
		cursor: pointer;
		display: block;
		width: 20%;
		height: calc(100% - 4px); /* subtract border width */
		border-width: 2px;
		border-style: dashed;
		border-color: #709692;
		border-radius: 6px;
		color: #709692;
		font-weight: 600;
		font-size: small;
		display: flex;
		flex-direction: row;
		gap: 6px;
		padding: 0 6px;
		justify-content: center;
		align-items: center;
	}

	.file-input:hover {
		background-color: #eeeeee;
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
		height: 100%;
	}
</style>
