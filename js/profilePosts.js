import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getDatabase, ref, onValue, update, remove, get } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";
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
const feed = document.getElementById("yourPosts");
const auth = getAuth(app);

onValue(ref(db, "posts"), snapshot => {
  const posts = [];
  snapshot.forEach(child => {
    const post = child.val();
    post.key = child.key;
    posts.push(post);
  });

    const user = auth.currentUser;
    const userUID = user.uid;
    const userRef = ref(db, `users/${userUID}`);

  posts.sort((a, b) => (b.score || 0) - (a.score || 0));
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
      <div class="d-flex align-items-center justify-content-between mb-1">
        <div>
          <button class="btn btn-sm btn-outline-success me-2 upvote">👍</button>
          <button class="btn btn-sm btn-outline-danger me-2 downvote">👎</button>
          <button class="btn btn-sm btn-outline-secondary me-2 delete">🗑️</button>
          <small class="${scoreClass}">Score: ${scorePercent}%</small>
        </div>
        <small class="text-muted">🕓 ${postAge} by ${post.email}</small>
      </div>
      <hr>
      <div class="d-flex align-items-center justify-content-between mb-1">
      <small>Total 👍 Upvotes: </small><small>${post.upvotes}</small>
      </div>
      <hr>
      <div class="d-flex align-items-center justify-content-between mb-1">
      <small>Total 👎 Downvotes: </small><small>${post.downvotes}</small>
      </div>
      <hr>
      <div class="d-flex align-items-center justify-content-between mb-1">
      <small>Total 💬 Comments: </small><small>${"comment#"}</small>
      </div>
    `;

    get(ref(db, `users/${userUID}`)).then(userDataSnapshot => {
        if (userDataSnapshot.child("upvotedPosts").hasChild(post.key)) {
            div.querySelector(".upvote").classList.add("active");
        }
        if (userDataSnapshot.child("downvotedPosts").hasChild(post.key)) {
            div.querySelector(".downvote").classList.add("active");
        }
    });

    div.querySelector(".upvote").addEventListener("click", () => {
        get(ref(db, `users/${userUID}`)).then(userDataSnapshot => {
            if (userDataSnapshot.child("upvotedPosts").hasChild(post.key)) {
                const userPostRef = ref(db, `users/${userUID}/upvotedPosts/${post.key}`);
                remove(userPostRef);
                vote(post.key, "down");
            } else if (userDataSnapshot.child("downvotedPosts").hasChild(post.key)) {
                const userPostRef = ref(db, `users/${userUID}/downvotedPosts/${post.key}`);
                remove(userPostRef);
                update(userRef, {
                    [`upvotedPosts/${post.key}`] : true,
                });
                vote(post.key, "up");
            } else {
                update(userRef, {
                    [`upvotedPosts/${post.key}`] : true,
                });
                vote(post.key, "up");
            }
        });
    });

    div.querySelector(".downvote").addEventListener("click", () => {
        get(ref(db, `users/${userUID}`)).then(userDataSnapshot => {
            if (userDataSnapshot.child("downvotedPosts").hasChild(post.key)) {
                const userPostRef = ref(db, `users/${userUID}/downvotedPosts/${post.key}`);
                remove(userPostRef);
                vote(post.key, "up");
            } else if (userDataSnapshot.child("upvotedPosts").hasChild(post.key)) {
                const userPostRef = ref(db, `users/${userUID}/upvotedPosts/${post.key}`);
                remove(userPostRef);
                update(userRef, {
                    [`downvotedPosts/${post.key}`] : true,
                });
                vote(post.key, "down");
            } else {
                update(userRef, {
                    [`downvotedPosts/${post.key}`] : true,
                });
                vote(post.key, "down");
            }
        });
    });
    
    div.querySelector(".delete").addEventListener("click", () => {
      const confirmDelete = confirm("Delete this post?");
      if (confirmDelete) {
        const postRef = ref(db, `posts/${post.key}`);
        remove(postRef);
      }
    });
    
    if (user.email == post.email) {
        feed.appendChild(div);
    }
  });
});

function vote(postId, type) {
  const postRef = ref(db, `posts/${postId}`);
  onValue(postRef, snapshot => {
    const post = snapshot.val();
    if (!post) return;

    let up = post.upvotes || 0;
    let down = post.downvotes || 0;

    if (type === "up") up++;
    if (type === "down") down++;

    const total = up + down;
    const newScore = total ? up / total : 0;

    update(postRef, {
      upvotes: up,
      downvotes: down,
      score: newScore
    });
  }, { onlyOnce: true });
}


function openComments() {
  document.getElementById('commentOverlay').classList.remove('d-none');
}
function closeComments() {
  document.getElementById('commentOverlay').classList.add('d-none');
}
