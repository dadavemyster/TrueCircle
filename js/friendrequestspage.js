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

const friendRequests = document.getElementById("friendRequests");
onAuthStateChanged(auth, (user) => {
    const userUID = user.uid;
    const userRef = ref(db, `users/${userUID}`);

    onValue(ref(db, "users"), snapshot => {
        friendRequests.innerHTML = "";
    
        snapshot.forEach(child => {
            if (child.child("friendRequests").hasChild(userUID)) {
                get(ref(db, `users/${child.key}`)).then(snapshot => {
                    const div = document.createElement("div");
                    div.className ="d-flex gap-4 p-3 px-5 col-12  flex-row align-items-center" 
                    div.style="max-width: 600px;";
                    div.innerHTML = 
                    `
                    <img id="bioImage" class="col-2 rounded-circle" src="${snapshot.child("bioImageURL").val()}" alt="profileImage" style="width:150px; height:150px;">
                    <div class="col-10 text-muted lightdarkchange">
                    <big id="userName">FROM ${snapshot.child("email").val()}</big>
                    <br><br>
                    <p id="bio" class="text-wrap" style="overflow-wrap: break-word">${snapshot.child("bioText").val()}</p>
                    <button class="btn btn-sm btn-outline-secondary me-2 accept">✅</button>
                    <button class="btn btn-sm btn-outline-secondary me-2 reject">❎</button>
                    </div>
                    `;
                    friendRequests.appendChild(div);
                    div.querySelector(".reject").addEventListener("click", () => {
                        remove(ref(db, `users/${child.key}/friendRequests/${userUID}`));
                    });
                    div.querySelector(".accept").addEventListener("click", () => {
                        remove(ref(db, `users/${child.key}/friendRequests/${userUID}`));
                        update(userRef, {
                            [`friends/${child.key}`] : true,
                        });
                        const childRef = ref(db, `users/${child.key}`);
                        update(childRef, {
                            [`friends/${userUID}`] : true,
                        });
                    });
                });
            }
        });

        get(ref(db, `users/${userUID}/friendRequests`)).then(snapshot => {
            snapshot.forEach(child =>{
                const childUID = child.key;

                get(ref(db, `users/${childUID}`)).then(childSnapshot =>{
                    const div = document.createElement("div");
                    div.className ="d-flex gap-4 p-3 px-5 col-12  flex-row align-items-center" 
                    div.style="max-width: 600px;";
                    div.innerHTML = 
                    `
                    <img id="bioImage" class="col-2 rounded-circle" src="${childSnapshot.child("bioImageURL").val()}" alt="profileImage" style="width:150px; height:150px;">
                    <div class="col-10 text-muted lightdarkchange">
                    <big id="userName">TO ${childSnapshot.child("email").val()}</big>
                    <br><br>
                    <p id="bio" class="text-wrap" style="overflow-wrap: break-word">${childSnapshot.child("bioText").val()}</p>
                    <button class="btn btn-sm btn-outline-secondary me-2 reject ${"post.email"}">❎</button>
                    </div>
                    `;
                    
                    friendRequests.appendChild(div);
                    div.querySelector(".reject").addEventListener("click", () => {
                        remove(ref(db, `users/${userUID}/friendRequests/${childUID}`));
                    });
                })
            });
        });
    });
});