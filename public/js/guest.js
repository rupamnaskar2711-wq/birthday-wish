import { supabase } from "./supabase.js";

const title = document.querySelector("#guest-title");
const description = document.querySelector("#guest-description");
const message = document.querySelector("#guest-message");
const errorMessage = document.querySelector("#guest-error");
const enterButton = document.querySelector("#guest-enter");

async function loadGuestRoom() {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
        message.textContent = "";
        errorMessage.textContent = "Invalid invitation link.";
        return;
    }

    message.textContent = "Checking your invitation...";

    const { data, error } = await supabase.rpc("get_shared_room", {
        p_token: token
    });

    if (error || !data) {
        message.textContent = "";
        errorMessage.textContent = "This invitation is invalid or unavailable.";
        return;
    }

    const room = Array.isArray(data) ? data[0] : data;

    if (!room) {
        message.textContent = "";
        errorMessage.textContent = "Birthday room not found.";
        return;
    }

    title.textContent = room.title || "You're Invited!";

    description.textContent =
        room.description || "Come and celebrate this special birthday with us!";

    message.textContent = "Your invitation is ready! 🎁";

    enterButton.hidden = false;

    enterButton.href =
        `room.html?id=${encodeURIComponent(room.id)}&token=${encodeURIComponent(token)}`;
}

loadGuestRoom();