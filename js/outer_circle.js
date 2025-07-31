import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getDatabase, ref, onValue, update, remove } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

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
const feed = document.getElementById("feed");
const moodFilter = document.getElementById("moodFilter");

let currentMoodFilter = "";
let allPosts = [];
let currentUser = null;

// Mood filter dropdown handler
if (moodFilter) {
  moodFilter.addEventListener("change", function () {
    currentMoodFilter = this.value;
    if (currentUser) renderPosts();
  });
}

// Track auth state and store current user
onAuthStateChanged(auth, user => {
  if (user) {
    currentUser = user;
    loadPosts(); // only load posts once user is confirmed
  }
});

function loadPosts() {
  onValue(ref(db, "posts"), snapshot => {
    allPosts = [];
    snapshot.forEach(child => {
      const post = child.val();
      post.key = child.key;
      allPosts.push(post);
    });
    renderPosts();
  });
}

function renderPosts() {
  const posts = allPosts
    .filter(post => post.circle === "outer")
    .filter(post => !currentMoodFilter || post.mood === currentMoodFilter)
    .sort((a, b) => (b.score || 0) - (a.score || 0));

  feed.innerHTML = "";

  posts.forEach(post => {
    const scorePercent = (post.score * 100).toFixed(1);
    const scoreClass = post.score >= 0.75 ? "score-high"
                     : post.score >= 0.5 ? "score-medium"
                     : "score-low";

    const now = Date.now();
    const postTime = post.timestamp || now;
    const ageMillis = now - postTime;
    const postAge = formatAge(ageMillis);

    const div = document.createElement("div");
    div.className = "card mb-3 p-3 shadow-sm";

    div.innerHTML = `
      <p class="mb-2">${post.content}</p>
      ${post.imageURL ? `<img class="post-image mb-2" src="${post.imageURL}" alt="Uploaded image">` : ""}
      ${post.mood ? `<p class="text-muted small">🧠 Mood: <strong>${post.mood}</strong></p>` : ""}
      <div class="d-flex align-items-center justify-content-between mb-1">
        <div>
          <button class="btn btn-sm btn-outline-success me-2 upvote">👍</button>
          <button class="btn btn-sm btn-outline-danger me-2 downvote">👎</button>
          <button class="btn btn-sm btn-outline-secondary me-2 delete ${post.email}">🗑️</button>
          <small class="${scoreClass}">Score: ${scorePercent}%</small>
        </div>
        <small class="text-muted">🕓 ${postAge}</small>
      </div>
    `;

    div.querySelector(".upvote").addEventListener("click", () => vote(post.key, "up", currentUser.email));
    div.querySelector(".downvote").addEventListener("click", () => vote(post.key, "down", currentUser.email));

    div.querySelector(".delete").addEventListener("click", () => {
      const confirmDelete = confirm("Delete this post?");
      if (confirmDelete) {
        const postRef = ref(db, `posts/${post.key}`);
        remove(postRef);
      }
    });

    feed.appendChild(div);

    if (currentUser && currentUser.email !== post.email) {
      let deleteButton = document.getElementsByClassName(post.email);
      for (let i = 0; i < deleteButton.length; i++) {
        deleteButton[i].classList.add("d-none");
      }
    }
  });
}

function vote(postId, type, email) {
  if (!email) return;

  const postRef = ref(db, `posts/${postId}`);
  onValue(postRef, snapshot => {
    const post = snapshot.val();
    if (!post) return;

    let votes = post.votes || {};
    let up = post.upvotes || 0;
    let down = post.downvotes || 0;
    const prevVote = votes[email];

    if (prevVote === type) return;

    if (prevVote === "up") up--;
    if (prevVote === "down") down--;

    if (type === "up") up++;
    if (type === "down") down++;

    votes[email] = type;

    const total = up + down;
    const newScore = total ? up / total : 0;

    update(postRef, {
      upvotes: up,
      downvotes: down,
      score: newScore,
      votes: votes
    });
  }, { onlyOnce: true });
}

function formatAge(ms) {
  const secs = Math.floor(ms / 1000);
  const mins = Math.floor(secs / 60);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (mins > 0) return `${mins} min${mins > 1 ? "s" : ""} ago`;
  return `Just now`;
}