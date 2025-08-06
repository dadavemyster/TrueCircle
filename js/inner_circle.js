import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getDatabase, ref, onValue, update, remove, get } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { getStorage, ref as sRef, uploadBytes, getDownloadURL, listAll } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-storage.js";
import { shouldHidePost } from './filterLowScorePosts.js';

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
const storage = getStorage(app);
const feed = document.getElementById("feed");
const auth = getAuth(app);

const moodFilter = document.getElementById("moodFilter");
let currentMoodFilter = "";
if (moodFilter) {
  moodFilter.addEventListener("change", function () {
    currentMoodFilter = this.value;
    renderPosts();
  });
}

let allPosts = [];

onValue(ref(db, "posts"), snapshot => {
  allPosts = [];
  snapshot.forEach(child => {
    const post = child.val();
    post.key = child.key;
    allPosts.push(post);
  });
  renderPosts();
});

function renderPosts() {
  const user = auth.currentUser;
  const uid = user.uid;

  const posts = allPosts
    .filter(post => post.circle === "inner")
    .filter(post => !shouldHidePost(post))
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
          <button class="btn btn-sm btn-outline-primary me-2 add-reaction">🎨 Add Reaction</button>
          <button class="btn btn-sm btn-outline-info me-2 see-reactions">🖼️ See Reactions</button>
          <div class="reaction-canvas-container d-none mt-2">
            <canvas width="200" height="200" style="border:1px solid #ccc;"></canvas>
            <button class="btn btn-success btn-sm mt-2 submit-reaction">Submit</button>
          </div>
          <div class="reaction-gallery mt-2 d-none"></div>
          <button class="btn btn-sm btn-outline-secondary me-2 delete ${post.email}">🗑️</button>
          <small class="${scoreClass}">Score: ${scorePercent}%</small>
        </div>
        <small class="text-muted">🕓 ${postAge} by ${post.email}</small>
      </div>
    `;

    const canvasContainer = div.querySelector(".reaction-canvas-container");
    const canvas = canvasContainer.querySelector("canvas");
    const ctx = canvas.getContext("2d");

    let drawing = false;

    div.querySelector(".add-reaction").addEventListener("click", () => {
      canvasContainer.classList.toggle("d-none");
    });

    canvas.onmousedown = () => drawing = true;
    canvas.onmouseup = () => { drawing = false; ctx.beginPath(); };
    canvas.onmousemove = e => {
      if (!drawing) return;
      const rect = canvas.getBoundingClientRect();
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.strokeStyle = "#000";
      ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    };

    div.querySelector(".submit-reaction").addEventListener("click", async () => {
      const dataURL = canvas.toDataURL("image/png");
      const blob = await (await fetch(dataURL)).blob();
      const storageRef = sRef(storage, `reactions-images/${post.key}/${Date.now()}.png`);
      await uploadBytes(storageRef, blob);
      alert("Reaction uploaded!");
      canvasContainer.classList.add("d-none");
    });

    div.querySelector(".see-reactions").addEventListener("click", async () => {
      const gallery = div.querySelector(".reaction-gallery");
      gallery.classList.toggle("d-none");
      if (!gallery.classList.contains("d-none")) {
        gallery.innerHTML = "Loading...";
        const listRef = sRef(storage, `reactions-images/${post.key}/`);
        const result = await listAll(listRef);
        gallery.innerHTML = "";
        for (const file of result.items) {
          const url = await getDownloadURL(file);
          const img = document.createElement("img");
          img.src = url;
          img.style.width = "100px";
          img.style.marginRight = "5px";
          img.classList.add("rounded", "shadow-sm");
          gallery.appendChild(img);
        }
      }
    });

    const currentVote = post.votes?.[uid];
    if (currentVote === "up") div.querySelector(".upvote").classList.add("active");
    if (currentVote === "down") div.querySelector(".downvote").classList.add("active");

    div.querySelector(".upvote").addEventListener("click", () => vote(post.key, "up"));
    div.querySelector(".downvote").addEventListener("click", () => vote(post.key, "down"));

    div.querySelector(".delete").addEventListener("click", () => {
      if (confirm("Delete this post?")) {
        remove(ref(db, `posts/${post.key}`));
      }
    });

    feed.appendChild(div);

    if (user && user.email !== post.email) {
      const deleteButtons = document.getElementsByClassName(post.email);
      for (let i = 0; i < deleteButtons.length; i++) {
        deleteButtons[i].classList.add("d-none");
      }
    }
  });
}

function vote(postId, type) {
  const user = auth.currentUser;
  if (!user) return;
  const uid = user.uid;

  const postRef = ref(db, `posts/${postId}`);
  onValue(postRef, snapshot => {
    const post = snapshot.val();
    if (!post) return;

    let votes = post.votes || {};
    let up = post.upvotes || 0;
    let down = post.downvotes || 0;

    const prevVote = votes[uid];

    if (prevVote === type) {
      alert("You've already voted on this post.");
      return;
    }

    if (prevVote === "up") up--;
    if (prevVote === "down") down--;

    if (type === "up") up++;
    if (type === "down") down++;

    votes[uid] = type;
    const total = up + down;
    const score = total > 0 ? up / total : 0;

    update(postRef, {
      upvotes: up,
      downvotes: down,
      score: score,
      votes: votes
    });
  }, { onlyOnce: true });
}

function openComments() {
  document.getElementById('commentOverlay').classList.remove('d-none');
}
function closeComments() {
  document.getElementById('commentOverlay').classList.add('d-none');
}