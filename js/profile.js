import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { getDatabase, ref, onValue, update, remove } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";
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

let currentUser = null; 
onAuthStateChanged(auth, (user) => { 
    currentUser = user;
});

const editProfileButton = document.getElementById("editProfile");
const editProfileBox = document.getElementById("editProfileBox");
const editProfileImage = document.getElementById("editProfileImage");
const inputImage = document.getElementById("inputImage");

const saveChangesButton = document.getElementById("saveChanges");
const discardChangesButton = document.getElementById("discardChanges");

const signOutButton = document.getElementById("signOut");

const bio = document.getElementById("bio");
const image = document.getElementById("bioImage");

const postsButton = document.getElementById("posts");
const activityButton = document.getElementById("activity");
const friendButton = document.getElementById("friends");
const postsContainer = document.getElementById("postsContainer");
const activityContainer = document.getElementById("activityContainer");
const friendContainer = document.getElementById("friendContainer");

editProfileButton.addEventListener("click", ()=>{
    editProfileBox.classList.remove("d-none");
    editProfileImage.src = image.src;
});

const form = document.querySelector("#editProfileBoxForm");

form.addEventListener("submit", async function(e) {
    e.preventDefault();
    const imageFile = inputImage.files[0];
    const user = auth.currentUser;

    const userBiography = document.getElementById("biography").value.trim();

    let imageURL = "";
      if (imageFile) {
        const imageRef = sRef(storage, "bio_images/" + Date.now() + "_" + imageFile.name);
        await uploadBytes(imageRef, imageFile);
        imageURL = await getDownloadURL(imageRef);
    }

    const userUID = user.uid;
    const userRef = ref(db, `users/${userUID}`);

    if (imageURL) {
        await update(userRef,{
            bioText: userBiography,
            bioImageURL: imageURL
        });
    } else {
        await update(userRef,{
            bioText: userBiography
        });
    }

    bio.innerHTML = userBiography;
    if (imageURL) {
        image.src = imageURL;
    }
    document.getElementById("editProfileImage").src = imageURL;

    editProfileBox.classList.add("d-none");
});

inputImage.addEventListener("change",(e)=>{
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        editProfileImage.src = e.target.result;
    }
    reader.readAsDataURL(file);
});

discardChangesButton.addEventListener("click", (e)=>{
    e.preventDefault();
    document.getElementById("biography").value = bio.innerHTML;
    editProfileBox.classList.add("d-none");
});

signOutButton.addEventListener("click", ()=>{
    signOut(auth);
});

postsButton.addEventListener("click", ()=> {
    postsContainer.classList.remove("d-none");
    activityContainer.classList.add("d-none");
    friendContainer.classList.add("d-none");
    postsButton.classList.replace("btn-secondary", "btn-success");
    activityButton.classList.replace("btn-success", "btn-secondary");
    friendButton.classList.replace("btn-success", "btn-secondary");
});

activityButton.addEventListener("click", ()=> {
    activityContainer.classList.remove("d-none");
    postsContainer.classList.add("d-none");
    friendContainer.classList.add("d-none");
    postsButton.classList.replace("btn-success", "btn-secondary");
    activityButton.classList.replace("btn-secondary", "btn-success");
    friendButton.classList.replace("btn-success", "btn-secondary");
});

friendButton.addEventListener("click", ()=> {
    activityContainer.classList.add("d-none");
    postsContainer.classList.add("d-none");
    friendContainer.classList.remove("d-none");
    postsButton.classList.replace("btn-success", "btn-secondary");
    activityButton.classList.replace("btn-success", "btn-secondary");
    friendButton.classList.replace("btn-secondary", "btn-success");
});