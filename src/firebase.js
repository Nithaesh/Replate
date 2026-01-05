import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  RecaptchaVerifier, 
  signInWithPhoneNumber 
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAKQuObaeL7n0L5aUsinEY2PzM0NW_xIxQ",
  authDomain: "replate-91771.firebaseapp.com",
  projectId: "replate-91771",
  storageBucket: "replate-91771.firebasestorage.app",
  messagingSenderId: "989938876392",
  appId: "1:989938876392:web:dbc7653ecd17d144bd2e5d"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

// Export these for use in components/context
export { RecaptchaVerifier, signInWithPhoneNumber };