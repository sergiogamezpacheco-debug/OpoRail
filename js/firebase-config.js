// js/firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-analytics.js";

// Tu configuración de Firebase (la que tú me diste)
const firebaseConfig = {
  apiKey: "AIzaSyCZNZjQctvsDwQiwYd-89aLcEQiSfd2E6Y",
  authDomain: "oporail.firebaseapp.com",
  projectId: "oporail",
  storageBucket: "oporail.firebasestorage.app",
  messagingSenderId: "1087490996333",
  appId: "1:1087490996333:web:5e960faf0ce1b33682e764",
  measurementId: "G-Y75GHN32PJ"
};

// Inicializar Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);
