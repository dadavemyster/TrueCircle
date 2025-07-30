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
const auth = getAuth();
const db = getDatabase();
const storage = getStorage();

const form = document.querySelector("#addFriendForm");

form.addEventListener("submit", function(e) {
    e.preventDefault();

    const user = auth.currentUser;
    const userUID = user.uid;
    const userRef = ref(db, `users/${userUID}`);

    const friendAdding = document.getElementById("friendEmail").value.trim().toLowerCase();
    get(ref(db, "users")).then(snapshot => {
        snapshot.forEach(child => {
            const childData = child.val();

            const childUID = child.key;

            if (!childData.email) return;
            
            if (childData.email.toLowerCase() == friendAdding){
                update(userRef, {
                    [`friendRequests/${childUID}`] : true,
                });
            }
        });
    });
});

// check for matching friend requests and join friends
onValue(ref(db, "users"), snapshot => {
    const user = auth.currentUser;
    const userUID = user.uid;
    const userRef = ref(db, `users/${userUID}`);

    const userSnapshot = snapshot.child(userUID);

    snapshot.forEach(child => {
        const childData = child.val();
        const childUID = child.key;

        if (child.child("friendRequests").hasChild(userUID) && userSnapshot.child("friendRequests").hasChild(childUID)) {
            const childRef = ref(db, `users/${childUID}`);
            update(userRef, {
                [`friends/${childUID}`] : true,
            });
            remove(ref(db, `users/${childUID}/friendRequests/${childUID}`));
            update(childRef, {
                [`friends/${userUID}`] : true,
            });
            remove(ref(db, `users/${userUID}/friendRequests/${childUID}`));
        }
    });
});
