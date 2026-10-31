import { supabase } from "./supabase.js";

const generateButton =
    document.getElementById("generateInvite");

const copyButton =
    document.getElementById("copyInvite");

const whatsappButton =
    document.getElementById("whatsappInvite");

const revokeButton =
    document.getElementById("revokeInvite");

const inviteResult =
    document.getElementById("inviteResult");

const inviteLink =
    document.getElementById("inviteLink");

const inviteStatus =
    document.getElementById("inviteStatus");

const roomId =
    new URLSearchParams(window.location.search).get("id");

let currentUser = null;
let activeInvitationId = null;

// Check user and room ownership
async function initialiseSharing() {

    const { data: { user }, error } =
        await supabase.auth.getUser();

    if (error || !user || !roomId) {
        inviteStatus.textContent =
            "Please sign in to manage invitations.";
        return;
    }

    currentUser = user;

    const { data: room, error: roomError } =
        await supabase
            .from("birthday_rooms")
            .select("id")
            .eq("id", roomId)
            .eq("owner_id", user.id)
            .maybeSingle();

    if (roomError || !room) {
        inviteStatus.textContent =
            "Only the room owner can manage invitations.";

        generateButton.disabled = true;
        return;
    }

    await loadExistingInvitation();
}

// Load existing active invitation
async function loadExistingInvitation() {

    const { data, error } = await supabase
        .from("room_invitations")
        .select("id, invite_token")
        .eq("room_id", roomId)
        .eq("is_active", true)
        .maybeSingle();

    if (error) {
        inviteStatus.textContent =
            "Could not load invitations.";
        return;
    }

    if (data) {
        activeInvitationId = data.id;
        showInvitation(data.invite_token);
    }
}

// Generate a new invitation
generateButton.addEventListener("click", async () => {

    if (!currentUser) return;

    generateButton.disabled = true;

    inviteStatus.textContent =
        "Creating your invitation...";

    // First revoke any previous active invitation
    const { error: revokeError } = await supabase
        .from("room_invitations")
        .update({ is_active: false })
        .eq("room_id", roomId)
        .eq("owner_id", currentUser.id)
        .eq("is_active", true);

    if (revokeError) {
        inviteStatus.textContent = revokeError.message;
        generateButton.disabled = false;
        return;
    }

    // Create a new invitation
    const { data, error } = await supabase
        .from("room_invitations")
        .insert({
            room_id: roomId,
            owner_id: currentUser.id
        })
        .select("id, invite_token")
        .single();

    generateButton.disabled = false;

    if (error) {
        inviteStatus.textContent = error.message;
        return;
    }

    activeInvitationId = data.id;

    showInvitation(data.invite_token);

    inviteStatus.textContent =
        "Your new invitation link is ready!";
});

// Display invitation link
function showInvitation(token) {

    const link =
        `${window.location.origin}/guest-room.html?token=${token}`;

    inviteLink.value = link;

    inviteResult.style.display = "block";
}

// Copy invitation
copyButton.addEventListener("click", async () => {

    try {
        await navigator.clipboard.writeText(inviteLink.value);

        inviteStatus.textContent =
            "Invitation link copied!";
    } catch {
        inviteLink.select();

        inviteStatus.textContent =
            "Select and copy the invitation link manually.";
    }
});

// WhatsApp sharing
whatsappButton.addEventListener("click", () => {

    const message =
        "You're invited to view a special birthday room! " +
        inviteLink.value;

    const whatsappURL =
        "https://wa.me/?text=" +
        encodeURIComponent(message);

    window.open(whatsappURL, "_blank");
});

// Revoke invitation
revokeButton.addEventListener("click", async () => {

    if (!activeInvitationId || !currentUser) return;

    const { error } = await supabase
        .from("room_invitations")
        .update({ is_active: false })
        .eq("id", activeInvitationId)
        .eq("owner_id", currentUser.id);

    if (error) {
        inviteStatus.textContent = error.message;
        return;
    }

    activeInvitationId = null;
    inviteResult.style.display = "none";

    inviteStatus.textContent =
        "Invitation revoked successfully.";
});

initialiseSharing();