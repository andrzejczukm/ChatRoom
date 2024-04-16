import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
	apiKey: 'AIzaSyDk9OAsBh9NaxL9BSWPbWy0TAL_4EcpU7o',
	authDomain: 'chatroomterraform0.firebaseapp.com',
	databaseURL: 'https://chatroomterraform0-default-rtdb.europe-west1.firebasedatabase.app',
	projectId: 'chatroomterraform0',
	storageBucket: 'chatroomterraform0.appspot.com',
	messagingSenderId: '129588117890',
	appId: '1:129588117890:web:c0c5bb26285d63540a8f9b',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);
export const storage = getStorage(app);
