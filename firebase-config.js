// ============================================================
// FIREBASE CONFIG — replace the values below with YOUR project's
// keys from Firebase Console > Project Settings > General >
// "Your apps" > SDK setup and configuration.
// See FIREBASE_SETUP.md for the full step-by-step guide.
// ============================================================
const firebaseConfig = {
  apiKey: "PASTE_YOUR_API_KEY_HERE",
  authDomain: "PASTE_YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "PASTE_YOUR_PROJECT_ID",
  storageBucket: "PASTE_YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "PASTE_YOUR_SENDER_ID",
  appId: "PASTE_YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// Email allowed to use the admin panel. Firestore security rules
// enforce this server-side too — this is just a client-side gate
// for a faster/friendlier error message.
const ADMIN_EMAIL = "babushaurya888@gmail.com";
