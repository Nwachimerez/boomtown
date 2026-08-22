/* =========================================================
   FIREBASE CONFIG
   Replace the values below with your own Firebase project's
   config (Project settings -> General -> Your apps -> SDK setup).
   ========================================================= */
const firebaseConfig = {
  apiKey: "AIzaSyDA-CXuwCmvnA4UpyeaDG8sKte1DCti04c",
  authDomain: "boomtown-restaurant-bc637.firebaseapp.com",
  projectId: "boomtown-restaurant-bc637",
  storageBucket: "boomtown-restaurant-bc637.firebasestorage.app",
  messagingSenderId: "619695009086",
  appId: "1:619695009086:web:179978d81a39f4f89b506f"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// Recommended for spotty mobile connections (matches Allwell/POS pattern)
db.enablePersistence({ synchronizeTabs: true }).catch((err) => {
  console.warn("Firestore persistence not enabled:", err.code);
});

// ---- Public settings ----
const PAYSTACK_PUBLIC_KEY = "pk_test_3f2beda2aa423810a34793e2c56b17917f7e17ab";

// ---- Cloudinary (dish photo uploads — no Firebase Blaze plan needed) ----
// Create a free account at cloudinary.com, then:
// 1. Copy your "Cloud name" from the dashboard into CLOUDINARY_CLOUD_NAME below.
// 2. Settings -> Upload -> Upload presets -> Add upload preset -> set
//    Signing Mode to "Unsigned" -> name it (e.g. "boomtown_menu") -> Save.
// 3. Put that preset name into CLOUDINARY_UPLOAD_PRESET below.
const CLOUDINARY_CLOUD_NAME = "wmsrjers";
const CLOUDINARY_UPLOAD_PRESET = "boomtown-menu";

// Brand/business info (name, colors, copy, contact, hours) lives in
// js/restaurant-config.js — that's the file to edit for a new client.
