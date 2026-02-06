const API_BASE = "http://localhost:5678/api";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("login-form");
  const errorElement = document.getElementById("login-error");

  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (errorElement) errorElement.textContent = "";

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
      const response = await fetch(`${API_BASE}/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Erreur dans l’identifiant ou le mot de passe");
      }

      const data = await response.json();
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.userId);

      window.location.href = "index.html";
    } catch (error) {
      if (errorElement) {
        errorElement.textContent = error.message;
      } else {
        alert(error.message);
      }
    }
  });
});
