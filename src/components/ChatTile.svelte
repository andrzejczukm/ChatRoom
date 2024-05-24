<script>
	export let chatId;
	export let chatName;
	export let lastMessage;
	export let lastMessageTimestamp;
	export let isSelected;

	$: isEmpty = lastMessage === '';
	$: lastMessageDate = lastMessageTimestamp.toDate();
</script>

<a href={`/chats/${chatId}`} class="chat-tile" class:selected={isSelected}>
	<h4>{chatName}</h4>
	<p>{isEmpty ? 'No messages yet' : lastMessage}</p>
</a>

<style>
	.chat-tile {
		display: block;
		text-decoration: none;
		color: black;
		background-color: white;
		padding: 16px;
		border: 1px solid transparent;
		border-radius: 4px;
	}

	.chat-tile.selected {
		border: 1px solid #709692;
		box-shadow:
			0 1px 3px 0 rgb(0 0 0 / 0.1),
			0 1px 2px -1px rgb(0 0 0 / 0.1);
	}

	p,
	h4 {
		margin: 0;
	}

	h4 {
		margin-bottom: 4px;
	}

	p {
		color: grey;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}
</style>
