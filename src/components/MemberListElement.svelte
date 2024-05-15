<script>
	import { demoteChatMember, promoteChatMember, removeChatMember } from '../database/chats';
	import ConfirmationDialog from './shared/dialogs/ConfirmationDialog.svelte';

	export let isUserAdmin;
	export let canBeDemoted;
	export let canBeRemoved;

	export let chatId;
	export let memberId;
	export let memberName;
	export let isMemberAdmin;

	async function handlePromote() {
		await promoteChatMember(chatId, memberId);
	}

	async function handleDemote() {
		await demoteChatMember(chatId, memberId);
	}

	async function handleRemoveMember() {
		await removeChatMember(chatId, memberId);
	}
</script>

<div class="container">
	<p class:admin={isMemberAdmin}>{memberName} {isMemberAdmin ? '(Admin)' : ''}</p>
	{#if isUserAdmin}
		{#if !isMemberAdmin || canBeDemoted}
			<ConfirmationDialog
				onConfirm={isMemberAdmin ? handleDemote : handlePromote}
				text={`Are you sure you want to ${isMemberAdmin ? 'demote' : 'promote'} ${memberName}?`}
			>
				<div class="member-action">
					{isMemberAdmin ? 'Demote' : 'Promote'}
				</div>
			</ConfirmationDialog>
		{/if}
		{#if canBeRemoved}
			<ConfirmationDialog
				onConfirm={handleRemoveMember}
				text={`Are you sure you want to remove ${memberName} from this chat?`}
			>
				<div class="member-action">Remove from chat</div>
			</ConfirmationDialog>
		{/if}
	{/if}
</div>

<style>
	.container {
		display: flex;
		flex-direction: row;
		gap: 12px;
		align-items: center;
	}

	.admin {
		font-weight: bold;
	}

	p {
		margin: 0;
	}

	.member-action {
		padding: 0;
		text-decoration: underline;
		background: none;
		border: none;
		cursor: pointer;
	}

	.member-action:hover {
		color: #709692;
	}
</style>
