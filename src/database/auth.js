import {
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	signOut,
	updateProfile,
} from 'firebase/auth';
import { auth, db } from './config';
import { setDoc, doc } from 'firebase/firestore';

/**
 * @typedef UserData
 * @property {string} id
 * @property {string} email
 * @property {string} displayName
 */

/**
 * Saves some of users data to the localStorage
 * @param {string} id
 * @param {string} email
 * @param {string} displayName
 */
function storeLoggedInUser(id, email, displayName) {
	const userData = { id, email, displayName };
	localStorage.setItem('user', JSON.stringify(userData));
}

function clearLoggedInUser() {
	localStorage.removeItem('user');
}

/**
 * Retrieves logged in user's data from the
 * @returns {UserData | null} Logged in user's data or null if no user is currently logged in
 */
export function getLoggedInUser() {
	const userDataString = localStorage.getItem('user');
	if (userDataString === null) {
		return null;
	}
	return JSON.parse(userDataString);
}

/**
 * @param {string} email
 * @returns user's display name formed from an email: e.g. "john.doe@email.com" -> "john doe"
 */
function getDefaultDisplayName(email) {
	return email.split('@')[0].replace('.', ' ');
}

/**
 * Registers user. If an error occurs, error.message will contain feedback
 * @param {string} email
 * @param {string} password
 */
export async function registerUser(email, password) {
	try {
		// this line will throw an error when user's creation fails
		const userCredential = await createUserWithEmailAndPassword(auth, email, password);
		const user = userCredential.user;

		// add user's UID to email-uid map
		await setDoc(doc(db, `userEmailToUid/${email}`), {
			uid: user.uid,
		});

		// store user's data in the local storage
		const defaultDisplayName = getDefaultDisplayName(email);
		storeLoggedInUser(user.uid, email, defaultDisplayName);

		// set default display name for the user
		updateProfile(user, { displayName: defaultDisplayName });
	} catch (err) {
		switch (err.code) {
			case 'auth/email-already-in-use':
				throw Error('This email is already in use');
			default:
				console.log(err.message);
				throw Error('An unknown error occured');
		}
	}
}

/**
 * Signs in user. If an error occurs, error.message will contain feedback
 * @param {string} email
 * @param {string} password
 */
export async function logInUser(email, password) {
	try {
		// this line will throw an error when sign-in fails
		const userCredential = await signInWithEmailAndPassword(auth, email, password);
		const user = userCredential.user;
		storeLoggedInUser(user.uid, email, user.displayName);
	} catch (err) {
		switch (err.code) {
			case 'auth/invalid-credential':
				throw Error('Invalid email or password');
			default:
				console.log(err.message);
				throw Error('An unknown error occured');
		}
	}
}

export async function logOutUser() {
	await signOut(auth);
	clearLoggedInUser();
}
