// Firebase Configuration (Replace with your actual config from Firebase Console)
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Google Sign-In
async function googleSignIn() {
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
        const result = await auth.signInWithPopup(provider);
        saveUserData(result.user);
    } catch (error) {
        console.error("Google Sign-In Error:", error);
    }
}

// Email/Password Sign-Up
async function emailSignUp(email, password) {
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        saveUserData(userCredential.user);
    } catch (error) {
        console.error("Email Sign-Up Error:", error);
    }
}

// Email/Password Sign-In
async function emailSignIn(email, password) {
    try {
        await auth.signInWithEmailAndPassword(email, password);
    } catch (error) {
        console.error("Email Sign-In Error:", error);
    }
}

// Save User Data to Firestore
async function saveUserData(user) {
    if (!user) return;
    const userRef = db.collection("users").doc(user.uid);
    await userRef.set({
        email: user.email,
        displayName: user.displayName || "Anonymous",
        lastLogin: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
}

// Sign Out
async function signOut() {
    await auth.signOut();
}

// Monitor Auth State
auth.onAuthStateChanged(user => {
    if (user) {
        console.log("User signed in:", user.email);
    } else {
        console.log("No user signed in");
    }
});
