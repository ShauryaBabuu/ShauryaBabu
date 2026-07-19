// ============================================================
// FIREBASE CONFIG — replace the values below with YOUR project's
// keys from Firebase Console > Project Settings > General >
// "Your apps" > SDK setup and configuration.
// See FIREBASE_SETUP.md for the full step-by-step guide.
// ============================================================
const firebaseConfig = {
  apiKey: "AIzaSyDlvD6tUQRZxMtqOHnldTyOU0Psb8ryw0w",
  authDomain: "shauryababu-fe9d2.firebaseapp.com",
  projectId: "shauryababu-fe9d2",
  storageBucket: "shauryababu-fe9d2.firebasestorage.app",
  messagingSenderId: "847245587997",
  appId: "1:847245587997:web:ff4bbc80ef35c46f3678f4"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// Email allowed to use the admin panel. Firestore security rules
// enforce this server-side too — this is just a client-side gate
// for a faster/friendlier error message.
const ADMIN_EMAIL = "babushaurya888@gmail.com";
