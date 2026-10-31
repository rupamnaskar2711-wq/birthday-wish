import { supabase } from "./supabase.js";

const params = new URLSearchParams(window.location.search);
const roomId = params.get("id");

const photoInput = document.querySelector("#photo-input");
const uploadButton = document.querySelector("#upload-photos");
const photoContainer = document.querySelector("#photo-container");
const message = document.querySelector("#gallery-message");

let currentUser = null;
let roomOwner = false;

async function initializeGallery() {

    if (!roomId) {
        photoContainer.textContent = "Room ID is missing.";
        return;
    }

    const { data: { user }, error } =
        await supabase.auth.getUser();

    if (error || !user) {
        photoContainer.textContent =
            "Sign in as the room owner to manage photographs.";
        uploadButton.disabled = true;
        return;
    }

    currentUser = user;

    const { data: room, error: roomError } = await supabase
        .from("birthday_rooms")
        .select("id, owner_id")
        .eq("id", roomId)
        .single();

    if (roomError || !room) {
        photoContainer.textContent = "Room not found.";
        uploadButton.disabled = true;
        return;
    }

    roomOwner = room.owner_id === currentUser.id;

    if (!roomOwner) {
        photoContainer.textContent =
            "Only the room owner can manage this gallery.";

        uploadButton.disabled = true;
        photoInput.disabled = true;
        return;
    }

    await loadPhotos();
}

// Upload photographs
uploadButton.addEventListener("click", async () => {

    if (!roomOwner || !currentUser) return;

    const files = Array.from(photoInput.files || []);

    if (files.length === 0) {
        message.textContent = "Please select photographs first.";
        return;
    }

    if (files.length > 10) {
        message.textContent = "Upload a maximum of 10 photos at a time.";
        return;
    }

    uploadButton.disabled = true;
    message.textContent = "Uploading photographs...";

    try {
        for (const file of files) {

            if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
                throw new Error("Only JPG, PNG and WEBP images are allowed.");
            }

            if (file.size > 5 * 1024 * 1024) {
                throw new Error("Each image must be smaller than 5 MB.");
            }

            const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");

            const filePath =
                `${currentUser.id}/${roomId}/${crypto.randomUUID()}-${safeName}`;

            const { error: uploadError } = await supabase.storage
                .from("birthday-photos")
                .upload(filePath, file, {
                    contentType: file.type,
                    upsert: false
                });

            if (uploadError) throw uploadError;

            const { error: databaseError } = await supabase
                .from("birthday_photos")
                .insert({
                    room_id: roomId,
                    owner_id: currentUser.id,
                    file_path: filePath
                });

            if (databaseError) {
                await supabase.storage
                    .from("birthday-photos")
                    .remove([filePath]);

                throw databaseError;
            }
        }

        message.textContent = "Photos uploaded successfully! 🎉";
        photoInput.value = "";

        await loadPhotos();

    } catch (error) {
        message.textContent = error.message;
    }

    uploadButton.disabled = false;
});

// Load photographs
async function loadPhotos() {

    photoContainer.textContent = "Loading photographs...";

    const { data, error } = await supabase
        .from("birthday_photos")
        .select("*")
        .eq("room_id", roomId)
        .order("created_at", { ascending: false });

    if (error) {
        photoContainer.textContent = error.message;
        return;
    }

    photoContainer.innerHTML = "";

    if (!data || data.length === 0) {
        photoContainer.textContent = "No photographs uploaded yet.";
        return;
    }

    for (const photo of data) {

        const { data: signedData, error: signedError } =
            await supabase.storage
                .from("birthday-photos")
                .createSignedUrl(photo.file_path, 3600);

        if (signedError) continue;

        const card = document.createElement("div");
        card.className = "photo-card";

        const image = document.createElement("img");
        image.src = signedData.signedUrl;
        image.alt = "Birthday memory";

        card.appendChild(image);

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete Photo";

        deleteButton.addEventListener("click", () => {
            deletePhoto(photo, deleteButton);
        });

        card.appendChild(deleteButton);
        photoContainer.appendChild(card);
    }
}

// Delete photograph
async function deletePhoto(photo, button) {

    if (!roomOwner) return;

    if (!confirm("Are you sure you want to delete this photograph?")) {
        return;
    }

    button.disabled = true;
    button.textContent = "Deleting...";

    const { error: storageError } = await supabase.storage
        .from("birthday-photos")
        .remove([photo.file_path]);

    if (storageError) {
        message.textContent = storageError.message;
        button.disabled = false;
        button.textContent = "Delete Photo";
        return;
    }

    const { error: databaseError } = await supabase
        .from("birthday_photos")
        .delete()
        .eq("id", photo.id)
        .eq("owner_id", currentUser.id);

    if (databaseError) {
        message.textContent = databaseError.message;
        return;
    }

    message.textContent = "Photograph deleted.";
    await loadPhotos();
}

initializeGallery();