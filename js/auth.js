import {
  getAuth,
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { app } from "./firebase-config.js";

const auth = getAuth(app);

const panelBtn = document.getElementById("panel-btn");
onAuthStateChanged(auth, (user) => {
  if (user?.uid) {
    localStorage.setItem("oporail_active_uid", user.uid);
  } else {
    localStorage.removeItem("oporail_active_uid");
  }

  if (!panelBtn) return;

  if (user) {
    panelBtn.textContent = "Mi Panel";
    panelBtn.href = "/user/dashboard.html";
  } else {
    panelBtn.textContent = "Acceder";
    panelBtn.href = "/user/index.html";
  }
});

export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  await signInWithPopup(auth, provider);
  window.location.href = "/user/dashboard.html";
}

export async function loginWithEmail(email, password) {
  await signInWithEmailAndPassword(auth, email, password);
  window.location.href = "/user/dashboard.html";
}

export async function registerWithEmail(email, password) {
  await createUserWithEmailAndPassword(auth, email, password);
  window.location.href = "/user/dashboard.html";
}

export async function logout() {
  await signOut(auth);
  window.location.href = "/index.html";
}

export function requireAuth() {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = "/user/index.html";
    }
  });
}

export function onUserChanged(cb) {
  onAuthStateChanged(auth, cb);
}

export function initAuthPage() {
  const googleBtn = document.getElementById("google-login-btn");
  const form = document.getElementById("login-form");
  const registerBtn = document.getElementById("register-btn");
  const feedback = document.getElementById("auth-feedback");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  if (!googleBtn || !form || !registerBtn || !feedback || !emailInput || !passwordInput) return;

  onAuthStateChanged(auth, (user) => {
    if (user) {
      window.location.href = "/user/dashboard.html";
    }
  });

  googleBtn.addEventListener("click", async () => {
    feedback.textContent = "Abriendo Google...";
    try {
      await loginWithGoogle();
    } catch (error) {
      feedback.textContent = `Error con Google: ${error.message}`;
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    feedback.textContent = "Iniciando sesión...";
    try {
      await loginWithEmail(emailInput.value.trim(), passwordInput.value);
    } catch (error) {
      feedback.textContent = `Error al iniciar sesión: ${error.message}`;
    }
  });

  registerBtn.addEventListener("click", async () => {
    feedback.textContent = "Creando cuenta...";
    try {
      await registerWithEmail(emailInput.value.trim(), passwordInput.value);
    } catch (error) {
      feedback.textContent = `Error al registrar: ${error.message}`;
    }
  });
}
