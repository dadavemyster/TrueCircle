let isLight = null;
let bodyBackground = document.getElementById("bg");
let imageButton = document.getElementById("lightdark");
let textColor = document.getElementsByClassName("lightdarkchange");

if (localStorage.getItem("lightmode") == null) {
    localStorage.setItem("lightmode","true");
    isLight = true;
} else if (localStorage.getItem("lightmode") == "true") {
    bodyBackground.classList.remove("bg-dark");
    bodyBackground.classList.add("bg-light");
    imageButton.src = "img/sun.png";
    for (let i = 0; i < textColor.length; i++) {
        textColor[i].classList.add("text-muted");
        textColor[i].classList.remove("text-white");
    }
    isLight = true;
} else {
    bodyBackground.classList.add("bg-dark");
    bodyBackground.classList.remove("bg-light");
    imageButton.src = "img/moon.png";
    for (let i = 0; i < textColor.length; i++) {
        textColor[i].classList.add("text-white");
        textColor[i].classList.remove("text-muted");
    }
    isLight = false;
}

function lightdark() {
    isLight = !isLight;
    if (isLight == true) {
        bodyBackground.classList.remove("bg-dark");
        bodyBackground.classList.add("bg-light");
        imageButton.src = "img/sun.png";
        for (let i = 0; i < textColor.length; i++) {
            textColor[i].classList.add("text-muted");
            textColor[i].classList.remove("text-white");
        }
        localStorage.setItem("lightmode","true");
    } else {
        bodyBackground.classList.add("bg-dark");
        bodyBackground.classList.remove("bg-light");
        imageButton.src = "img/moon.png";
        for (let i = 0; i < textColor.length; i++) {
            textColor[i].classList.add("text-white");
            textColor[i].classList.remove("text-muted");
        }
        localStorage.setItem("lightmode","false");
    }   
};