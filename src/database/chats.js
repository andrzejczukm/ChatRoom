import { auth, db } from './config';
import {
	collection,
	doc,
	addDoc,
	setDoc,
	updateDoc,
	getDoc,
	getDocs,
	query,
	where,
	Timestamp,
	arrayUnion,
} from 'firebase/firestore';

const chatRoomsCollection = collection(db, 'chatRooms');

/**
 * @typedef ChatRoom
 * @property {string} id
 * @property {string} name
 * @property {string} lastMessage
 * @property {number} lastMessageTimestamp
 */

/**
 * @param {string} userUid
 * @returns {Promise<ChatRoom[]>}
 */
export async function getChatsForUser(userUid) {
	const userData = await getDoc(doc(db, `users/${userUid}`));
	if (!userData.exists()) {
		// the user does not belong to any chat
		return [];
	}
	const userChatsIds = userData.get('chatRooms');
	if (userChatsIds.length === 0) {
		return [];
	}

	let result = [];
	// split userChatsIds into chunks to be able to use it with queries
	// as they require arrays with up to 30 elements
	const chunkSize = 30;
	for (let i = 0; i < userChatsIds.length; i += chunkSize) {
		const userChatsIdsChunk = userChatsIds.slice(i, i + chunkSize);
		const newChatsDocs = await getDocs(
			query(chatRoomsCollection, where('__name__', 'in', userChatsIdsChunk))
		);
		const newChatsData = newChatsDocs.docs.map((chatDoc) => ({
			id: chatDoc.id,
			name: chatDoc.get('name'),
			lastMessage: chatDoc.get('lastMessage'),
			lastMessageTimestamp: chatDoc.get('lastMessageTimestamp'),
		}));
		result.push(...newChatsData);
	}
	result.sort((chat1, chat2) => chat1.lastMessageTimestamp - chat2.lastMessageTimestamp);
	return result;
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
	});
	const chatId = newChatDoc.id;
	// Add the creator as a member and administrator
	await setDoc(doc(db, `members/${chatId}`), {
		administrators: [userUid],
		members: [userUid],
	});
	// Add the chat to user's chats
	await updateDoc(doc(db, `users/${userUid}`), {
		chatRooms: arrayUnion(chatId),
	});
	// Return the new chat ID
	return chatId;
}
