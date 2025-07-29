import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { getDatabase, ref, onValue, update, remove } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";

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
const auth = getAuth();
const db = getDatabase();

const username = document.getElementById("userName");
const bio = document.getElementById("bio");

onAuthStateChanged(auth, user => {
    username.innerHTML = user.email;
    //working on this
    bio.innerHTML = "work in progress";
});