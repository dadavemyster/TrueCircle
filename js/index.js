import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-analytics.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAIJs2JgPihGJHijJ7gO7SecxoKb2LCgrg",
  authDomain: "true-circle-gui2.firebaseapp.com",
  projectId: "true-circle-gui2",
  databaseURL: "https://true-circle-gui2-default-rtdb.firebaseio.com",
  storageBucket: "true-circle-gui2.firebasestorage.app",
  messagingSenderId: "198661237874",
  appId: "1:198661237874:web:a1ef7e3556f3a08e6da6eb",
  measurementId: "G-LHNKWW2X12"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);
const db = getDatabase(app);

// User Database
function addUsertoDatabase(user) {
  set(ref(db, "users/" + user.uid), {
    bioImageURL: "img/cow.jpg",
    bioText: "Nothing Yet",
    dateCreated: Date.now(),
    friends: [],
    posts: [],
    postsUpvoted: [],
    postsDownvoted: [],
    email: user.email
  });
}

// Login with email verification check
document.querySelector('form').addEventListener('submit', e => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  signInWithEmailAndPassword(auth, email, password)
    .then(userCred => {
      const user = userCred.user;
      if (user.emailVerified) {
        alert("Welcome to the Circle 🌿");
        window.location.href = "inner_circle.html";
      } else {
        alert("Please verify your email before logging in 🔒");
        auth.signOut(); // Block access until verified
      }
    })
    .catch(error => {
      alert("Login failed. Check your info ✉️");
      console.error(error);
    });
});

// Register and send verification email
document.querySelector('.btn-outline-secondary').addEventListener('click', () => {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  createUserWithEmailAndPassword(auth, email, password)
    .then(userCred => {
      const user = userCred.user;
      addUsertoDatabase(user);
      user.sendEmailVerification()
        .then(() => {
          alert("Circle membership created 💫\nCheck your inbox to verify your email ✉️");
        });
      // 🚫 No redirect here — wait until they verify and login
    })
    .catch(error => {
      alert("Registration failed. Try again 🔁");
      console.error(error);
    });
});

// Reset password
document.getElementById('resetPasswordLink').addEventListener('click', () => {
  const email = document.getElementById('email').value.trim();
  if (!email) {
    alert("Please enter your email first ✉️");
    return;
  }

  sendPasswordResetEmail(auth, email)
    .then(() => {
      alert("Reset link sent! Check your inbox 💌");
    })
    .catch(error => {
      alert("Could not send reset link. Try again 🔁");
      console.error(error);
    });
});

// Optional: Resend verification email button handler
function resendVerificationEmail() {
  const user = auth.currentUser;
  if (user && !user.emailVerified) {
    user.sendEmailVerification()
      .then(() => alert("Verification email resent 📩"))
      .catch(err => console.error("Error resending email:", err));
  }
}
