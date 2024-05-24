import { db, storage } from './config';
import {
	onSnapshot,
	collection,
	addDoc,
	setDoc,
	updateDoc,
	Timestamp,
	query,
	orderBy,
	limitToLast,
	CollectionReference,
	doc,
} from 'firebase/firestore';
import { ref, listAll, getDownloadURL, uploadBytes } from 'firebase/storage';

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
 * Updates last message in the chat doc
 * @param {string} chatId
 * @param {string} userDisplayName
 * @param {string} messageContent
 * @param {Timestamp} messageTimestamp
 */
async function updateLastMessage(chatId, userDisplayName, messageContent, messageTimestamp) {
	const chatDoc = doc(db, 'chatRooms', chatId);
	await updateDoc(chatDoc, {
		lastMessage: `${userDisplayName}: ${messageContent}`,
		lastMessageTimestamp: messageTimestamp,
	});
}

/**
 * Creates a message
 * @param {string} chatId
 * @param {string} userId
 * @param {string} userDisplayName
 * @param {string} messageContent
 */
export async function sendTextMessage(chatId, userId, userDisplayName, messageContent) {
	const chatMessagesCollection = getMessagesCollection(chatId);
	const timestamp = Timestamp.fromDate(new Date());
	await addDoc(chatMessagesCollection, {
		userId: userId,
		timestamp,
		type: 'text',
		content: messageContent,
	});
	await updateLastMessage(chatId, userDisplayName, messageContent, timestamp);
}

/**
 * Common operations between sending image and file messages
 * @param {string} chatId
 * @param {string} fileId
 * @param {File} file
 */
async function uploadFile(chatId, fileId, file) {
	// upload file
	const fileRef = ref(storage, `${chatId}/${fileId}/${file.name}`);
	await uploadBytes(fileRef, file);
}

/**
 * Creates a message of file or image type
 * @param {string} chatId
 * @param {string} userId
 * @param {string} userDisplayName
 * @param {string} fileId
 * @param {File} file
 * @param {boolean} isImage
 */
export async function sendFile(chatId, userId, userDisplayName, fileId, file, isImage) {
	// upload file
	await uploadFile(chatId, fileId, file);
	// send message
	const chatMessagesCollection = getMessagesCollection(chatId);
	const timestamp = Timestamp.fromDate(new Date());
	await addDoc(chatMessagesCollection, {
		userId: userId,
		timestamp,
		type: isImage ? 'image' : 'file',
		fileId,
	});
	await updateLastMessage(chatId, userDisplayName, file.name, timestamp);
}

/**
 * Store a caption for an image
 * @param {string} chatId
 * @param {string} fileId
 * @param {string} caption
 */
export async function storeImageCaption(chatId, fileId, caption) {
	const chatCaptionsCollection = collection(db, 'chatRooms', chatId, 'captions');
	const imageCaptionDoc = doc(chatCaptionsCollection, fileId);
	await setDoc(imageCaptionDoc, { caption });
}
