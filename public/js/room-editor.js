import { supabase } from "./supabase.js";

const params = new URLSearchParams(window.location.search);
const roomId = params.get("id");

const form = document.querySelector("#room-editor-form");
const nameInput = document.querySelector("#birthday-name");
const dateInput = document.querySelector("#birthday-date");
const themeInput = document.querySelector("#room-theme");
const message = document.querySelector("#editor-message");

let currentUser = null;

// Load room and verify ownership
async function loadEditor() {

    if (!roomId) {
        form.hidden = true;
        message.textContent = "Room ID is missing.";
        return;
    }

    const { data: { user }, error: authError } =
        await supabase.auth.getUser();

    if (authError || !user) {
        window.location.href = "login.html";
        return;
    }

    currentUser = user;

    const { data: room, error } = await supabase
        .from("birthday_rooms")
        .select("id, owner_id, birthday_name, birthday_date, room_theme")
        .eq("id", roomId)
        .single();

    if (error || !room) {
        form.hidden = true;
        message.textContent = "Could not load this room.";
        return;
    }

    if (room.owner_id !== currentUser.id) {
        form.hidden = true;
        message.textContent = "Only the room owner can edit these details.";
        return;
    }

    nameInput.value = room.birthday_name || "";
    dateInput.value = room.birthday_date || "";
    themeInput.value = room.room_theme || "purple";
}

// Save room changes
form.addEventListener("submit", async (event) => {

    event.preventDefault();

    if (!currentUser || !roomId) return;

    message.textContent = "Saving changes...";

    const { error } = await supabase
        .from("birthday_rooms")
        .update({
            birthday_name: nameInput.value.trim(),
            birthday_date: dateInput.value,
            room_theme: themeInput.value
        })
        .eq("id", roomId)
        .eq("owner_id", currentUser.id);

    if (error) {
        message.textContent = "Error: " + error.message;
        return;
    }

    message.textContent = "Birthday room updated successfully! 🎉";

    // Refresh countdown and theme
    window.location.reload();
});

loadEditor();