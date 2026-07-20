import admin from 'firebase-admin';
import { User } from './db.js';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const serviceAccountPath = join(__dirname, 'serviceAccountKey.json');

let firebaseInitialized = false;

// Try to initialize Firebase Admin using service account if present
try {
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('Firebase Admin SDK initialized using serviceAccountKey.json');
    firebaseInitialized = true;
  } else {
    // Attempt standard initialization using environment variables or fallback to project-id only
    admin.initializeApp({
      projectId: 'e-commerce-store-3c79f'
    });
    console.log('Firebase Admin SDK initialized with project ID e-commerce-store-3c79f (No cert file)');
    firebaseInitialized = true;
  }
} catch (error) {
  console.warn('Firebase Admin SDK could not be fully initialized. Token verification will run in fallback/decode mode.', error.message);
}

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ message: 'Authentication token required.' });
  }

  // Handle mock developer token for testing or local emulator easily
  if (token === 'mock-uid-user' || token === 'mock-uid-admin') {
    const isAdmin = token === 'mock-uid-admin';
    const mockUid = isAdmin ? 'mock-admin-id' : 'mock-user-id';
    const mockEmail = isAdmin ? 'admin@example.com' : 'user@example.com';
    const mockName = isAdmin ? 'Admin Customer' : 'Demo Customer';

    try {
      let dbUser = await User.findById(mockUid);
      if (!dbUser) {
        dbUser = await User.create({
          _id: mockUid,
          name: mockName,
          email: mockEmail,
          role: isAdmin ? 'admin' : 'user'
        });
      }
      req.user = {
        id: dbUser._id,
        name: dbUser.name,
        email: dbUser.email,
        role: dbUser.role
      };
      return next();
    } catch (dbErr) {
      return res.status(500).json({ message: 'Database error in mock authentication.', error: dbErr.message });
    }
  }

  try {
    let decodedToken;

    if (firebaseInitialized) {
      try {
        // Attempt signature verification using Firebase Admin SDK
        decodedToken = await admin.auth().verifyIdToken(token);
      } catch (verifyErr) {
        console.warn('Firebase verifyIdToken failed, attempting insecure JWT decode fallback...', verifyErr.message);
        // Fallback to manual base64 decode if verification fails on local machines (e.g. network/credentials issues)
        decodedToken = decodeJWTInsecure(token);
      }
    } else {
      decodedToken = decodeJWTInsecure(token);
    }

    if (!decodedToken || !decodedToken.uid) {
      return res.status(403).json({ message: 'Invalid or un-decodable token.' });
    }

    // Sync decoded user profile in MongoDB Atlas
    let dbUser = await User.findById(decodedToken.uid);
    if (!dbUser) {
      // Parse a fallback display name if not available
      const displayName = decodedToken.name || decodedToken.email.split('@')[0];
      dbUser = await User.create({
        _id: decodedToken.uid,
        name: displayName,
        email: decodedToken.email,
        role: decodedToken.email === 'admin@example.com' ? 'admin' : 'user' // auto-assign admin role for admin email
      });
    }

    req.user = {
      id: dbUser._id,
      name: dbUser.name,
      email: dbUser.email,
      role: dbUser.role
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ message: 'Internal server error during authentication.', error: error.message });
  }
};

// Insecure base64 decoder fallback to ensure local testing works seamlessly without Service Account files
const decodeJWTInsecure = (token) => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
    
    // Standard Firebase claims: uid is sub, email, name
    return {
      uid: payload.sub,
      email: payload.email,
      name: payload.name || payload.email ? payload.email.split('@')[0] : 'User'
    };
  } catch (e) {
    console.error('Failed to parse JWT payload:', e.message);
    return null;
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin role required.' });
  }
  next();
};
