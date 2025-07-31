import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-analytics.js";
import { getDatabase, ref, push } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";
import { getStorage, ref as sRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-storage.js";

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
const analytics = getAnalytics(app);
const db = getDatabase(app);
const storage = getStorage(app);
const auth = getAuth(app);

const form = document.querySelector("form");

form.addEventListener("submit", async function(e) {
  e.preventDefault();

  const user = auth.currentUser;
  const content = document.getElementById("postContent").value.trim();
  const imageFile = document.getElementById("postImage").files[0];
  const circleType = document.getElementById("circleType").value;
  const mood = document.getElementById("postMood").value; // ← New: Mood

  if (!content) return alert("Let’s fill the circle with something first 🌱");

  let imageURL = "";
  if (imageFile) {
    const imageRef = sRef(storage, "post_images/" + Date.now() + "_" + imageFile.name);
    await uploadBytes(imageRef, imageFile);
    imageURL = await getDownloadURL(imageRef);
  }

  push(ref(db, "posts"), {
    content: content,
    imageURL: imageURL,
    timestamp: Date.now(),
    upvotes: 0,
    downvotes: 0,
    score: 0,
    email: user.email,
    circle: circleType,
    mood: mood // ← Store mood in Firebase
  });

  form.reset();
  alert("Your post is now part of the circle 💬");
});