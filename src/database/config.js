import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDA7lxa6pLF_J0kUoWP5MeNhXC3sOvJBjg",
  authDomain: "chatroomtranslations.firebaseapp.com",
  projectId: "chatroomtranslations",
  storageBucket: "chatroomtranslations.appspot.com",
  messagingSenderId: "114827664028",
  appId: "1:114827664028:web:4e29592d82d0995222eb59"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);
export const storage = getStorage(app);
