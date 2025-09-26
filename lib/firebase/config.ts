// Firebase configuration for the app
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import admin from "firebase-admin";

// Client-side Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyADPe8q-LjdPKWK78VmNQzjWF2SkZBg2wI",
  authDomain: "capogol-79914.firebaseapp.com",
  projectId: "capogol-79914",
  storageBucket: "capogol-79914.firebasestorage.app",
  messagingSenderId: "835290340507",
  appId: "1:835290340507:web:b623d6882a7459d2f87a3e",
  measurementId: "G-CPR7M3F3R0",
};

// Initialize Firebase for client-side
let app;
let db;

if (typeof window !== "undefined") {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
}

// Server-side Firebase Admin SDK
let adminDb: admin.firestore.Firestore;

if (typeof window === "undefined") {
  try {
    if (!admin.apps.length) {
      const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
        ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
        : {
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
          };

      console.log(
        "🔥 Initializing Firebase Admin with projectId:",
        process.env.FIREBASE_PROJECT_ID
      );

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID,
      });

      console.log("✅ Firebase Admin initialized successfully");
    }
    adminDb = admin.firestore();
    console.log("🗄️ Firestore database connected");
  } catch (error) {
    console.error("❌ Error initializing Firebase Admin:", error);
    adminDb = null as unknown as admin.firestore.Firestore;
  }
}

export { db, adminDb };
