// scripts/ui.js

document.addEventListener("DOMContentLoaded", () => {
  const showRegisterBtn = document.getElementById("show-register");
  const showLoginBtn = document.getElementById("show-login");
  const registerForm = document.getElementById("register-form");
  const loginForm = document.getElementById("login-form");
  const formTitle = document.getElementById("form-title");
  const authMessage = document.getElementById("auth-message");

  if (showRegisterBtn) {
    showRegisterBtn.addEventListener("click", () => {
      registerForm.style.display = "block";
      loginForm.style.display = "none";
      formTitle.textContent = "Maak een account aan";
      authMessage.style.display = "none";
    });
  }

  if (showLoginBtn) {
    showLoginBtn.addEventListener("click", () => {
      registerForm.style.display = "none";
      loginForm.style.display = "block";
      formTitle.textContent = "Log in om te spelen";
      authMessage.style.display = "none";
    });
  }
});
