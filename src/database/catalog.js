import { db, storage } from './config';
import { collection, query, where, getDoc, doc, getDocs, orderBy, limit } from 'firebase/firestore';
import { ref, getDownloadURL, listAll } from 'firebase/storage';

const chatRoomsCollection = collection(db, 'chatRooms');

/**
 * @typedef CatalogData
 * @property {string} imageUrl
 * @property {string} chatName
 * @property {string} chatId
 *
 * @param {string} userId
 * @returns {Promise<CatalogData[]>}
 */
export async function getCatalogsData(userId) {
	const userChatsQuery = query(chatRoomsCollection, where('members', 'array-contains', userId));
	const userChats = await getDocs(userChatsQuery);
	const urls = [];

	for (const chat of userChats.docs) {
		const folderRef = await getRandomFolder(chat.id);
		const chatName = await getChatName(chat.id);
		if (folderRef) {
			const url = await getImageUrlFromFolderRef(folderRef);
			if (url) {
				urls.push({ imageUrl: url, chatName: chatName, chatId: chat.id }); // Add URL to the temporary array
			}
		}
	}

	return urls;
}

export async function getRandomFolder(chatId) {
	const chatMessagesCollection = collection(db, `chatsMessages/${chatId}/messages`);
	const q = query(
		chatMessagesCollection,
		where('type', '==', 'image'),
		orderBy('timestamp', 'desc'),
		limit(1)
	);

	const querySnapshot = await getDocs(q);
	if (querySnapshot.empty) {
		return null;
	} else {
		const latestImageMessage = querySnapshot.docs[0].data();
		const fileId = latestImageMessage.fileId;
		return ref(storage, `${chatId}/${fileId}`);
	}
}

export async function listAllImages(chatId) {
	try {
		const chatStorageRef = ref(storage, chatId);
		const subdirs = await listAll(chatStorageRef);
		if (subdirs.prefixes.length === 0) {
			return null;
		}
		// fetch captions docs
		const captionsRef = collection(chatRoomsCollection, `${chatId}/captions`);
		const captionsDocs = await getDocs(query(captionsRef));
		const captionsMap = new Map();
		for (let captionDoc of captionsDocs.docs) {
			captionsMap.set(captionDoc.id, captionDoc.get('caption'));
		}

		// fetch images
		const imageUrls = [];

		for (const subdir of subdirs.prefixes) {
			const imageReference = await listAll(subdir);
			let title = imageReference.items[0].name;
			const extension = title.split('.').pop();

			if (extension === 'png' || extension === 'jpg') {
				const url = await getDownloadURL(imageReference.items[0]);
				const caption = captionsMap.get(subdir.name) ?? 'No caption generated';
				const urlTitleRefTuple = {
					imageUrl: url,
					imageTitle: title,
					imageRef: imageReference,
					caption,
				};
				imageUrls.push(urlTitleRefTuple);
			}
		}

		// Log the collected image URLs
		return imageUrls;
	} catch (error) {
		console.error('Error listing files:', error);
		throw error;
	}
}

/**
 * returns an url of a random image in the chat
 * @param {ref} folderRef needs to be the lowest-level directory, containing the image
 * @returns {Promise<string>}
 */
export async function getImageUrlFromFolderRef(folderRef) {
	try {
		const folderContents = await listAll(folderRef);
		if (folderContents.items.length === 0) {
			return null;
		}
		const imageRef = folderContents.items[0];
		const imageUrl = await getDownloadURL(imageRef);
		return imageUrl;
	} catch (error) {
		console.error('Error getting image from folder:', error);
		return null;
	}
}

export async function getChatName(chatId) {
	try {
		const chatRef = doc(chatRoomsCollection, chatId);
		const chatSnapshot = await getDoc(chatRef);

		if (chatSnapshot.exists) {
			const chatData = chatSnapshot.data();
			const chatName = chatData.name;
			return chatName;
		} else {
			console.log('Chat document does not exist');
			return null;
		}
	} catch (error) {
		console.error('Error getting chat name:', error);
		throw error;
	}
}

export async function downloadSelected() {
	const selectedCheckboxes = document.querySelectorAll('.image-checkbox:checked');
	for (const checkbox of selectedCheckboxes) {
		const imageUrl = checkbox.getAttribute('image-url');
		const imageTitle = checkbox.getAttribute('image-title');
		try {
			const url = await getDownloadURL(ref(storage, imageUrl));
			const xhr = new XMLHttpRequest();
			xhr.responseType = 'blob';
			xhr.onload = (event) => {
				const blob = xhr.response;
				saveBlob(blob, imageTitle);
			};
			xhr.onerror = (error) => {
				console.error('XHR request failed', error);
			};
			xhr.open('GET', url);
			xhr.send();
		} catch (error) {
			console.error('Error in download', error);
		}
	}
}

function saveBlob(blob, filename) {
	const blobUrl = window.URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = blobUrl;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	window.URL.revokeObjectURL(blobUrl);
}
