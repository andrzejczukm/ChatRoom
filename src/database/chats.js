import { db } from './config';
import { collection, addDoc, onSnapshot, query, where, Timestamp } from 'firebase/firestore';

const chatRoomsCollection = collection(db, 'chatRooms');

/**
 * @typedef ChatRoom
 * @property {string} id
 * @property {string} name
 * @property {string} lastMessage
 * @property {number} lastMessageTimestamp
 */

/**
 * Subscibe to changes in user's chats.
 *
 * @param {string} userUid
 * @param {function} onChatsCallback
 * @returns {function} an unsubscribe function
 */
export function subscribeUserChats(userUid, onChatsCallback) {
	const userChatsQuery = query(chatRoomsCollection, where('members', 'array-contains', userUid));
	const unsubscribe = onSnapshot(userChatsQuery, (snapshot) => {
		if (snapshot.empty) {
			onChatsCallback([]);
			return;
		}
		const chatsData = snapshot.docs.map((chatDoc) => ({
			id: chatDoc.id,
			name: chatDoc.get('name'),
			lastMessage: chatDoc.get('lastMessage'),
			lastMessageTimestamp: chatDoc.get('lastMessageTimestamp'),
		}));
		chatsData.sort((c1, c2) => c2.lastMessageTimestamp - c1.lastMessageTimestamp);
		onChatsCallback(chatsData);
	});
	return unsubscribe;
}

/**
 * Creates an empty chat room
 * @param {string} userUid
 * @param {string} chatName
 * @returns {Promise<string>} The ID of the newly created chat room
 */
export async function createChatRoom(userUid) {
	// Create empty chat room data
	const newChatDoc = await addDoc(chatRoomsCollection, {
		name: 'New chat room',
		lastMessage: '',
		lastMessageTimestamp: Timestamp.fromDate(new Date()),
		administrators: [userUid],
		members: [userUid],
	});
	const chatId = newChatDoc.id;
	// Return the new chat ID
	return chatId;
}
