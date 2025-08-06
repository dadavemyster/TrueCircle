const path = window.location.pathname;
if (path.includes("inner_circle")) document.getElementById("nav-inner").classList.add("active-tab");
else if (path.includes("outer_circle")) document.getElementById("nav-outer").classList.add("active-tab");
else if (path.includes("new_post")) document.getElementById("nav-new").classList.add("active-tab");
else if (path.includes("profile")) document.getElementById("nav-profile").classList.add("active-tab");
