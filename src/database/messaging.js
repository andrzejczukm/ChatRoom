import { database } from './config';
import { onValue, ref, set, child } from 'firebase/database';

const messagesRef = ref(database, 'test/messages');

export function subscribeToMessages(onMessagesCallback) {
	const unsubscribe = onValue(messagesRef, (snapshot) => {
		if (!snapshot.exists()) {
			onMessagesCallback([]);
			return;
		}
		const fetchedMessages = snapshot.val();
		const messagesObjects = Object.entries(fetchedMessages).map(([id, data]) => ({
			id,
			...data,
		}));
		onMessagesCallback(messagesObjects);
	});
	return unsubscribe;
}

export async function sendTextMessage(userId, messageContent) {
	const timestamp = Date.now().valueOf().toString();
	const messageId = timestamp;
	const newMessage = {
		userId: userId,
		timestamp: messageId,
		content: messageContent,
		type: 'text',
	};
	const newMessageRef = child(messagesRef, messageId);
	await set(newMessageRef, newMessage);
}

export async function clearMessages() {
	await set(messagesRef, null);
}
