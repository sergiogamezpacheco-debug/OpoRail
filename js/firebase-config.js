// js/firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";

const firebaseConfig = {
  apiKey: "AIzaSyCZNZjQctvsDwQiwYd-89aLcEQiSfd2E6Y",
  authDomain: "oporail.firebaseapp.com",
  projectId: "oporail",
  storageBucket: "oporail.firebasestorage.app",
  messagingSenderId: "1087490996333",
  appId: "1:1087490996333:web:5e960faf0ce1b33682e764",
  measurementId: "G-Y75GHN32PJ"
};

export const app = initializeApp(firebaseConfig);
