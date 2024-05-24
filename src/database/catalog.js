import { db, storage } from './config';
import {
collection,
query,
where,
getDoc,
doc,
getDocs,
orderBy,
limit,
} from 'firebase/firestore';
import {ref, getDownloadURL, listAll } from 'firebase/storage';
const chatRoomsCollection = collection(db, 'chatRooms');


export async function getRandomFolder(chatId) {
    const chatMessagesCollection = collection(db, `chatsMessages/${chatId}/messages`)
    const q = query(
        chatMessagesCollection,
        where('type', '==', 'image'),
        orderBy('timestamp', 'desc'),
        limit(1)
    );

    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        console.log('No image messages found in the chat.');
        return null;
    } else {
        const latestImageMessage = querySnapshot.docs[0].data();
        const fileId = latestImageMessage.fileId
        return ref(storage, `${chatId}/${fileId}`)
    }
}


export async function listAllImages(chatId) {

    try {
        const chatStorageRef = ref(storage, chatId);
        const subdirs = await listAll(chatStorageRef);
        if (subdirs.prefixes.length === 0) {
            console.log('No images found');
            return null;
        }
        const imageUrls = [];

        for (const subdir of subdirs.prefixes) {
            const imageReference = await listAll(subdir)
            let title = imageReference.items[0].name
            var extension = title.split('.').pop();

            if (extension === "png" || extension === "jpg") {
                const url = await getDownloadURL(imageReference.items[0]);
                const urlTitleRefTuple = {imageUrl : url, imageTitle : title, imageRef : imageReference}
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
 * @param {ref} FolderRef needs to be the lowest-level directory, containing the image
 * @returns {URL} 
 */
export async function getImageUrlFromFolderRef(FolderRef) {
    try {
        const folderContents = await listAll(FolderRef);
        if (folderContents.items.length === 0) {
            console.log('No images found in the folder.');
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