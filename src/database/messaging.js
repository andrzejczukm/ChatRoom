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
import { uploadBytes, ref } from 'firebase/storage';

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
 * @param {string} fileId
 * @param {File} file
 * @param {boolean} isImage
 */
export async function sendFile(chatId, userId, fileId, file, isImage) {
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
