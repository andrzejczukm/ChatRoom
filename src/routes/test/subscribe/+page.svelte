<script>
	import { onDestroy } from 'svelte';
	import { subscribeToMessages, sendTextMessage, clearMessages } from '../../../database/messaging';
	import GoBack from '../../../components/GoBack.svelte';

	let messages = [];
	let messageInput = '';
	let userName = 'user1';

	const unsubscribeFromMessages = subscribeToMessages((newMessages) => {
		messages = newMessages;
	});

	onDestroy(() => {
		unsubscribeFromMessages();
	});

	async function onMessageSend() {
		if (messageInput === '') {
			return;
		}
		await sendTextMessage(userName, messageInput);
		messageInput = '';
	}
</script>

<GoBack />
<div>
	<form on:submit|preventDefault={onMessageSend}>
		<div class="input-container">
			<span>Your name:</span>
			<input type="text" autocomplete="off" bind:value={userName} />
		</div>
		<div class="input-container">
			<input type="text" autocomplete="off" placeholder="message" bind:value={messageInput} />
			<button type="submit">Send</button>
		</div>
	</form>
	{#each messages as message (message.id)}
		<p>{message.userId}: {message.content}</p>
	{/each}
	<button on:click={clearMessages}>Clear messages</button>
</div>

<style>
	form {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.input-container {
		display: flex;
		flex-direction: row;
		gap: 4px;
		align-items: center;
	}
</style>
