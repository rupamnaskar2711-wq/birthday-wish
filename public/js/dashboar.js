import { supabase } from "./supabase.js";

const userName = document.querySelector("#user-name");
const roomsContainer = document.querySelector("#rooms-container");
const message = document.querySelector("#dashboard-message");

let currentUser = null;

async function loadDashboard() {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        window.location.href = "login.html";
        return;
    }

    currentUser = user;

    userName.textContent =
        user.user_metadata?.full_name || user.email;

    await loadRooms();
}

async function loadRooms() {
    roomsContainer.textContent = "Loading rooms...";

    const { data, error } = await supabase
        .from("birthday_rooms")
        .select("*")
        .eq("owner_id", currentUser.id)
        .order("created_at", { ascending: false });

    if (error) {
        roomsContainer.textContent = "Could not load rooms: " + error.message;
        return;
    }

    if (!data || data.length === 0) {
        roomsContainer.textContent = "You haven't created any rooms yet.";
        return;
    }

    roomsContainer.innerHTML = "";

    data.forEach((room) => {
        const item = document.createElement("div");
        item.className = "room-item";

        const title = document.createElement("h3");
        title.textContent = room.title || "Birthday Room";

        const description = document.createElement("p");
        description.textContent = room.description || "A special birthday room.";

        const link = document.createElement("a");
        link.href = `room.html?id=${encodeURIComponent(room.id)}`;
        link.textContent = "Open Room";
        link.style.color = "#ff9cbd";

        item.append(title, description, link);
        roomsContainer.appendChild(item);
    });
}

document.querySelector("#refresh-rooms").addEventListener("click", loadRooms);

document.querySelector("#logout-btn").addEventListener("click", async () => {
    await supabase.auth.signOut();
    window.location.href = "login.html";
});

loadDashboard();