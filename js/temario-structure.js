import { auth, db, storage } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { collection, addDoc, deleteDoc, doc, getDocs, orderBy, query, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-storage.js";

(() => {
  "use strict";

  const CATEGORIES = [
    { id: "comun_2025", title: "Temario Común 2025", description: "Contenido común compartido por todas las especialidades.", shared: true },
    { id: "especifico_2025", title: "Temario Específico 2025", description: "Contenido específico de esta especialidad.", shared: false },
    { id: "comun_oporail", title: "Temario Común Resumido y Optimizado por OpoRail", description: "Versión resumida y optimizada del contenido común.", shared: true },
    { id: "especifico_oporail", title: "Temario Específico Resumido y Optimizado por OpoRail", description: "Versión resumida y optimizada del contenido específico.", shared: false }
  ];

  const slug = (value) => String(value || "general")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

  const esc = (value) => String(value ?? "")
    .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;").replaceAll("'", "&#39;");

  function isAdmin() {
    return localStorage.getItem("oporail_is_admin") === "true";
  }

  function getCourseTitle() {
    const params = new URLSearchParams(location.search);
    const queryTitle = params.get("curso") || params.get("course") || params.get("titulo") || params.get("title");
    if (queryTitle) return queryTitle.trim();
    const heading = document.querySelector("#course-detail h1, #course-detail h2");
    return heading?.textContent?.trim() || "Curso";
  }

  function collectionPath(category, courseTitle) {
    return category.shared
      ? ["temarios", "comun", category.id, "documentos"]
      : ["temarios", "especialidades", slug(courseTitle), category.id, "documentos"];
  }

  function collectionRef(category, courseTitle) {
    const path = collectionPath(category, courseTitle);
    return collection(db, ...path);
  }

  async function read(category, courseTitle) {
    try {
      const result = await getDocs(query(collectionRef(category, courseTitle), orderBy("createdAt", "asc")));
      return result.docs.map((item) => ({ id: item.id, ...item.data() }));
    } catch (error) {
      console.error("Error leyendo temario desde Firebase:", error);
      return [];
    }
  }

  function renderDocs(list, category, docs) {
    list.innerHTML = docs.length
      ? docs.map((item, index) => `<li class="flex items-center justify-between gap-3 bg-white border border-gray-100 rounded-lg p-2">
          <a class="text-purple-700 hover:underline min-w-0 truncate" href="${esc(item.downloadURL)}" target="_blank" rel="noopener" download="${esc(item.name)}">${index + 1}. ${esc(item.name)}</a>
          ${isAdmin() ? `<button type="button" data-delete-doc="${esc(item.id)}" class="text-xs text-red-600 hover:underline shrink-0">Eliminar</button>` : ""}
        </li>`).join("")
      : '<li class="text-gray-500">No hay documentos cargados todavía.</li>';

    if (isAdmin()) {
      list.querySelectorAll("[data-delete-doc]").forEach((button) => {
        button.addEventListener("click", async () => {
          const id = button.dataset.deleteDoc;
          const current = docs.find((item) => item.id === id);
          if (!current || !confirm(`¿Eliminar "${current.name}"?`)) return;
          try {
            await deleteDoc(doc(collectionRef(category, getCourseTitle()), id));
            if (current.storagePath) await deleteObject(ref(storage, current.storagePath)).catch(() => {});
            await refreshCategory(category, getCourseTitle());
          } catch (error) {
            console.error("Error eliminando documento:", error);
            alert("No se pudo eliminar el documento.");
          }
        });
      });
    }
  }

  async function refreshCategory(category, courseTitle) {
    const list = document.getElementById(`temario-${category.id}-list`);
    if (!list) return;
    list.innerHTML = '<li class="text-gray-500">Cargando documentos...</li>';
    const docs = await read(category, courseTitle);
    renderDocs(list, category, docs);
  }

  function card(category) {
    const id = `temario-${category.id}`;
    return `<article class="bg-gray-50 rounded-xl border border-gray-100 p-5">
      <h3 class="text-lg font-bold text-purple-700 mb-2">${esc(category.title)}</h3>
      <p class="text-sm text-gray-600 mb-4">${esc(category.description)}</p>
      <ul id="${id}-list" class="space-y-2 text-sm text-gray-700 mb-4"><li class="text-gray-500">Cargando documentos...</li></ul>
      ${isAdmin() ? `<div class="space-y-2">
        <input id="${id}-input" type="file" accept=".pdf,.doc,.docx,.txt,.md" multiple class="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white">
        <button id="${id}-button" type="button" class="inline-flex items-center bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-800 transition">Cargar documentos</button>
        <p id="${id}-feedback" class="text-xs text-gray-500">Solo visible para administradores.</p>
      </div>` : ""}
    </article>`;
  }

  async function uploadCategory(category, courseTitle, input, feedback, list) {
    const user = auth.currentUser;
    if (!user || !isAdmin()) {
      feedback.textContent = "Necesitas una sesión de administrador.";
      return;
    }

    const files = Array.from(input.files || []);
    if (!files.length) {
      feedback.textContent = "Selecciona al menos un archivo.";
      return;
    }

    let added = 0;
    let failed = 0;
    const folder = category.shared ? `temarios/comun/${category.id}` : `temarios/especialidades/${slug(courseTitle)}/${category.id}`;

    for (const file of files) {
      if (file.size > 50 * 1024 * 1024) {
        failed++;
        continue;
      }
      try {
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const storagePath = `${folder}/${Date.now()}_${crypto.randomUUID()}_${safeName}`;
        const storageRef = ref(storage, storagePath);
        await uploadBytes(storageRef, file, { contentType: file.type || "application/octet-stream" });
        const downloadURL = await getDownloadURL(storageRef);
        await addDoc(collectionRef(category, courseTitle), {
          name: file.name,
          type: file.type || "application/octet-stream",
          size: file.size,
          storagePath,
          downloadURL,
          course: category.shared ? null : slug(courseTitle),
          category: category.id,
          shared: category.shared,
          uploadedBy: user.uid,
          uploadedByEmail: user.email || "",
          createdAt: serverTimestamp()
        });
        added++;
      } catch (error) {
        console.error("Error subiendo documento:", error);
        failed++;
      }
    }

    input.value = "";
    await refreshCategory(category, courseTitle);
    feedback.textContent = `${added} documento(s) cargado(s)${failed ? `; ${failed} no se pudieron cargar` : ""}.`;
  }

  function bindCategory(category, courseTitle) {
    const id = `temario-${category.id}`;
    const input = document.getElementById(`${id}-input`);
    const button = document.getElementById(`${id}-button`);
    const feedback = document.getElementById(`${id}-feedback`);
    const list = document.getElementById(`${id}-list`);
    if (!list) return;

    refreshCategory(category, courseTitle);
    if (!isAdmin() || !input || !button || !feedback) return;

    button.addEventListener("click", () => uploadCategory(category, courseTitle, input, feedback, list));
  }

  function render() {
    const detail = document.getElementById("course-detail");
    if (!detail) return false;

    const original = Array.from(detail.querySelectorAll("section")).find((section) => {
      const heading = section.querySelector("h2");
      return heading && heading.textContent.trim().toLowerCase() === "temario";
    });
    if (!original || original.dataset.temarioArchitecture === "true") return false;

    const courseTitle = getCourseTitle();
    const replacement = document.createElement("section");
    replacement.className = original.className || "mt-10 bg-white border border-purple-100 rounded-xl p-6";
    replacement.dataset.temarioArchitecture = "true";
    replacement.innerHTML = `<h2 class="text-2xl font-bold text-purple-700 mb-2">Temario</h2>
      <p class="text-sm text-gray-600 mb-4">Material actualizado y optimizado para la convocatoria 2025.</p>
      <div class="grid md:grid-cols-2 gap-4">${CATEGORIES.map(card).join("")}</div>
      <div class="mt-5 border-t border-gray-100 pt-4"><p class="text-xs text-gray-500">Los temarios comunes se comparten entre las especialidades. Los específicos pertenecen exclusivamente a cada curso.</p>
      ${isAdmin() ? '<a href="/admin/temarios.html" class="inline-flex items-center mt-3 border border-purple-200 text-purple-700 px-4 py-2 rounded-lg font-semibold hover:bg-purple-50 transition">Panel admin de temarios</a>' : ""}</div>`;

    original.replaceWith(replacement);
    CATEGORIES.forEach((category) => bindCategory(category, courseTitle));
    return true;
  }

  let attempts = 0;
  function waitForCourse() {
    if (render()) return;
    if (++attempts < 120) setTimeout(waitForCourse, 100);
  }

  onAuthStateChanged(auth, () => {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", waitForCourse, { once: true });
    else waitForCourse();
  });
})();
