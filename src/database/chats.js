import { db } from './config';
import {
	collection,
	addDoc,
	onSnapshot,
	query,
	where,
	Timestamp,
	getDoc,
	doc,
	updateDoc,
	setDoc,
	getDocs,
	arrayUnion,
	arrayRemove,
} from 'firebase/firestore';

const chatRoomsCollection = collection(db, 'chatRooms');

/**
 * @typedef ChatRoom
 * @property {string} id
 * @property {string} name
 * @property {string} lastMessage
 * @property {number} lastMessageTimestamp
 *
 * @typedef ChatRoomDetails
 * @property {string} id
 * @property {string} name
 * @property {string[]} members
 * @property {string[]} administrators
 * @property {Map<string, string>} membersIdsToNames
 */

/**
 * Obtain a map for a given chat, which maps members IDs to their usernames
 * @param {string} chatId
 * @returns {Promise<Map<string, string>>} membersIdsToNames
 */
export async function getChatMembersIdsToNamesMap(chatId) {
	const memberNamesQuery = query(collection(chatRoomsCollection, `${chatId}/memberNames`));
	const snapshot = await getDocs(memberNamesQuery);
	const result = new Map();
	for (let doc of snapshot.docs) {
		result.set(doc.id, doc.get('name'));
	}
	return result;
}

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

/**
 * Adds the user to the chat room
 * @param {string} chatId
 * @param {string} userEmail
 * @returns {Promise<string | null>} The ID of the user, or null if
 * there is no user with specified email
 */
export async function addChatMember(chatId, userEmail) {
	try {
		const userEmailToIdDoc = await getDoc(doc(db, `userEmailToUid/${userEmail}`));
		const userId = userEmailToIdDoc.get('uid');

		// before the new member views the chat, his displayName in chat will be his email
		await updateUsernameInChat(chatId, userId, userEmail);
		// add user
		await updateDoc(doc(chatRoomsCollection, chatId), {
			members: arrayUnion(userId),
		});

		return userId;
	} catch (e) {
		return null;
	}
}

/**
 * Refresh user's name within the chat
 * @param {string} chatId
 * @param {string} userId
 * @param {string} userName
 */
export async function updateUsernameInChat(chatId, userId, userName) {
	await setDoc(doc(chatRoomsCollection, `${chatId}/memberNames/${userId}`), {
		name: userName,
	});
}

/**
 * Creates an empty chat room
 * @param {string} chatId
 * @returns {Promise<ChatRoomDetails>} Chat room data
 */
export async function getChatRoomData(chatId) {
	const chatDoc = await getDoc(doc(chatRoomsCollection, chatId));
	return {
		id: chatDoc.id,
		name: chatDoc.get('name'),
		lastMessage: chatDoc.get('lastMessage'),
		lastMessageTimestamp: chatDoc.get('lastMessageTimestamp'),
		administrators: chatDoc.get('administrators'),
		members: chatDoc.get('members'),
		membersIdsToNames: await getChatMembersIdsToNamesMap(chatId),
	};
}

/**
 * @param {string} chatId
 * @param {string} newChatName
 */
export async function updateChatName(chatId, newChatName) {
	await updateDoc(doc(chatRoomsCollection, chatId), {
		name: newChatName,
	});
}

/**
 * @param {string} chatId
 * @param {string} memberId
 */
export async function promoteChatMember(chatId, memberId) {
	await updateDoc(doc(chatRoomsCollection, chatId), {
		administrators: arrayUnion(memberId),
	});
}

/**
 * @param {string} chatId
 * @param {string} memberId
 */
export async function demoteChatMember(chatId, memberId) {
	await updateDoc(doc(chatRoomsCollection, chatId), {
		administrators: arrayRemove(memberId),
	});
}

/**
 * @param {string} chatId
 * @param {string} memberId
 * @param {boolean} isUserAdmin
 */
export async function removeChatMember(chatId, memberId, isUserAdmin = true) {
	if (isUserAdmin) {
		await updateDoc(doc(chatRoomsCollection, chatId), {
			administrators: arrayRemove(memberId),
			members: arrayRemove(memberId),
		});
	} else {
		await updateDoc(doc(chatRoomsCollection, chatId), {
			members: arrayRemove(memberId),
		});
	}
}
