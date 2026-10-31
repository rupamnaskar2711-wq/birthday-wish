// CREATE BIRTHDAY ROOM

function createRoom() {

    alert("Welcome to BirthdayVerse! 🎂");

    // We will connect this button
    // to the Create Room page in Part 5.

}


// EXPLORE FEATURES

function exploreFeatures() {

    document.getElementById("features").scrollIntoView({

        behavior: "smooth"

    });

}


// DARK AND LIGHT MODE

function toggleTheme() {

    document.body.classList.toggle("light");

    const button = document.querySelector(".theme-btn");

    if (document.body.classList.contains("light")) {

        button.innerHTML = "🌙";

        localStorage.setItem("birthdayTheme", "light");

    } else {

        button.innerHTML = "☀️";

        localStorage.setItem("birthdayTheme", "dark");

    }

}


// SAVE THEME

window.addEventListener("DOMContentLoaded", function() {

    const savedTheme = localStorage.getItem("birthdayTheme");

    const button = document.querySelector(".theme-btn");

    if (savedTheme === "light") {

        document.body.classList.add("light");

        button.innerHTML = "🌙";

    }

});


// MOBILE MENU

function toggleMenu() {

    const menu = document.getElementById("mobileMenu");

    menu.classList.toggle("active");

}