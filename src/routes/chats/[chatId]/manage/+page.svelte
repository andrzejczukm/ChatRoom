<script>
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { EditIcon, CheckIcon, XIcon } from 'svelte-feather-icons';
	import { getLoggedInUser } from '../../../../database/auth';
	import { getChatRoomData, removeChatMember, updateChatName } from '../../../../database/chats';
	import { addChatMember } from '../../../../database/chats';
	import Spinner from '../../../../components/shared/Spinner.svelte';
	import MemberListElement from '../../../../components/MemberListElement.svelte';
	import Dialog from '../../../../components/shared/dialogs/Dialog.svelte';
	import ConfirmationDialog from '../../../../components/shared/dialogs/ConfirmationDialog.svelte';

	$: currentChatId = $page.params.chatId;

	let user = null;
	let chatData = null;
	let isAdmin = false;

	let isEditingChatName = false;
	let chatNameInput = '';

	let isAddMemberDialogVisible = false;
	let addMemberEmailInput = '';
	let isAddMemberErrorVisible = false;
	let isAddMemberLoading = false;

	onMount(async () => {
		user = getLoggedInUser();
		// redirects are handled by +layout.svelte
		await refetchChatData();
	});

	async function refetchChatData() {
		chatData = null;
		chatData = await getChatRoomData(currentChatId);
		isAdmin = chatData.administrators.includes(user.id);
	}

	function startEditChatName() {
		// default input
		chatNameInput = chatData.name;
		isEditingChatName = true;
	}

	async function confirmEditChatName() {
		if (chatNameInput.trim() === '') {
			return;
		}
		chatData.name = chatNameInput;
		await updateChatName(currentChatId, chatNameInput);
		isEditingChatName = false;
	}

	function cancelEditChatName() {
		isEditingChatName = false;
	}

	function showAddMemberDialog() {
		addMemberEmailInput = '';
		isAddMemberDialogVisible = true;
	}

	function closeAddMemberDialog() {
		isAddMemberDialogVisible = false;
	}

	async function handleAddMember() {
		isAddMemberLoading = true;
		isAddMemberErrorVisible = false;
		const joinedChatId = await addChatMember(currentChatId, addMemberEmailInput);
		if (joinedChatId === null) {
			isAddMemberErrorVisible = true;
		} else {
			closeAddMemberDialog();
			await refetchChatData();
		}
		isAddMemberLoading = false;
	}

	async function handleLeaveChatRoom() {
		await removeChatMember(currentChatId, user.id, isAdmin);
		goto('/chats');
	}
</script>

{#if user !== null}
	{#if chatData === null}
		<div class="spinner-container">
			<Spinner />
		</div>
	{:else}
		<main>
			<h2>Chat details</h2>
			<section class="one-line-section">
				<p class="highlight">Chat name:</p>
				{#if isEditingChatName}
					<form on:submit|preventDefault={confirmEditChatName}>
						<input type="text" bind:value={chatNameInput} />
						<button class="icon-btn" type="submit">
							<CheckIcon />
						</button>
					</form>
					<button class="icon-btn" on:click={cancelEditChatName}>
						<XIcon />
					</button>
				{:else}
					<p>{chatData.name}</p>
					{#if isAdmin}
						<button class="icon-btn" on:click={startEditChatName}>
							<EditIcon />
						</button>
					{/if}
				{/if}
			</section>
			<section>
				<p class="highlight">Actions:</p>
				<p class="actions">
					<ConfirmationDialog
						text="Are you sure you want to leave this chat room?"
						onConfirm={handleLeaveChatRoom}
					>
						<button class="btn btn-secondary leave-btn">Leave chat room</button>
					</ConfirmationDialog>
					{#if isAdmin}
						<button class="btn btn-secondary" on:click={showAddMemberDialog}>Add member</button>
						<Dialog bind:visible={isAddMemberDialogVisible}>
							<div class="add-member-dialog">
								<header>
									<h2>Enter user's email</h2>
									<button class="icon-btn" on:click={closeAddMemberDialog}>
										<XIcon size="28" />
									</button>
								</header>
								{#if isAddMemberLoading}
									<div class="spinner-container">
										<Spinner />
									</div>
								{:else}
									<form class="add-member-form" on:submit={handleAddMember}>
										<input type="text" bind:value={addMemberEmailInput} />
										<button type="submit" class="btn btn-primary add-member-btn">Add</button>
									</form>
									{#if isAddMemberErrorVisible}
										<p class="error">There is no user with the specified email</p>
									{/if}
								{/if}
							</div>
						</Dialog>
					{/if}
				</p>
			</section>
			<section>
				<p class="highlight">Members:</p>
				<div class="chat-members-container">
					{#each chatData.members as memberId}
						<MemberListElement
							chatId={currentChatId}
							{memberId}
							memberName={chatData.membersIdsToNames.get(memberId)}
							isMemberAdmin={chatData.administrators.includes(memberId)}
							isUserAdmin={isAdmin}
							canBeRemoved={user.id !== memberId}
							canBeDemoted={chatData.administrators.length > 1}
							on:memberChanged={refetchChatData}
						/>
					{/each}
				</div>
			</section>
		</main>
	{/if}
{/if}

<style>
	p,
	h2 {
		margin: 0;
	}

	main {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.spinner-container {
		width: 100%;
		display: flex;
		justify-content: center;
		padding: 48px 0;
	}

	.one-line-section,
	form {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.actions {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 10px;
		padding: 8px 0 0 8px;
	}

	.actions button {
		font-size: medium;
	}

	.highlight {
		color: #709692;
		font-weight: bolder;
	}

	.chat-members-container {
		display: flex;
		flex-direction: column;
		gap: 6px;
		padding: 8px 0 0 8px;
	}

	h2 {
		margin: 0;
	}

	.add-member-btn {
		background-color: #709692;
		color: whitesmoke;
		border: none;
	}

	.add-member-dialog {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.add-member-dialog .error {
		color: red;
		margin: 0;
		font-size: small;
	}

	.add-member-dialog {
		width: 20em;
	}

	.add-member-dialog header {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: start;
	}

	.add-member-dialog header button {
		width: fit-content;
		margin: 0;
		padding: 0;
	}

	.add-member-dialog .spinner-container {
		padding: 6px 0;
	}

	.add-member-form {
		display: flex;
		flex-direction: row;
		gap: 6px;
		align-items: center;
		width: 100%;
	}

	.add-member-form .add-member-btn {
		width: 4em;
	}

	.add-member-form input[type='text'] {
		display: block;
		font-size: 1em;
		width: 100%;
		height: 100%;
		padding: 5px;
		border-radius: 4px;
		border: 1px solid black;
	}
</style>
