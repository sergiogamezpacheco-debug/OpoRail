// js/auth.js
import { getAuth, onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { app } from "./firebase-config.js";

const auth = getAuth(app);

// 🔹 Detectar botón del panel
const panelBtn = document.getElementById("panel-btn");

// 🔹 Cambiar botón según estado del usuario
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

// 🔹 Función para iniciar sesión con Google (puedes ampliarla luego)
export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    console.log("Usuario autenticado:", result.user);
    window.location.href = "/user/dashboard.html";
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
  }
}
