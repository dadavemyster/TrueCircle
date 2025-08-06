import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-analytics.js";
import { getDatabase, ref, set, update } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  GoogleAuthProvider, 
  signInWithPopup,
  onAuthStateChanged
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

// Store inviterUID from URL if present
const urlParams = new URLSearchParams(window.location.search);
const inviterUID = urlParams.get('invite');
if (inviterUID) {
  localStorage.setItem("inviterUID", inviterUID);
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);
const db = getDatabase(app);

// Redirect if already logged in; also logs them
onAuthStateChanged(auth, (user) => {
  if (user && user.emailVerified) {
    const inviterUID = localStorage.getItem("inviterUID");
    if (inviterUID && inviterUID !== user.uid) {
      const dbRef = ref(db, `users/${inviterUID}/email`);
      get(dbRef).then(snapshot => {
        const inviterEmail = snapshot.val();
        if (inviterEmail) {
          // Add both users as friends
          update(ref(db, `users/${user.uid}/friends`), {
            [inviterUID]: true
          });
          update(ref(db, `users/${inviterUID}/friends`), {
            [user.uid]: true
          });
          alert(`You are now friends with ${inviterEmail}`);
        } else {
          alert("Inviter not found.");
        }
        localStorage.removeItem("inviterUID");
        window.location.href = "/TrueCircle/inner_circle.html";
      }).catch(error => {
        console.error("Error fetching inviter email:", error);
        alert("Error adding friend.");
        window.location.href = "/TrueCircle/inner_circle.html";
      });
    } else {
      window.location.href = "/TrueCircle/inner_circle.html";
    }
  } else {
    document.getElementById("appContent").style.display = "block";
  }
});



// User Database
function addUsertoDatabase(user) {
  set(ref(db, "users/" + user.uid), {
    bioImageURL: "img/smile.png",
    bioText: "Nothing Yet",
    dateCreated: Date.now(),
    friends: [],
    posts: [],
    postsUpvoted: [],
    postsDownvoted: [],
    email: user.email
  });
}

// Login with verification enforcement
document.querySelector('form').addEventListener('submit', e => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  signInWithEmailAndPassword(auth, email, password)
    .then(userCred => {
      const user = userCred.user;

      if (user.emailVerified) {
        const inviterUID = localStorage.getItem("inviterUID");
        if (inviterUID && inviterUID !== user.uid) {
          update(ref(db, `users/${user.uid}/friends`), {
            [inviterUID]: true
          });
          update(ref(db, `users/${inviterUID}/friends`), {
            [user.uid]: true
          });
          localStorage.removeItem("inviterUID");
        }

        alert("Welcome to the Circle!");
        window.location.href = "/TrueCircle/inner_circle.html";
      } else {
        if (confirm("Your email isn't verified yet. Would you like to resend the verification email?")) {
          sendEmailVerification(user)
            .then(() => {
              alert("Verification email sent! 📩 Check your inbox.");
            })
            .catch(error => {
              console.error("Verification resend error:", error.code, error.message);
              alert("Something went wrong while resending. Try again later. 🚧");
            });
        }

        signOut(auth);
      }
    })
    .catch(error => {
      console.error("Login error:", error.code, error.message);
      alert("Login failed. Check your info ✉️");
    });
});

// Register flow
document.querySelector('.btn-outline-secondary').addEventListener('click', () => {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  createUserWithEmailAndPassword(auth, email, password)
    .then(userCred => {
      const user = userCred.user;
      console.log("✅ User created:", user.uid);
      addUsertoDatabase(user);
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

// Password reset
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

// Login with Google
document.getElementById('googleLogin').addEventListener('click', () => {
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider)
    .then((result) => {
      const user = result.user;
      addUsertoDatabase(user);

      const inviterUID = localStorage.getItem("inviterUID");
      if (inviterUID && inviterUID !== user.uid) {
        update(ref(db, `users/${user.uid}/friends`), {
          [inviterUID]: true
        });
        update(ref(db, `users/${inviterUID}/friends`), {
          [user.uid]: true
        });
        localStorage.removeItem("inviterUID");
      }

      alert("Signed in with Google ✅");
      window.location.href = "/TrueCircle/inner_circle.html";
    })
    .catch((error) => {
      console.error("Google sign-in failed", error);
      alert("Google login failed ❌");
    });
});
