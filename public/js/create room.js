import { supabase } from "./supabase.js";

const form = document.getElementById("roomForm");
const statusMessage = document.getElementById("statusMessage");
const createButton = document.getElementById("createButton");

form.addEventListener("submit", async (event) => {

```
event.preventDefault();

createButton.disabled = true;
createButton.textContent = "Creating Room...";

statusMessage.textContent = "";

try {

    // Check logged-in user
    const { data: userData, error: userError } =
        await supabase.auth.getUser();

    if (userError || !userData.user) {
        window.location.href = "login.html";
        return;
    }

    // Get form values
    const personName =
        document.getElementById("personName").value.trim();

    const relationship =
        document.getElementById("relationship").value;

    const birthday =
        document.getElementById("birthday").value;

    const message =
        document.getElementById("message").value.trim();

    const theme =
        document.getElementById("theme").value;

    if (!personName || !relationship || !birthday) {
        throw new Error("Please complete all required fields.");
    }

    // Save birthday room
    const { data, error } = await supabase
        .from("birthday_rooms")
        .insert([
            {
                owner_id: userData.user.id,
                person_name: personName,
                relationship: relationship,
                birthday: birthday,
                message: message,
                theme: theme,
                is_private: true
            }
        ])
        .select()
        .single();

    if (error) {
        throw error;
    }

    statusMessage.textContent =
        "🎉 Your birthday room has been created!";

    statusMessage.style.color = "#86efac";

    // Open the room
    window.location.href =
        `room.html?id=${encodeURIComponent(data.id)}`;

} catch (error) {

    console.error(error);

    statusMessage.textContent =
        error.message || "Something went wrong.";

    statusMessage.style.color = "#fca5a5";

} finally {

    createButton.disabled = false;
    createButton.textContent = "Create Birthday Room ✨";

}
```

});
