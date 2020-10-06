
var m = new Array()
playSound = e => {
    const audio = document.querySelector(`audio[data-key="${e.keyCode}"]`);
    const key = document.querySelector(`li[data-key="${e.keyCode}"]`);
    if (audio) {
        var tmp;
        if (e.keyCode == 65)
            tmp = 60;
        else if (e.keyCode == 87)
            tmp = 61;
        else if (e.keyCode == 83)
            tmp = 62;
        else if (e.keyCode == 69)
            tmp = 63;
        else if (e.keyCode == 68)
            tmp = 64;
        else if (e.keyCode == 70)
            tmp = 65;
        else if (e.keyCode == 84)
            tmp = 66;
        else if (e.keyCode == 71)
            tmp = 67;
        else if (e.keyCode == 89)
            tmp = 68;
        else if (e.keyCode == 72)
            tmp = 69;
        else if (e.keyCode == 85)
            tmp = 70;
        else if (e.keyCode == 74)
            tmp = 71;
        else if (e.keyCode == 75)
            tmp = 73;
        else if (e.keyCode == 79)
            tmp = 73;
        else if (e.keyCode == 76)
            tmp = 74;
        else if (e.keyCode == 80)
            tmp = 75;
        else if (e.keyCode == 186)
            tmp = 76;

        m.push(tmp);
        window.console.log(m);
        audio.currentTime = 0;
        audio.play();
        key.classList.add("playing");
    }
};
removeTransition = e => {
    if (e.propertyName === "transform") {
        e.target.classList.remove("playing");
    }
};
window.addEventListener("keydown", playSound);

const pianoElList = document.querySelectorAll("li");

pianoElList.forEach(el => {
    el.addEventListener("transitionend", removeTransition);
});


