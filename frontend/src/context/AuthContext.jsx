import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth } from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';

const AuthContext = createContext(null);

export const API_URL = 'https://simple-ecommerce-back-api-mdmonirhossion2002-8639s-projects.vercel.app/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  const googleProvider = new GoogleAuthProvider();

  // Monitor Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken(true);
          localStorage.setItem('token', idToken);
          setToken(idToken);

          // Retrieve role and details from custom MongoDB backend
          const res = await fetch(`${API_URL}/auth/me`, {
            headers: {
              Authorization: `Bearer ${idToken}`
            }
          });

          if (res.ok) {
            const dbUser = await res.json();
            setUser(dbUser);
          } else {
            // Backend couldn't sync, fallback to local details
            setUser({
              id: firebaseUser.uid,
              name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
              email: firebaseUser.email,
              role: firebaseUser.email === 'admin@example.com' ? 'admin' : 'user'
            });
          }
        } catch (err) {
          console.error('Error synchronizing user session with MongoDB:', err);
          if (firebaseUser) {
            setUser({
              id: firebaseUser.uid,
              name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
              email: firebaseUser.email,
              role: firebaseUser.email === 'admin@example.com' ? 'admin' : 'user'
            });
          }
        }
      } else {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();
      localStorage.setItem('token', idToken);
      setToken(idToken);
      return userCredential.user;
    } catch (err) {
      console.error('Login error:', err);
      // Map common errors or return Firebase default message for debugging
      let message = err.message;
      if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        message = 'Invalid email or password.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Please enter a valid email address.';
      }
      throw new Error(message);
    }
  };

  const register = async (name, email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Update displayName in Firebase Auth Profile
      await updateProfile(userCredential.user, { displayName: name });

      const idToken = await userCredential.user.getIdToken(true);
      localStorage.setItem('token', idToken);
      setToken(idToken);

      // Perform initial profile sync request to Backend to insert user in MongoDB Atlas
      await fetch(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${idToken}`
        }
      });

      return userCredential.user;
    } catch (err) {
      console.error('Register error:', err);
      let message = err.message;
      if (err.code === 'auth/email-already-in-use') {
        message = 'An account with this email address already exists.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Please enter a valid email address.';
      } else if (err.code === 'auth/weak-password') {
        message = 'Password must be at least 6 characters long.';
      }
      throw new Error(message);
    }
  };

  const loginWithGoogle = async () => {
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const idToken = await userCredential.user.getIdToken(true);
      localStorage.setItem('token', idToken);
      setToken(idToken);

      // Sync user profile in MongoDB Atlas
      await fetch(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${idToken}`
        }
      });

      return userCredential.user;
    } catch (err) {
      console.error('Google Sign-In error:', err);
      throw new Error(err.message || 'Google Sign-In failed.');
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
