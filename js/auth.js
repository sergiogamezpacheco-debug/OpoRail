// js/auth.js
import { getAuth, onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } 
from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { app } from "./firebase-config.js";

const auth = getAuth(app);

// Detectar botón del panel (index principal)
const panelBtn = document.getElementById("panel-btn");

onAuthStateChanged(auth, (user) => {
  if (panelBtn) {
    if (user) {
      panelBtn.textContent = "Cerrar sesión";
      panelBtn.onclick = async (e) => {
        e.preventDefault();
        await signOut(auth);
        window.location.href = "index.html";
      };
    } else {
      panelBtn.textContent = "Mi Panel";
      panelBtn.onclick = (e) => {
        e.preventDefault();
        window.location.href = "user/index.html";
      };
    }
  }
});

// 🔹 Login con Google
export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    window.location.href = "/user/dashboard.html";
  } catch (error) {
    alert("Error en el inicio con Google: " + error.message);
  }
}

// 🔹 Login con correo y contraseña
export async function loginWithEmail(email, password) {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = "/user/dashboard.html";
  } catch (error) {
    alert("Error al iniciar sesión: " + error.message);
  }
}

// 🔹 Registro con correo y contraseña
export async function registerWithEmail(email, password) {
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    window.location.href = "/user/dashboard.html";
  } catch (error) {
    alert("Error al registrarte: " + error.message);
  }
}

// 🔹 Cerrar sesión
export async function logout() {
  await signOut(auth);
  window.location.href = "../index.html";
}
