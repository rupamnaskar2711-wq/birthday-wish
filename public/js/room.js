import { supabase } from "./supabase.js";

const params = new URLSearchParams(window.location.search);
const roomId = params.get("id");

let countdownInterval;

const themes = {
midnight: "Midnight Purple",
romantic: "Romantic Pink",
ocean: "Ocean Blue",
sunset: "Golden Sunset",
lavender: "Lavender Dream",
forest: "Forest Green",
royal: "Royal Gold",
cherry: "Cherry Blossom",
galaxy: "Galaxy",
minimal: "Minimal White",
rose: "Rose Garden",
aurora: "Aurora",
neon: "Neon Night",
cloud: "Dreamy Clouds",
fire: "Fire Glow",
ice: "Ice Crystal",
cosmic: "Cosmic Space",
peach: "Peach Paradise",
silver: "Silver Elegance",
classic: "Classic Celebration"
};

async function loadRoom() {

```
try {

    if (!roomId) {
        throw new Error("Birthday room ID is missing.");
    }

    // Verify logged-in user
    const { data: authData, error: authError } =
        await supabase.auth.getUser();

    if (authError || !authData.user) {
        window.location.href = "login.html";
        return;
    }

    // Get birthday room
    const { data: room, error } = await supabase
        .from("birthday_rooms")
        .select("*")
        .eq("id", roomId)
        .single();

    if (error || !room) {
        throw new Error(
            "Room not found or you do not have permission to access it."
        );
    }

    displayRoom(room);

} catch (error) {

    console.error(error);

    document.querySelector(".container").innerHTML = `
        <div class="message-card">
            <h2>Oops! 😕</h2>
            <p>${escapeHTML(error.message)}</p>
            <br>
            <a href="dashboard.html">Return to Dashboard</a>
        </div>
    `;

}
```

}

function displayRoom(room) {

```
document.getElementById("personName").textContent =
    room.person_name;

document.getElementById("relationshipText").textContent =
    `Celebrating a wonderful ${room.relationship.toLowerCase()}!`;

document.getElementById("birthdayMessage").textContent =
    room.message || "Wishing you happiness, love and beautiful memories! 💜";

document.getElementById("birthdayDate").textContent =
    formatDate(room.birthday);

document.getElementById("relationshipDetail").textContent =
    room.relationship;

document.getElementById("themeName").textContent =
    themes[room.theme] || room.theme;

document.body.dataset.theme = room.theme || "midnight";

startCountdown(room.birthday);
```

}

function formatDate(dateString) {

```
const date = new Date(dateString + "T12:00:00");

return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric"
});
```

}

function startCountdown(birthday) {

```
const [year, month, day] = birthday.split("-").map(Number);

function updateCountdown() {

    const now = new Date();

    let nextBirthday = new Date(
        now.getFullYear(),
        month - 1,
        day
    );

    if (nextBirthday.getTime() <= now.getTime()) {
        nextBirthday = new Date(
            now.getFullYear() + 1,
            month - 1,
            day
        );
    }

    const difference = nextBirthday.getTime() - now.getTime();

    if (difference <= 0) return;

    const days = Math.floor(difference / 86400000);
    const hours = Math.floor((difference % 86400000) / 3600000);
    const minutes = Math.floor((difference % 3600000) / 60000);
    const seconds = Math.floor((difference % 60000) / 1000);

    document.getElementById("days").textContent =
        String(days).padStart(2, "0");

    document.getElementById("hours").textContent =
        String(hours).padStart(2, "0");

    document.getElementById("minutes").textContent =
        String(minutes).padStart(2, "0");

    document.getElementById("seconds").textContent =
        String(seconds).padStart(2, "0");

    document.getElementById("countdownMessage").textContent =
        "Something beautiful is on its way! ✨";

    document.getElementById("countdownTitle").textContent =
        "Birthday Countdown";
}

updateCountdown();

countdownInterval = setInterval(updateCountdown, 1000);
```

}

function escapeHTML(value) {

```
return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
})[character]);
```

}

// Logout
document.getElementById("logoutButton").addEventListener(
"click",
async () => {

```
    await supabase.auth.signOut();

    window.location.href = "login.html";

}
```

);

loadRoom();

initialiseGallery();

// ==================================
// BIRTHDAYVERSE THEME SWITCHER
// ==================================

const themeOptions = document.getElementById("themeOptions");

const availableThemes = [
    "midnight",
    "romantic",
    "ocean",
    "sunset",
    "lavender",
    "forest",
    "royal",
    "cherry",
    "galaxy",
    "minimal",
    "rose",
    "aurora",
    "neon",
    "cloud",
    "fire",
    "ice",
    "cosmic",
    "peach",
    "silver",
    "classic"
];

function changeTheme(theme) {

    if (!availableThemes.includes(theme)) {
        return;
    }

    document.body.dataset.theme = theme;

    // Highlight selected theme
    document.querySelectorAll(".theme-options button")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.theme === theme
            );

        });

}

// Theme button clicks
themeOptions.addEventListener("click", async (event) => {

    const button = event.target.closest("button[data-theme]");

    if (!button) return;

    const selectedTheme = button.dataset.theme;

    changeTheme(selectedTheme);

    // Save selected theme in Supabase
    if (!currentRoom || !currentUser) {
        return;
    }

    const { error } = await supabase
        .from("birthday_rooms")
        .update({
            theme: selectedTheme
        })
        .eq("id", currentRoom.id)
        .eq("owner_id", currentUser.id);

    if (error) {

        galleryStatus.textContent =
            "Theme changed temporarily, but could not be saved.";

        console.error(error);

    }

});

// Load saved theme when room opens
const originalDisplayRoom = displayRoom;

displayRoom = function(room) {

    originalDisplayRoom(room);

    changeTheme(room.theme || "midnight");

};