import { db } from './config';
import {
	onSnapshot,
	collection,
	addDoc,
	Timestamp,
	query,
	orderBy,
	limitToLast,
	CollectionReference,
} from 'firebase/firestore';

/**
 * Get a reference to messages collection for a given chat
 * @param {string} chatId
 * @returns {CollectionReference}
 */
function getMessagesCollection(chatId) {
	return collection(db, 'chatsMessages', chatId, 'messages');
}

/**
 * Listen to updates on messages
 * @param {string} chatId
 * @param {string} messageCount the numer of most recent messages to fetch at once (used for pagination)
 * @param {function} onMessagesCallback
 * @returns
 */
export function subscribeChatMessages(chatId, messageCount, onMessagesCallback) {
	const chatMessagesCollection = getMessagesCollection(chatId);
	// fetch the last messagesCount messages
	const messagesQuery = query(
		chatMessagesCollection,
		orderBy('timestamp'),
		limitToLast(messageCount)
	);
	// listen to messages
	const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
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
		onMessagesCallback(messagesData);
	});
	return unsubscribe;
}

/**
 * Creates a message
 * @param {string} chatId
 * @param {string} userId
 * @param {string} messageContent
 */
export async function sendTextMessage(chatId, userId, messageContent) {
	const chatMessagesCollection = getMessagesCollection(chatId);
	await addDoc(chatMessagesCollection, {
		userId: userId,
		timestamp: Timestamp.fromDate(new Date()),
		type: 'text',
		content: messageContent,
	});

}
