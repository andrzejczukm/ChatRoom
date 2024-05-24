<script>
	import { page } from '$app/stores';
	import { onDestroy, onMount } from 'svelte';
	import { UploadIcon, CheckIcon } from 'svelte-feather-icons';
	import { getLoggedInUser } from '../../../database/auth';
	import { updateUsernameInChat, getChatRoomData } from '../../../database/chats';
	import {
		subscribeChatMessages,
		sendTextMessage,
		sendFile,
		storeImageCaption,
	} from '../../../database/messaging';
	import Spinner from '../../../components/shared/Spinner.svelte';

	$: currentChatId = $page.params.chatId;

	// for captions
	/** @type {import('./$types').ActionData} */
	export let form;

	onMount(async () => {
		const fileId = form?.fileId ?? null;
		if (fileId === null) {
			return;
		}
		// store image caption
		const caption = form?.caption ?? 'No caption generated';
		await storeImageCaption(currentChatId, fileId, caption);
	});

	let user = null;
	let messageText = '';
	// fake file name - only used to reset the input
	let fileInputValue = '';
	let fileInputFiles = [];
	let attachedFileId = '';

	function getFileId(file) {
		const timestampNow = Date.now();
		const randomNumber = Math.floor(Math.random() * 99999);
		const fileId = `${currentChatId}_${timestampNow}_${randomNumber}`;
		return fileId;
	}

	async function sendMessage(e) {
		// prevent default if no image attached;
		if (fileInputFiles.length === 0) {
			e.preventDefault();
		}

		// send text message
		if (messageText.trim() !== '') {
			const messageTextCopy = `${messageText}`;
			messageText = '';
			await sendTextMessage(currentChatId, user.id, user.displayName, messageTextCopy);
		} else {
			console.log("Can't sand a blank message!");
		}

		// send attached file
		if (fileInputFiles.length === 0) {
			// only call default action if image attached
			e.preventDefault();
		} else {
			// only a single file at a time is allowed
			const attachedFile = fileInputFiles[0];
			attachedFileId = getFileId(attachedFile);
			// reset file input
			fileInputValue = '';
			fileInputFiles = [];

			// check if the file is an image
			const isImageRegex = /.*\.png|.*\.jpg|.*\.jpeg/g;
			const matches = attachedFile.name.match(isImageRegex);
			const isImage = matches !== null;

			// only call default action if image attached
			if (!isImage) {
				e.preventDefault();
			}

			await sendFile(
				currentChatId,
				user.id,
				user.displayName,
				attachedFileId,
				attachedFile,
				isImage
			);
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
		if (!isMoreMessagesLoading) {
			setTimeout(scrollToBottom, 500);
		}
		isMoreMessagesLoading = false;
	}

	function scrollToBottom() {
		const messagesContainer = document.querySelector('.messages-container');
		if (messagesContainer === null) {
			return;
		}
		messagesContainer.scrollTop = messagesContainer.scrollHeight;
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
						{#if message.type === 'image'}
							<a href={message.file.downloadUrl} download>
								<img src={message.file.downloadUrl} alt={message.file.name} />
							</a>
						{:else if message.type === 'file'}
							<a href={message.file.downloadUrl} download class="link">
								{message.file.name}
							</a>
						{:else}
							<span class="message-bubble">{message.content}</span>
						{/if}
					</p>
				</div>
			{/each}
		</div>
		<form
			method="POST"
			action="?/caption"
			enctype="multipart/form-data"
			class="input-field"
			on:submit={sendMessage}
		>
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
					name="file-input"
					bind:files={fileInputFiles}
					bind:value={fileInputValue}
				/>
				<input
					type="text"
					name="file-id-container"
					bind:value={attachedFileId}
					class="file-id-container"
				/>
			</label>
			<button type="submit">Send</button>
		</form>
	{/if}
{/if}

<style>
	.link {
		color: #709692;
	}
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
		padding: 5px 0px;
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
		padding-top: 5px;
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

	.file-input .file-id-container {
		display: none;
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
		background-color: rgb(235, 235, 235);
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
