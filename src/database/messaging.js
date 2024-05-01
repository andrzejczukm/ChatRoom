import { db } from './config';
import { onSnapshot, collection } from 'firebase/firestore';

export function subscribeChatMessages(chatId, onMessagesCallback) {
	const chatMessagesCollection = collection(db, 'chatsMessages', chatId, 'messages');
	const unsubscribe = onSnapshot(chatMessagesCollection, (snapshot) => {
		if (snapshot.empty) {
			onMessagesCallback([]);
			return;
		}
		const messagesData = snapshot.docs.map((messageDoc) => ({
			id: messageDoc.id,
			userId: messageDoc.get('userId'),
			timestamp: messageDoc.get('timestamp'),
			type: messageDoc.get('type'),
			content: messageDoc.get('content'),
			fileId: messageDoc.get('fileId'),
		}));
		messagesData.sort((c1, c2) => c1.timestamp - c2.timestamp);
		onMessagesCallback(messagesData);
	});
	return unsubscribe;
}

export async function sendTextMessage(userId, messageContent) {
	// TODO: implement this
}
