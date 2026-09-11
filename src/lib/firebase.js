import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyDZXKKJW08dBFKWhNkaprTqmtJIBbFw_Ko",
    authDomain: "swagat-samosa-ordering-website.firebaseapp.com",
    projectId: "swagat-samosa-ordering-website",
    storageBucket: "swagat-samosa-ordering-website.firebasestorage.app",
    messagingSenderId: "802489979437",
    appId: "1:802489979437:web:32eb45bb460bfbaaee5ea4",
};

const app = getApps().length === 0
    ? initializeApp(firebaseConfig)
    : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
