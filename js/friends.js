import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { getDatabase, ref, onValue, update, remove, get } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";
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
const db = getDatabase(app);
const auth = getAuth(app);

const feed = document.getElementById("friendList");
onAuthStateChanged(auth, (user) => {
    const userUID = user.uid;

    onValue(ref(db, `users/${userUID}/friends`), snapshot => {
        feed.innerHTML = "";
        snapshot.forEach(child => {
            get(ref(db, `users/${child.key}`)).then(snapshot => {
                const div = document.createElement("div");
                div.className ="d-flex gap-4 p-3 px-5 col-12  flex-row align-items-center" 
                div.style="max-width: 600px;";
                div.innerHTML = 
                `
                <img id="bioImage" class="col-2 rounded-circle" src="${snapshot.child("bioImageURL").val()}" alt="profileImage" style="width:150px; height:150px;">
                <div class="col-10 text-muted lightdarkchange">
                <big id="userName">${snapshot.child("email").val()}</big>
                <br><br>
                <p id="bio" class="text-wrap" style="overflow-wrap: break-word">${snapshot.child("bioText").val()}</p>
                <button class="btn btn-sm btn-outline-secondary me-2 reject">❎</button>
                </div>
                `;
                
                feed.appendChild(div);
                div.querySelector(".reject").addEventListener("click", () => {
                    if (confirm(`Remove Friend ${snapshot.child("email").val()}`)) {
                        remove(ref(db, `users/${userUID}/friends/${child.key}`));
                        remove(ref(db, `users/${child.key}/friends/${userUID}`));
                    }
                });
            });
        });
    });
});

