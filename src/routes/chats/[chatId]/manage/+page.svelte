<script>
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { EditIcon, CheckIcon, XIcon } from 'svelte-feather-icons';
	import { getLoggedInUser } from '../../../../database/auth';
	import { getChatRoomData, updateChatName } from '../../../../database/chats';
	import Spinner from '../../../../components/shared/Spinner.svelte';
	import MemberListElement from '../../../../components/MemberListElement.svelte';

	$: currentChatId = $page.params.chatId;

	let user = null;
	let chatData = null;
	let isAdmin = false;

	let isEditingChatName = false;
	let chatNameInput = '';

	onMount(async () => {
		user = getLoggedInUser();
		// redirects are handled by +layout.svelte
		chatData = await getChatRoomData(currentChatId);
		isAdmin = chatData.administrators.includes(user.id);
	});

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
					<input type="text" bind:value={chatNameInput} />
					<button class="icon-btn" on:click={confirmEditChatName}>
						<CheckIcon />
					</button>
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
			<section class="one-line-section">
				<p class="highlight">Chat ID:</p>
				<p>{currentChatId}</p>
			</section>
			<section>
				<p class="highlight">Actions:</p>
				<p class="actions">
					<button class="btn btn-secondary">Leave chat room</button>
					{#if isAdmin}
						<button class="btn btn-primary">Delete chat room</button>
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

	.one-line-section {
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
</style>
