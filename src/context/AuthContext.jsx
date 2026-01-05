import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth, googleProvider, db } from '../firebase';
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [dbUser, setDbUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Listen for Auth Changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      if (currentUser) {
        setUser(currentUser);

        // CHECK DB: Does this user exist in Firestore?
        const userRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          // Normal Case: User exists, load data
          setDbUser(userDoc.data());
        } else {
          // ORPHAN CASE: User logged in (Auth) but DB data is missing (Deleted)
          // We must handle this so they don't get stuck!
          console.warn("User exists in Auth but missing in DB. Re-creating...");
          
          // Default to Donor role if we have to guess, or keep them "pending"
          // This auto-fixes the "Google Login Stuck" issue
          const restoredData = {
            uid: currentUser.uid,
            name: currentUser.displayName || 'Restored User',
            email: currentUser.email,
            role: 'donor', // Defaulting to donor for safety
            photoURL: currentUser.photoURL,
            createdAt: serverTimestamp(),
            status: 'active'
          };
          
          await setDoc(userRef, restoredData);
          setDbUser(restoredData);
        }
      } else {
        setUser(null);
        setDbUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // ... (Keep your existing signupWithEmail, loginWithEmail, etc.) ...
  const signupWithEmail = async (email, password) => {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(userCred.user);
    return userCred;
  };

  const loginWithEmail = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const loginWithGoogle = async () => {
    return signInWithPopup(auth, googleProvider);
  };

  const resendVerification = async () => {
    if (auth.currentUser) await sendEmailVerification(auth.currentUser);
  };

  const registerUserInDB = async (uid, data, role) => {
    const initialStatus = role === 'institutional_receiver' ? 'pending' : 'active';
    await setDoc(doc(db, "users", uid), {
      uid, role, email: data.email, 
      name: data.name || '', 
      phoneNumber: data.phoneNumber || '', 
      createdAt: serverTimestamp(), 
      status: initialStatus, 
      ...data
    });
  };

  const logout = () => {
    signOut(auth);
    setUser(null);
    setDbUser(null);
  };

  if (loading) return <div style={{height:'100vh', background:'#0a0a0a', color:'white', display:'flex', justifyContent:'center', alignItems:'center'}}>Loading RePlate...</div>;

  return (
    <AuthContext.Provider value={{ 
      user, dbUser, 
      loginWithGoogle, signupWithEmail, loginWithEmail, resendVerification,
      registerUserInDB, logout, loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);