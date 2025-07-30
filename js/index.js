import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-analytics.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

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

// Save new user to Realtime Database
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

// ----------------- EMAIL/PASSWORD LOGIN -----------------
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
        alert("Please verify your email before logging in 🔐");
        signOut(auth); // Kick them out if not verified
      }
    })
    .catch(error => {
      console.error("Login error:", error.code, error.message);
      alert("Login failed. Check your info ✉️");
    });
});

// ----------------- REGISTRATION -----------------
document.querySelector('.btn-outline-secondary').addEventListener('click', () => {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  createUserWithEmailAndPassword(auth, email, password)
  .then(userCred => {
    const user = userCred.user;
    console.log("✅ User created:", user.uid);
    addUsertoDatabase(user);

    // Send verification email
    return sendEmailVerification(user);
  })
  .then(() => {
    alert("Verification email sent ✅\nCheck your inbox before logging in.");
    return signOut(auth);
  })
  .catch(error => {
    console.error("❌ Registration error:", error.code, error.message);
    alert(`Signup failed ⚠️ ${error.code}: ${error.message}`);
  });

});

// ----------------- PASSWORD RESET -----------------
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
      console.error("Password reset error:", error.code, error.message);
      alert("Could not send reset link. Try again 🔁");
    });
});

// ----------------- RESEND VERIFICATION -----------------
function resendVerificationEmail() {
  const user = auth.currentUser;
  if (user && !user.emailVerified) {
    sendEmailVerification(user)
      .then(() => alert("Verification email resent 📩"))
      .catch(err => {
        console.error("Resend error:", err.code, err.message);
        alert("Could not resend email. Try again later.");
      });
  }
}

// ----------------- GOOGLE LOGIN -----------------
const googleLoginBtn = document.getElementById("googleLogin");
if (googleLoginBtn) {
  googleLoginBtn.addEventListener("click", async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user exists in DB, if not, add them
      addUsertoDatabase(user);

      alert("Welcome with Google 🌿");
      window.location.href = "inner_circle.html";
    } catch (error) {
      console.error("Google login error:", error.code, error.message);
      alert("Google login failed ⚠️ Try again later.");
    }
  });
}
