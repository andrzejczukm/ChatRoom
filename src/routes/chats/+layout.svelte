<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { XIcon } from 'svelte-feather-icons';
	import { onDestroy, onMount } from 'svelte';
	import { getLoggedInUser } from '../../database/auth';
	import {
		subscribeUserChats,
		createChatRoom,
		joinChatRoom,
		updateUsernameInChat,
	} from '../../database/chats';
	import ChatTile from '../../components/ChatTile.svelte';
	import Spinner from '../../components/shared/Spinner.svelte';
	import Dialog from '../../components/shared/dialogs/Dialog.svelte';

	let user = null;

	let chats = null;
	let createChatBtnDisabled = true;
	// undefined if no chat is clicked
	$: selectedChat = $page.params.chatId;

	let unsubscribeUserChats = () => {};

	let isJoinChatDialogVisible = false;
	let chatIdInput = '';
	let isJoinChatErrorVisible = false;
	let isJoinChatLoading = false;

	onMount(() => {
		user = getLoggedInUser();
		if (user === null) {
			// redirect a user if not logged in
			goto('/login');
		} else {
			createChatBtnDisabled = false;
			unsubscribeUserChats = subscribeUserChats(user.id, (newChatsData) => {
				chats = newChatsData;
			});
		}
	});

	onDestroy(() => {
		unsubscribeUserChats();
	});

	async function handleCreateChat() {
		createChatBtnDisabled = true;
		const newChatId = await createChatRoom(user.id);
		goto(`/chats/${newChatId}`);
		createChatBtnDisabled = false;
	}

	function showJoinChatDialog() {
		chatIdInput = '';
		isJoinChatDialogVisible = true;
	}

	function closeJoinChatDialog() {
		isJoinChatDialogVisible = false;
	}

	async function handleJoinChat() {
		isJoinChatLoading = true;
		isJoinChatErrorVisible = false;
		const joinedChatId = await joinChatRoom(chatIdInput, user.id);
		if (joinedChatId === null) {
			isJoinChatErrorVisible = true;
		} else {
			closeJoinChatDialog();
			goto(`/chats/${newChatId}`);
			await updateUsernameInChat(joinedChatId, user.id, user.displayName);
		}
		isJoinChatLoading = false;
	}
</script>

<svelte:head>
	<title>Chat Rooms</title>
</svelte:head>

{#if user !== null}
	<div class="chats-container">
		<aside>
			<div class="actions">
				<button class="join-chatroom-btn" on:click={showJoinChatDialog}>Join chat</button>
				<Dialog bind:visible={isJoinChatDialogVisible}>
					<div class="join-chatroom-dialog">
						<header>
							<h2>Enter chat ID</h2>
							<button class="icon-btn" on:click={closeJoinChatDialog}><XIcon size="28" /></button>
						</header>
						{#if isJoinChatLoading}
							<div class="spinner-container">
								<Spinner />
							</div>
						{:else}
							<form class="join-chatroom-form" on:submit={handleJoinChat}>
								<input type="text" bind:value={chatIdInput} />
								<button type="submit" class="join-chatroom-btn">Join</button>
							</form>
							{#if isJoinChatErrorVisible}
								<p class="error">There is no chat room with specified ID</p>
							{/if}
						{/if}
					</div>
				</Dialog>
				<button
					on:click={handleCreateChat}
					disabled={createChatBtnDisabled}
					class="create-chatroom-btn"
				>
					New chat
				</button>
			</div>
			{#if chats !== null}
				{#if chats.length === 0}
					<p>No chats available</p>
				{:else}
					<div class="chat-list-container">
						{#each chats as chat}
							<ChatTile
								chatId={chat.id}
								chatName={chat.name}
								lastMessage={chat.lastMessage}
								lastMessageTimestamp={chat.lastMessageTimestamp}
								isSelected={chat.id === selectedChat}
							/>
						{/each}
					</div>
				{/if}
			{:else}
				<div class="chats-spinner-container">
					<Spinner />
				</div>
			{/if}
		</aside>
		<main>
			<slot />
		</main>
	</div>
{/if}

<style>
	h2 {
		margin: 0;
	}

	.spinner-container {
		width: 100%;
		display: flex;
		justify-content: center;
		padding: 48px 0;
	}

	.chats-container {
		display: grid;
		gap: 24px;
		grid-template-columns: repeat(12, minmax(0, 1fr));
		min-height: 100%;
		padding: 0 24px;
	}

	.chats-container aside {
		grid-column: span 3 / span 3;
		padding-top: 6px;
	}

	.chats-container main {
		grid-column: span 9 / span 9;
		padding-top: 6px;
	}

	.chat-list-container {
		display: flex;
		flex-direction: column;
		gap: 16px;
		margin-top: 16px;
		padding-right: 4px;
		height: calc(100vh - 80.875px - 6px - 34px - 16px - 59px);
	}

	main {
		height: calc(100vh - 80.875px - 6px - 59px);
	}

	.chat-list-container {
		overflow-y: scroll;
	}

	.actions {
		display: flex;
		flex-direction: row;
		gap: 8px;
	}

	.actions button {
		font-weight: bold;
		font-size: 1em;
		border-radius: 4px;
		padding: 6px;
		cursor: pointer;
		width: 100%;
	}

	.join-chatroom-btn {
		background-color: #709692;
		color: whitesmoke;
		border: none;
	}

	.create-chatroom-btn {
		background-color: white;
		color: #709692;
		border: 2px solid #709692;
	}

	.create-chatroom-btn:disabled {
		cursor: auto;
	}

	.join-chatroom-dialog {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.join-chatroom-dialog .error {
		color: red;
		margin: 0;
		font-size: small;
	}

	.join-chatroom-dialog {
		width: 20em;
	}

	.join-chatroom-dialog header {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: start;
	}

	.join-chatroom-dialog header button {
		width: fit-content;
		margin: 0;
		padding: 0;
	}

	.join-chatroom-dialog .spinner-container {
		padding: 6px 0;
	}

	.join-chatroom-form {
		display: flex;
		flex-direction: row;
		gap: 6px;
		align-items: center;
		width: 100%;
	}

	.join-chatroom-form .join-chatroom-btn {
		width: 4em;
	}

	.join-chatroom-form input[type='text'] {
		display: block;
		font-size: 1em;
		width: 100%;
		height: 100%;
		padding: 5px;
		border-radius: 4px;
		border: 1px solid black;
	}
</style>
