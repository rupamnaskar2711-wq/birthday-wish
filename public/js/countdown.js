import { supabase } from "./supabase.js";

const params = new URLSearchParams(window.location.search);
const roomId = params.get("id");

const heading = document.querySelector("#birthday-heading");
const subtitle = document.querySelector("#birthday-subtitle");
const status = document.querySelector("#birthday-status");

let countdownInterval;

async function loadBirthday() {

    if (!roomId) {
        status.textContent = "Birthday room ID is missing.";
        return;
    }

    const { data: room, error } = await supabase
        .from("birthday_rooms")
        .select("birthday_name, birthday_date, room_theme")
        .eq("id", roomId)
        .single();

    if (error || !room) {
        status.textContent = "Unable to load birthday details.";
        return;
    }

    heading.textContent =
        `Happy Birthday, ${room.birthday_name || "Friend"}! 🎂`;

    subtitle.textContent =
        room.birthday_date
            ? `Birthday celebration: ${room.birthday_date}`
            : "Birthday date has not been added yet.";

    applyTheme(room.room_theme);

    if (room.birthday_date) {
        startCountdown(room.birthday_date);
    }
}

function applyTheme(theme) {

    const themes = {
        purple: "linear-gradient(135deg, #170d2b, #6b245f)",
        pink: "linear-gradient(135deg, #ff758c, #ff7eb3)",
        blue: "linear-gradient(135deg, #141e30, #243b55)"
    };

    document.body.style.background =
        themes[theme] || themes.purple;
}

function startCountdown(date) {

    clearInterval(countdownInterval);

    const target = new Date(`${date}T00:00:00`);

    function updateCountdown() {

        const now = new Date();
        let difference = target.getTime() - now.getTime();

        if (difference <= 0) {

            document.querySelector("#days").textContent = "00";
            document.querySelector("#hours").textContent = "00";
            document.querySelector("#minutes").textContent = "00";
            document.querySelector("#seconds").textContent = "00";

            status.textContent = "🎉 It's birthday time! Happy Birthday!";
            clearInterval(countdownInterval);
            return;
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / (1000 * 60)) % 60);
        const seconds = Math.floor((difference / 1000) % 60);

        document.querySelector("#days").textContent = days;
        document.querySelector("#hours").textContent = hours;
        document.querySelector("#minutes").textContent = minutes;
        document.querySelector("#seconds").textContent = seconds;

        status.textContent = "Counting down to the celebration! 🎁";
    }

    updateCountdown();

    countdownInterval = setInterval(updateCountdown, 1000);
}

loadBirthday();