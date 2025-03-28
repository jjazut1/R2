// Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

// Fetch Firebase configuration from the server
fetch('/api/firebase-config')
  .then(response => response.json())
  .then(config => {
    const app = initializeApp(config);
    const auth = getAuth();
    const db = getFirestore();

    // Google Sign-In Function
    document.getElementById("google-login").addEventListener("click", async () => {
      const provider = new GoogleAuthProvider();
      try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        await saveUserData(user);
        alert(`Welcome, ${user.displayName}!`);
      } catch (error) {
        console.error(error.message);
      }
    });

    // Email Sign-Up Function
    document.getElementById("email-signup").addEventListener("click", async () => {
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await saveUserData(user);
        alert(`Account created for ${user.email}`);
      } catch (error) {
        console.error(error.message);
      }
    });

    // Email Sign-In Function
    document.getElementById("email-login").addEventListener("click", async () => {
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        alert(`Welcome back, ${user.email}!`);
      } catch (error) {
        console.error(error.message);
      }
    });

    // Logout Function
    document.getElementById("logout").addEventListener("click", async () => {
      try {
        await signOut(auth);
        alert("You have been logged out.");
      } catch (error) {
        console.error(error.message);
      }
    });

    // Check if user is admin (for simplicity, assume admin email is hardcoded)
    const adminEmail = "admin@example.com";

    // Show admin dashboard if logged in as admin
    auth.onAuthStateChanged(user => {
      if (user && user.email === adminEmail) {
        document.getElementById('admin-dashboard').style.display = 'block';
        loadPendingUsers();
      }
    });

    // Load pending users
    async function loadPendingUsers() {
      const usersRef = db.collection('users');
      const snapshot = await usersRef.where('status', '==', 'pending').get();
      const pendingUsersList = document.getElementById('pending-users');
      pendingUsersList.innerHTML = '';
      snapshot.forEach(doc => {
        const user = doc.data();
        const li = document.createElement('li');
        li.textContent = `${user.email} - ${user.name}`;
        const approveButton = document.createElement('button');
        approveButton.textContent = 'Approve';
        approveButton.onclick = () => updateUserStatus(doc.id, 'approved');
        const disapproveButton = document.createElement('button');
        disapproveButton.textContent = 'Disapprove';
        disapproveButton.onclick = () => updateUserStatus(doc.id, 'disapproved');
        li.appendChild(approveButton);
        li.appendChild(disapproveButton);
        pendingUsersList.appendChild(li);
      });
    }

    // Update user status
    async function updateUserStatus(userId, status) {
      const userRef = db.collection('users').doc(userId);
      await userRef.update({ status });
      loadPendingUsers();
    }

    // Modify saveUserData to include status
    async function saveUserData(user) {
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        await setDoc(userRef, {
          email: user.email,
          name: user.displayName || "No Name",
          createdAt: new Date(),
          status: 'pending' // Set initial status to pending
        });
      }
    }
  })
  .catch(error => {
    console.error('Error fetching Firebase configuration:', error);
  });