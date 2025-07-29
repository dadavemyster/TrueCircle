import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const auth = getAuth();

const signOutButton = document.getElementById("signOut");

const postsButton = document.getElementById("posts");
const activityButton = document.getElementById("activity");
const friendButton = document.getElementById("friends");
const postsContainer = document.getElementById("postsContainer");
const activityContainer = document.getElementById("activityContainer");
const friendContainer = document.getElementById("friendContainer");

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