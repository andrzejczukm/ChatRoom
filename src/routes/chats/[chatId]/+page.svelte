<script>
	import { page } from '$app/stores';

	$: chatId = $page.params.chatId;
</script>

<p>{chatId}</p>
