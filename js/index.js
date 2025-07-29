import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyAIJs2JgPihGJHijJ7gO7SecxoKb2LCgrg",
  authDomain: "true-circle-gui2.firebaseapp.com",
  projectId: "true-circle-gui2",
  storageBucket: "true-circle-gui2.firebasestorage.app",
  messagingSenderId: "198661237874",
  appId: "1:198661237874:web:a1ef7e3556f3a08e6da6eb",
  measurementId: "G-LHNKWW2X12"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);

document.querySelector('form').addEventListener('submit', e => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  signInWithEmailAndPassword(auth, email, password)
    .then(userCred => {
      alert("Welcome to the Circle 🌿");
      window.location.href = "inner_circle.html";
    })
    .catch(error => {
      alert("Login failed. Check your info ✉️");
      console.error(error);
    });
});

document.querySelector('.btn-outline-secondary').addEventListener('click', () => {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  createUserWithEmailAndPassword(auth, email, password)
    .then(userCred => {
      alert("Circle membership created 💫");
      window.location.href = "inner_circle.html";
    })
    .catch(error => {
      alert("Registration failed. Try again 🔁");
      console.error(error);
    });
});

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
