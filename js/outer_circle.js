import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getDatabase, ref, onValue, update, remove, get, push, set } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { getStorage, ref as sRef, uploadBytes, getDownloadURL, listAll, deleteObject } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-storage.js";

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

let currentSort = "trending";
const moodFilter = document.getElementById("moodFilter");
let currentMoodFilter = "";

if (moodFilter) {
  moodFilter.addEventListener("change", function () {
    currentMoodFilter = this.value;
    renderPosts();
  });
}

const sortFilter = document.getElementById("sortFilter");
if (sortFilter) {
  sortFilter.addEventListener("change", () => {
    currentSort = sortFilter.value;
    renderPosts();
  });
}

let allPosts = [];

// ads; not legit ads, but fake ads with links
let allAds = [];
let nextAdIndex = 0;

onValue(ref(db, "ads"), snap => {
  allAds = [];
  snap.forEach(child => allAds.push({ id: child.key, ...child.val() }));
});

function createAdCard(ad) {
  const div = document.createElement("div");
  div.className = "card mb-3 p-3 shadow-sm border-warning";
  div.innerHTML = `
    <div class="d-flex justify-content-between align-items-center mb-2">
      <small class="text-muted">Sponsored</small>
      <img src="img/sun.png" alt="" style="opacity:.0;width:1px;height:1px" /> 
    </div>
    ${ad.imageURL ? `<a href="${ad.link || '#'}" target="_blank" rel="noopener noreferrer">
        <img class="img-fluid rounded mb-2" src="${ad.imageURL}" alt="Advertisement">
      </a>` : ""}
    ${ad.text ? `<p class="mb-0">${ad.text}</p>` : ""}
  `;
  return div;
}

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
  const uid = user?.uid;
  const userRef = ref(db, `users/${uid}`);

  const posts = allPosts
    .filter(post => post.circle === "outer")
    .filter(post => !post.flagged)
    .filter(post => !currentMoodFilter || post.mood === currentMoodFilter)
    .sort((a, b) => {
      if (currentSort === "top") return (b.upvotes || 0) - (a.upvotes || 0);
      else if (currentSort === "latest") return (b.timestamp || 0) - (a.timestamp || 0);
      else return (b.score || 0) - (a.score || 0);
    });

  feed.innerHTML = "";

  posts.forEach((post, i) => {
    const scorePercent = (post.score * 100).toFixed(1);
    const scoreClass = post.score >= 0.75 ? "score-high" : post.score >= 0.5 ? "score-medium" : "score-low";
    const now = Date.now();
    const postTime = post.timestamp || now;
    const ageMillis = now - postTime;

    function formatAge(ms) {
      const mins = Math.floor(ms / 60000);
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

      <div class="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-3">
        <div class="d-flex flex-wrap gap-2">
          <button class="btn btn-sm btn-outline-success upvote">👍 Upvote</button>
          <button class="btn btn-sm btn-outline-danger downvote">👎 Downvote</button>
          <button class="btn btn-sm btn-outline-warning flag-post">🚩 Flag</button>
          ${user?.email === post.email ? `<button class="btn btn-sm btn-outline-secondary delete-post">🗑️</button>` : ""}
        </div>
        <div class="d-flex flex-wrap gap-2">
          <button class="btn btn-sm btn-outline-primary add-reaction">🎨 Add Reaction</button>
          <button class="btn btn-sm btn-outline-info see-reactions">🖼️ See Reactions</button>
        </div>
      </div>

      <div class="reaction-canvas-container d-none mb-3">
        <canvas width="200" height="200" style="border:1px solid #ccc; touch-action: none;"></canvas><br/>
        <input type="color" class="form-control form-control-color mt-2 color-picker" value="#000000" />
        <div class="mt-2">
          <button class="btn btn-secondary btn-sm me-2 clear-canvas">Clear</button>
          <button class="btn btn-success btn-sm submit-reaction">Submit</button>
        </div>
      </div>

      <div class="reaction-gallery mt-2 d-none"></div>

      <div class="text-muted small mb-1">
        <span class="${scoreClass}">Score: ${scorePercent}%</span> • 
        <span>🕓 ${postAge} by ${post.email}</span>
      </div>
    `;

    const upvoteBtn = div.querySelector(".upvote");
    const downvoteBtn = div.querySelector(".downvote");
    const addReactionBtn = div.querySelector(".add-reaction");
    const seeReactionsBtn = div.querySelector(".see-reactions");

    if (post.votes?.[uid] === "up") upvoteBtn.classList.add("active");
    if (post.votes?.[uid] === "down") downvoteBtn.classList.add("active");

    upvoteBtn.addEventListener("click", () => vote(post.key, "up", upvoteBtn, downvoteBtn));
    downvoteBtn.addEventListener("click", () => vote(post.key, "down", upvoteBtn, downvoteBtn));

    // Add post to user database upvotedPosts
    div.querySelector(".upvote").addEventListener("click", () => {
        get(ref(db, `users/${uid}`)).then(userDataSnapshot => {
            if (userDataSnapshot.child("upvotedPosts").hasChild(post.key)) {
                const userPostRef = ref(db, `users/${uid}/upvotedPosts/${post.key}`);
                remove(userPostRef);
            } else if (userDataSnapshot.child("downvotedPosts").hasChild(post.key)) {
                const userPostRef = ref(db, `users/${uid}/downvotedPosts/${post.key}`);
                remove(userPostRef);
                update(userRef, {
                    [`upvotedPosts/${post.key}`] : true,
                });
            } else {
                update(userRef, {
                    [`upvotedPosts/${post.key}`] : true,
                });
            }
        });
    });

    // Add post to user database downvotedPosts
    div.querySelector(".downvote").addEventListener("click", () => {
        get(ref(db, `users/${uid}`)).then(userDataSnapshot => {
            if (userDataSnapshot.child("downvotedPosts").hasChild(post.key)) {
                const userPostRef = ref(db, `users/${uid}/downvotedPosts/${post.key}`);
                remove(userPostRef);
            } else if (userDataSnapshot.child("upvotedPosts").hasChild(post.key)) {
                const userPostRef = ref(db, `users/${uid}/upvotedPosts/${post.key}`);
                remove(userPostRef);
                update(userRef, {
                    [`downvotedPosts/${post.key}`] : true,
                });
            } else {
                update(userRef, {
                    [`downvotedPosts/${post.key}`] : true,
                });
            }
        });
    });

    const canvasContainer = div.querySelector(".reaction-canvas-container");
    const canvas = canvasContainer.querySelector("canvas");
    const ctx = canvas.getContext("2d");
    const colorPicker = canvasContainer.querySelector(".color-picker");
    const clearBtn = canvasContainer.querySelector(".clear-canvas");
    const submitBtn = canvasContainer.querySelector(".submit-reaction");

    let drawing = false;
    let currentColor = "#000000";

    colorPicker.addEventListener("input", e => currentColor = e.target.value);
    clearBtn.addEventListener("click", () => ctx.clearRect(0, 0, canvas.width, canvas.height));

    canvas.onmousedown = () => drawing = true;
    canvas.onmouseup = () => { drawing = false; ctx.beginPath(); };
    canvas.onmousemove = e => {
      if (!drawing) return;
      const rect = canvas.getBoundingClientRect();
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.strokeStyle = currentColor;
      ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    };

    canvas.addEventListener("touchstart", e => {
      e.preventDefault();
      drawing = true;
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      ctx.moveTo(touch.clientX - rect.left, touch.clientY - rect.top);
    }, { passive: false });

    canvas.addEventListener("touchmove", e => {
      if (!drawing) return;
      e.preventDefault();
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.strokeStyle = currentColor;
      ctx.lineTo(touch.clientX - rect.left, touch.clientY - rect.top);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(touch.clientX - rect.left, touch.clientY - rect.top);
    }, { passive: false });

    canvas.addEventListener("touchend", () => {
      drawing = false;
      ctx.beginPath();
    });

    addReactionBtn.addEventListener("click", () => {
      canvasContainer.classList.toggle("d-none");
    });

    submitBtn.addEventListener("click", async () => {
      const dataURL = canvas.toDataURL("image/png");
      const blob = await (await fetch(dataURL)).blob();
      const fileName = `${Date.now()}_${uid}.png`;
      const storageRef = sRef(storage, `reactions-images/${post.key}/${fileName}`);
      await uploadBytes(storageRef, blob);
      alert("Reaction uploaded!");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      canvasContainer.classList.add("d-none");
    });

    seeReactionsBtn.addEventListener("click", async () => {
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
          img.classList.add("rounded", "shadow-sm", "me-2", "mb-2");

          if (file.name.includes(uid)) {
            const delBtn = document.createElement("button");
            delBtn.className = "btn btn-sm btn-outline-danger ms-1";
            delBtn.textContent = "❌";
            delBtn.onclick = async () => {
              if (confirm("Delete your reaction?")) {
                await deleteObject(file);
                img.remove();
                delBtn.remove();
              }
            };
            gallery.appendChild(img);
            gallery.appendChild(delBtn);
          } else {
            gallery.appendChild(img);
          }
        }
      }
    });

    const deleteBtn = div.querySelector(".delete-post");
    if (deleteBtn) {
      deleteBtn.addEventListener("click", () => {
        if (confirm("Delete this post?")) {
          remove(ref(db, `posts/${post.key}`));
        }
      });
    }

    feed.appendChild(div);


    // Comments section
const commentsContainer = document.createElement("div");
commentsContainer.classList.add("comments-section", "mt-3", "d-none");

const commentsList = document.createElement("div");
commentsList.classList.add("comments-list", "mb-2");

const commentInput = document.createElement("input");
commentInput.type = "text";
commentInput.placeholder = "Write a comment...";
commentInput.classList.add("form-control", "mb-2");

const submitCommentBtn = document.createElement("button");
submitCommentBtn.textContent = "Post Comment";
submitCommentBtn.classList.add("btn", "btn-sm", "btn-primary");

// Load comments from Firebase
const commentsRef = ref(db, `posts/${post.key}/comments`);
onValue(commentsRef, snap => {
  commentsList.innerHTML = "";
  snap.forEach(child => {
    const c = child.val();
    const cDiv = document.createElement("div");
    cDiv.classList.add("mb-1");
    cDiv.innerHTML = `<strong>${c.author}:</strong> ${c.text}`;
    commentsList.appendChild(cDiv);
  });
});

submitCommentBtn.addEventListener("click", () => {
  const text = commentInput.value.trim();
  if (!text) return;
  const newCommentRef = push(commentsRef);
  set(newCommentRef, {
    text: text,
    author: user?.email || "Anonymous",
    timestamp: Date.now()
  });
  commentInput.value = "";
});

commentsContainer.appendChild(commentsList);
commentsContainer.appendChild(commentInput);
commentsContainer.appendChild(submitCommentBtn);

const toggleCommentsBtn = document.createElement("button");
toggleCommentsBtn.textContent = "💬 Comments";
toggleCommentsBtn.classList.add("btn", "btn-sm", "btn-outline-secondary", "mt-2");
toggleCommentsBtn.addEventListener("click", () => {
  commentsContainer.classList.toggle("d-none");
});

div.appendChild(toggleCommentsBtn);
div.appendChild(commentsContainer);

  if ((i + 1) % 10 === 0 && allAds.length > 0) {
    const ad = allAds[Math.floor(Math.random() * allAds.length)];
    feed.appendChild(createAdCard(ad));
  }

  });
}

function vote(postId, type, upvoteBtn, downvoteBtn) {
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
      alert("You've already voted.");
      return;
    }

    if (prevVote === "up") up--;
    if (prevVote === "down") down--;

    if (type === "up") up++;
    if (type === "down") down++;

    votes[uid] = type;
    const total = up + down;
    const score = total > 0 ? up / total : 0;

    update(postRef, { upvotes: up, downvotes: down, score, votes });

    if (upvoteBtn && downvoteBtn) {
      upvoteBtn.classList.toggle("active", type === "up");
      downvoteBtn.classList.toggle("active", type === "down");
    }
  }, { onlyOnce: true });
}