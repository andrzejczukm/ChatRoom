import { db, storage } from './config';
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
import { ref, listAll, getDownloadURL } from 'firebase/storage';

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
	const unsubscribe = onSnapshot(messagesQuery, async (snapshot) => {
		if (snapshot.empty) {
			onMessagesCallback([]);
			return;
		}
		const messagesData = await Promise.all(
			snapshot.docs.map(async (messageDoc) => {
				const fileId = messageDoc.get('fileId');
				let file = undefined;
				if (fileId !== undefined) {
					// TODO
					// napisz tu zeby sciagal z bazy dane o zdjeciach wlasnei name i url
					file = {
						name: 'filename',
						downloadUrl: 'https://picsum.photos/200/300',
					};
					const fileStorageRef = ref(storage, `${chatId}/${fileId}`);

					const fileList = await listAll(fileStorageRef);
					if (fileList.items.length > 0) {
						console.log(fileList);
						const fileRef = fileList.items[0];
						const downloadUrl = await getDownloadURL(fileRef);
						file = {
							name: fileRef.name,
							downloadUrl: downloadUrl,
						};
					}
				}

				return {
					id: messageDoc.id,
					userId: messageDoc.get('userId'),
					timestamp: messageDoc.get('timestamp'),
					type: messageDoc.get('type'),
					content: messageDoc.get('content'),
					file,
				};
			})
		);
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
