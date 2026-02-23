import {
  getAuth,
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { app } from "./firebase-config.js";

const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Error configurando la persistencia de sesión:", error);
});

const panelBtn = document.getElementById("panel-btn");
onAuthStateChanged(auth, (user) => {
  if (user?.uid) {
    localStorage.setItem("oporail_active_uid", user.uid);
    const displayName = user.displayName || "";
    const email = user.email || "";
    localStorage.setItem("oporail_user_profile", JSON.stringify({ displayName, email }));
  } else {
    localStorage.removeItem("oporail_active_uid");
    localStorage.removeItem("oporail_user_profile");
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

export async function registerWithEmail(email, password, fullName = "") {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const cleanName = (fullName || "").trim();
  if (cleanName) {
    await updateProfile(credential.user, { displayName: cleanName });
  }
  localStorage.setItem("oporail_user_profile", JSON.stringify({ displayName: cleanName, email }));
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
  const feedback = document.getElementById("auth-feedback");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  if (!googleBtn || !form || !feedback || !emailInput || !passwordInput) return;

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
}

export function initRegisterPage() {
  const googleBtn = document.getElementById("google-register-btn");
  const form = document.getElementById("register-form");
  const feedback = document.getElementById("register-feedback");
  const emailInput = document.getElementById("register-email");
  const passwordInput = document.getElementById("register-password");
  const firstNameInput = document.getElementById("register-first-name");
  const lastNameInput = document.getElementById("register-last-name");

  if (!googleBtn || !form || !feedback || !emailInput || !passwordInput || !firstNameInput || !lastNameInput) return;

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
    feedback.textContent = "Creando cuenta...";
    try {
      const fullName = `${firstNameInput.value.trim()} ${lastNameInput.value.trim()}`.trim();
      await registerWithEmail(emailInput.value.trim(), passwordInput.value, fullName);
    } catch (error) {
      feedback.textContent = `Error al registrar: ${error.message}`;
    }
  });
}