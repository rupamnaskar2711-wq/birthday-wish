import { supabase } from "./supabase.js";

const loginForm = document.querySelector("#login-form");
const signupForm = document.querySelector("#signup-form");
const message = document.querySelector("#auth-message");

function showMessage(text) {
    if (message) {
        message.textContent = text;
    }
}

// LOGIN
if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        showMessage("Logging in...");

        const email = loginForm.querySelector("#email").value.trim();
        const password = loginForm.querySelector("#password").value;

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            showMessage(error.message);
            return;
        }

        window.location.href = "dashboard.html";
    });
}

// SIGNUP
if (signupForm) {
    signupForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        showMessage("Creating your account...");

        const email = signupForm.querySelector("#email").value.trim();
        const password = signupForm.querySelector("#password").value;
        const fullName = signupForm.querySelector("#fullname").value.trim();

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName
                }
            }
        });

        if (error) {
            showMessage(error.message);
            return;
        }

        showMessage("Account created! Check your email if confirmation is required.");
    });
}

// SHOW / HIDE PASSWORD
document.querySelectorAll(".password-toggle").forEach((button) => {

    button.addEventListener("click", () => {

        const wrapper = button.closest(".password-wrapper");
        const input = wrapper.querySelector("input");

        const isHidden = input.type === "password";

        input.type = isHidden ? "text" : "password";

        button.textContent = isHidden ? "🙈" : "👁";
        button.setAttribute("aria-label",
            isHidden ? "Hide password" : "Show password");

        button.setAttribute("aria-pressed", String(isHidden));

    });

});