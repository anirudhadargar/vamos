let valueDisplays = document.querySelectorAll(".num");
let interval = 4000;

valueDisplays.forEach((valueDisplay) => {
  let startValue = 0;
  let endValue = parseInt(valueDisplay.getAttribute("data-val"));
  let duration = Math.floor(interval / endValue);
  let counter = setInterval(function () {
    startValue += 1;
    valueDisplay.textContent = startValue;
    if (startValue == endValue) {
      clearInterval(counter);
    }
  }, duration);
});
//refrest statistic on click start
$('#sta').click(function(){
  let valueDisplays = document.querySelectorAll(".num");
  let interval = 4000;
  valueDisplays.forEach((valueDisplay) => {
    let startValue = 0;
    let endValue = parseInt(valueDisplay.getAttribute("data-val"));
    let duration = Math.floor(interval / endValue);
    let counter = setInterval(function () {
      startValue += 1;
      valueDisplay.textContent = startValue;
      if (startValue == endValue) {
        clearInterval(counter);
      }
    }, duration);
  });
});
//refrest statistic on click end
// $("#sta").click(function() {
//   $("#statis").load("#statis > *");
//   // $(".statis").load(" .statis > *");
// });
// highlighting nav bar start
let navbar = document.getElementById("nav");
let viewportHeight = window.innerHeight;
let navHeight = document.getElementById("nav").offsetHeight;

let navbarLinks = document.querySelectorAll("nav li a");

window.addEventListener("scroll", e => {
  scrollpos = window.scrollY;
  navbarLinks.forEach(link => {
    let section = document.querySelector(link.hash);
    if (section.offsetTop <= scrollpos + 150 &&
        section.offsetTop + section.offsetHeight > scrollpos + 150) {
      link.classList.add("active");
      alert("working");
    } else {
      link.classList.remove("active");
    }
  });
});
//highlighting nav bar end