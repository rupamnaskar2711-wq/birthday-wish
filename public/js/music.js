import { supabase } from "./supabase.js";

const musicSelect = document.getElementById("musicSelect");
const audio = document.getElementById("birthdayAudio");
const volume = document.getElementById("musicVolume");
const customMusic = document.getElementById("customMusic");
const saveButton = document.getElementById("saveMusic");
const status = document.getElementById("musicStatus");

const roomId = new URLSearchParams(window.location.search).get("id");

let currentUser = null;
let uploadedMusic = null;

// Add your own royalty-free audio URLs here.
const musicLibrary = {
    birthday: "",
    romantic: "",
    piano: "",
    dream: "",
    happy: "",
    love: "",
    calm: "",
    sunset: "",
    magic: "",
    stars: "",
    peace: "",
    memories: "",
    hope: "",
    celebrate: "",
    nature: "",
    soft: "",
    cinematic: "",
    dreamy: "",
    special: "",
    classic: ""
};

// Check logged-in user
async function initialiseMusic() {
    const { data: { user }, error } =
        await supabase.auth.getUser();

    if (error || !user || !roomId) {
        status.textContent = "Please sign in first.";
        return;
    }

    currentUser = user;

    await loadSavedMusic();
}

// Load previously saved selection
async function loadSavedMusic() {
    const { data, error } = await supabase
        .from("birthday_music")
        .select("*")
        .eq("room_id", roomId)
        .maybeSingle();

    if (error) {
        status.textContent = "Could not load saved music.";
        return;
    }

    if (data) {
        musicSelect.value = data.music_name;
        status.textContent = "Your saved music selection is loaded.";
    }
}

// Select music
musicSelect.addEventListener("change", () => {

    const selected = musicSelect.value;

    if (!selected) return;

    if (musicLibrary[selected]) {
        audio.src = musicLibrary[selected];
        audio.play().catch(() => {
            status.textContent = "Press Play to start the music.";
        });
    } else {
        audio.pause();
        audio.removeAttribute("src");
        audio.load();

        status.textContent =
            "Add an audio URL for this selection in music.js.";
    }
});

// Volume control
volume.addEventListener("input", () => {
    audio.volume = Number(volume.value);
});

audio.volume = 0.5;

// Custom music upload
customMusic.addEventListener("change", () => {

    const file = customMusic.files[0];

    if (!file) return;

    if (!file.type.startsWith("audio/")) {
        status.textContent = "Please select an audio file.";
        return;
    }

    if (file.size > 10 * 1024 * 1024) {
        status.textContent = "Maximum file size is 10 MB.";
        return;
    }

    if (uploadedMusic) {
        URL.revokeObjectURL(uploadedMusic);
    }

    uploadedMusic = URL.createObjectURL(file);

    audio.src = uploadedMusic;
    audio.play().catch(() => {
        status.textContent = "Press Play to start your music.";
    });

    status.textContent = "Custom music loaded!";
});

// Save selection
saveButton.addEventListener("click", async () => {

    if (!currentUser) {
        status.textContent = "Please sign in first.";
        return;
    }

    const selected = musicSelect.value;

    if (!selected) {
        status.textContent = "Please select a music option.";
        return;
    }

    const { data: room, error: roomError } = await supabase
        .from("birthday_rooms")
        .select("id")
        .eq("id", roomId)
        .eq("owner_id", currentUser.id)
        .maybeSingle();

    if (roomError || !room) {
        status.textContent = "You cannot edit this room.";
        return;
    }

    const { error } = await supabase
        .from("birthday_music")
        .upsert({
            room_id: roomId,
            owner_id: currentUser.id,
            music_name: selected
        }, {
            onConflict: "room_id"
        });

    if (error) {
        status.textContent = error.message;
        return;
    }

    status.textContent = "Music selection saved successfully!";
});

initialiseMusic();