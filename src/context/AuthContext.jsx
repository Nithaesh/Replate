import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db, googleProvider } from '../firebase';
import { 
  onAuthStateChanged, signInWithPopup, signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, signOut, sendEmailVerification, 
  sendPasswordResetEmail 
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [dbUser, setDbUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. AUTH LISTENER (Handles Persistence Automatically)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setDbUser(null);
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  // 2. DB LISTENER (Syncs Profile & Policy Status)
  useEffect(() => {
    if (user) {
      const ref = doc(db, "users", user.uid);
      const unsub = onSnapshot(ref, (snapshot) => {
        if (snapshot.exists()) {
          setDbUser(snapshot.data());
        }
        setLoading(false);
      });
      return () => unsub();
    }
  }, [user]);

  // 3. CLEAN AUTH FUNCTIONS (No OTP)
  const loginWithGoogle = async () => {
    try {
      return await signInWithPopup(auth, googleProvider);
    } catch (error) { throw error; }
  };

  const signupWithEmail = (email, password) => createUserWithEmailAndPassword(auth, email, password);
  const loginWithEmail = (email, password) => signInWithEmailAndPassword(auth, email, password);
  const logout = () => signOut(auth);
  const resetPassword = (email) => sendPasswordResetEmail(auth, email);
  
  const sendVerification = () => {
    if (auth.currentUser) return sendEmailVerification(auth.currentUser);
  };

  const registerUserInDB = async (uid, data) => {
    await setDoc(doc(db, "users", uid), {
      ...data, 
      createdAt: serverTimestamp(), 
      karmaPoints: 0, 
      status: 'active',
      hasSeenPolicies: false // Default to false
    }, { merge: true });
  };
  const handleGoogleLogin = async () => {
    setLoading(true); setError('');
    try {
      const userResult = await loginWithGoogle();
      const userRef = doc(db, "users", userResult.uid);
      const snap = await getDoc(userRef);

      if (!snap.exists()) {
        await setDoc(userRef, {
          // Fix: Use 'User' if displayName is null
          name: userResult.displayName || "Valued Donor", 
          email: userResult.email,
          role: 'individual_donor',
          createdAt: serverTimestamp(),
          status: 'active',
          authProvider: 'google',
          hasSeenPolicies: false,
          donorDetails: { totalDonations: 0, totalMealsDonated: 0, donorBadge: 'Bronze' }
        });
      }
      // Redirect handled by useEffect
    } catch (err) { setError(err.message); setLoading(false); }
  };

  return (
    <AuthContext.Provider value={{ 
      user, dbUser, loading,
      loginWithGoogle, signupWithEmail, loginWithEmail, logout, 
      sendVerification, resetPassword, registerUserInDB 
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};