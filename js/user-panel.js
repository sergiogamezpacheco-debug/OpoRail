import { logout, onUserChanged, requireAuth } from "./auth.js";
import {
  checkReminder,
  getReminderConfig,
  saveReminderConfig,
  updateLastActive,
} from "./reminders.js";
import {
  capturePayPalOrder,
  createPayPalOrder,
  createStripeCheckout,
  getPaymentConfig,
  verifyStripeSession,
} from "./payments.js";

requireAuth();

const FALLBACK_COURSES = [
  { titulo: "Ajustador-Montador", estado: "Disponible" },
  { titulo: "Eléctrico", estado: "Disponible" },
  { titulo: "Suministros", estado: "Próximamente" },
];

function resolveDataPath(fileName) {
  return window.location.pathname.includes('/user/') ? `../data/${fileName}` : `/data/${fileName}`;
}

function bindLogout() {
  const logoutBtn = document.getElementById("logout-btn");
  if (!logoutBtn) return;
  logoutBtn.addEventListener("click", async () => {
    await logout();
  });
}

function getEnrollments(userId) {
  const raw = localStorage.getItem(`oporail_enrollments_${userId}`);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getProgressMap(userId) {
  const raw = localStorage.getItem(`oporail_progress_${userId}`);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function getPlanStatus(userId) {
  const raw = localStorage.getItem(`oporail_plan_${userId}`);
  if (!raw) return { planId: 'free', paid: false };
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return { planId: 'free', paid: false };
    return {
      planId: parsed.planId || 'free',
      paid: Boolean(parsed.paid),
    };
  } catch {
    return { planId: 'free', paid: false };
  }
}

function savePlanStatus(userId, status) {
  localStorage.setItem(`oporail_plan_${userId}`, JSON.stringify(status));
}

function getPaymentPending(userId) {
  const raw = localStorage.getItem(`oporail_payment_pending_${userId}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function setPaymentPending(userId, payload) {
  localStorage.setItem(`oporail_payment_pending_${userId}`, JSON.stringify(payload));
}

function clearPaymentPending(userId) {
  localStorage.removeItem(`oporail_payment_pending_${userId}`);
}

async function getPlanCatalog() {
  try {
    const res = await fetch(resolveDataPath('planes.json'));
    if (!res.ok) throw new Error('No se pudo cargar planes.json');
    const plans = await res.json();
    if (Array.isArray(plans)) {
      localStorage.setItem('oporail_plan_catalog', JSON.stringify(plans));
      return plans;
    }
  } catch (error) {
    console.error('Error cargando planes:', error);
  }
  const raw = localStorage.getItem('oporail_plan_catalog');
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function createProgressIfMissing(userId, courseId) {
  const progressMap = getProgressMap(userId);
  if (typeof progressMap[courseId] !== 'number') {
    const seededValue = 20 + ((courseId * 13) % 61);
    progressMap[courseId] = seededValue;
    localStorage.setItem(`oporail_progress_${userId}`, JSON.stringify(progressMap));
  }
}

async function getCourseCatalog() {
  try {
    const res = await fetch(resolveDataPath('courses.json'));
    if (!res.ok) throw new Error('No se pudo cargar courses.json');
    const courses = await res.json();
    if (Array.isArray(courses)) return courses;
    if (Array.isArray(courses?.courses)) return courses.courses;
    return FALLBACK_COURSES;
  } catch (error) {
    console.error('Error cargando catálogo de cursos:', error);
    return FALLBACK_COURSES;
  }
}

async function getAdminList() {
  try {
    const res = await fetch(resolveDataPath('admins.json'));
    if (!res.ok) throw new Error('No se pudo cargar admins.json');
    const payload = await res.json();
    const emails = Array.isArray(payload?.emails) ? payload.emails : [];
    localStorage.setItem('oporail_admins', JSON.stringify(emails));
    return emails;
  } catch (error) {
    console.error('Error cargando admins:', error);
  }
  const raw = localStorage.getItem('oporail_admins');
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function setAdminSectionVisible(isAdmin) {
  const adminSection = document.getElementById('admin-section');
  if (!adminSection) return;
  if (isAdmin) {
    adminSection.classList.remove('hidden');
  } else {
    adminSection.classList.add('hidden');
  }
}

async function renderDashboard(user) {
  const grid = document.getElementById("courses-grid");
  const emptyState = document.getElementById('courses-empty-state');
  if (!grid) return;

  const allCourses = await getCourseCatalog();
  const enrollments = getEnrollments(user.uid);

  const courseEntries = allCourses.map((course, index) => ({ id: index + 1, course }));
  const selectedEntries = (enrollments.length
    ? courseEntries.filter((entry) => enrollments.includes(entry.id))
    : courseEntries.slice(0, 3));

  if (!selectedEntries.length) {
    grid.innerHTML = '';
    if (emptyState) emptyState.classList.remove('hidden');
    updateGlobalProgress([]);
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');

  selectedEntries.forEach((entry) => {
    createProgressIfMissing(user.uid, entry.id);
  });

  const progressMap = getProgressMap(user.uid);
  const normalizedCourses = selectedEntries.map((entry) => {
    const course = entry.course;
    const id = entry.id;
    return {
      id,
      title: course.titulo,
      active: course.estado === 'Disponible',
      progress: progressMap[id] ?? 0,
    };
  });

  grid.innerHTML = normalizedCourses
    .map(
      (course) => `
      <article class="${course.active ? 'bg-purple-700' : 'bg-purple-400 opacity-80'} text-white rounded-xl p-5 shadow-md flex flex-col gap-3">
        <h4 class="font-bold text-lg mb-2">${course.title}</h4>
        <p class="text-purple-100 text-sm mb-3">${course.active ? 'Curso activo' : 'Próximamente'}</p>
        <div class="w-full bg-white/30 rounded-full h-2.5 overflow-hidden">
          <div class="bg-white h-2.5" style="width:${course.progress}%"></div>
        </div>
        <p class="text-xs mt-2 text-purple-100">Progreso: ${course.progress}%</p>
        <a href="/curso.html?id=${course.id}" class="inline-flex items-center justify-center bg-white text-purple-700 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 transition ${course.active ? '' : 'pointer-events-none opacity-70'}">
          Ir al curso
        </a>
      </article>
    `,
    )
    .join("");

  updateGlobalProgress(normalizedCourses);
}

function updateGlobalProgress(courses) {
  const bar = document.getElementById("global-progress-bar");
  const text = document.getElementById("global-progress-text");

  if (!courses.length) {
    if (bar) bar.style.width = '0%';
    if (text) text.textContent = '0%';
    return;
  }

  const avg = Math.round(courses.reduce((acc, c) => acc + c.progress, 0) / courses.length);
  if (bar) bar.style.width = `${avg}%`;
  if (text) text.textContent = `${avg}%`;
}

function fillUserInfo(user) {
  const name = user.displayName || "Usuario";
  const email = user.email || "-";
  const photo = user.photoURL || "https://ui-avatars.com/api/?name=Usuario&background=7c3aed&color=fff";
  const lastLogin = user.metadata?.lastSignInTime
    ? new Date(user.metadata.lastSignInTime).toLocaleString("es-ES")
    : "-";

  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };

  setText("user-name", name);
  setText("user-email", email);
  setText("last-login", lastLogin);
  setText("user-last-login", lastLogin);
  setText("user-uid", user.uid || "-");
  setText("user-provider", user.providerData?.[0]?.providerId || "-");

  const photoEls = document.querySelectorAll("#user-photo");
  photoEls.forEach((el) => {
    el.src = photo;
  });
}

async function fillPlanInfo(user) {
  const planName = document.getElementById('plan-name');
  const planPrice = document.getElementById('plan-price');
  const planNotice = document.getElementById('plan-notice');

  if (!planName && !planPrice && !planNotice) return;

  const plans = await getPlanCatalog();
  const status = getPlanStatus(user.uid);
  const plan = plans.find((item) => item.id === status.planId) || plans[0];

  if (planName) planName.textContent = plan?.nombre || 'Plan Gratuito';
  if (planPrice) {
    const priceText = [plan?.precioMensual, plan?.precioAnual].filter(Boolean).join(' · ');
    planPrice.textContent = priceText || '0€';
  }
  if (planNotice) {
    const pending = getPaymentPending(user.uid);
    if (pending) {
      planNotice.textContent = `Pago pendiente de verificación (${pending.method}).`;
      return;
    }
    if (plan?.requierePago && !status.paid) {
      planNotice.textContent = 'Plan pendiente de pago. Actívalo desde Ajustes para añadir cursos.';
    } else if (plan?.maxCursos === 1) {
      planNotice.textContent = 'Puedes añadir 1 curso con tu plan actual.';
    } else {
      planNotice.textContent = 'Puedes añadir cursos sin límite.';
    }
  }
}

async function renderPlanSettings(user) {
  const planContainer = document.getElementById('plan-options');
  const planFeedback = document.getElementById('plan-feedback');
  if (!planContainer) return;

  const plans = await getPlanCatalog();
  if (!plans.length) return;

  const status = getPlanStatus(user.uid);
  planContainer.innerHTML = plans
    .map((plan) => {
      const priceLine = [plan.precioMensual, plan.precioAnual].filter(Boolean).join(' · ');
      const isActive = status.planId === plan.id;
      const paymentTag = plan.requierePago && !status.paid && isActive ? 'Pendiente de pago' : isActive ? 'Activo' : '';
      return `
      <article class="border border-gray-200 rounded-lg p-4">
        <div class="flex items-start justify-between gap-4">
          <div>
            <h3 class="text-lg font-bold text-purple-700">${plan.nombre}</h3>
            <p class="text-sm text-gray-600">${plan.descripcion}</p>
            <p class="text-sm font-semibold text-gray-800 mt-2">${priceLine}</p>
          </div>
          <span class="text-xs font-semibold text-purple-700">${paymentTag}</span>
        </div>
        <ul class="text-sm text-gray-600 mt-3 space-y-1">
          ${(Array.isArray(plan.features) ? plan.features : []).map((feature) => `<li>• ${feature}</li>`).join('')}
        </ul>
        <div class="mt-4 flex flex-wrap gap-2">
          <button class="btn ${isActive ? 'opacity-70 pointer-events-none' : ''}" data-plan-id="${plan.id}" data-action="activate">Activar plan</button>
          ${plan.requierePago ? '<button class="btn-ghost" data-plan-id="' + plan.id + '" data-action="pay">Simular pago</button>' : ''}
        </div>
      </article>
    `;
    })
    .join('');

  planContainer.querySelectorAll('button[data-plan-id]').forEach((button) => {
    button.addEventListener('click', () => {
      const planId = button.dataset.planId;
      const action = button.dataset.action;
      const newStatus = getPlanStatus(user.uid);

      if (action === 'activate') {
        newStatus.planId = planId;
        if (newStatus.planId === 'free') {
          newStatus.paid = false;
        }
        savePlanStatus(user.uid, newStatus);
        if (planFeedback) planFeedback.textContent = 'Plan activado. Si requiere pago, completa el pago para añadir cursos.';
      }

      if (action === 'pay') {
        newStatus.planId = planId;
        newStatus.paid = true;
        savePlanStatus(user.uid, newStatus);
        if (planFeedback) planFeedback.textContent = 'Pago registrado. Ya puedes añadir cursos según tu plan.';
      }

      renderPlanSettings(user);
      fillPlanInfo(user);
    });
  });
}

async function handlePaymentReturn(user) {
  const params = new URLSearchParams(window.location.search);
  const paymentStatus = params.get('payment');

  if (!paymentStatus) return;

  if (paymentStatus === 'stripe_success') {
    const sessionId = params.get('session_id');
    if (!sessionId) return;
    const result = await verifyStripeSession(sessionId);
    if (result?.paid) {
      const planStatus = getPlanStatus(user.uid);
      planStatus.paid = true;
      savePlanStatus(user.uid, planStatus);
      clearPaymentPending(user.uid);
      fillPlanInfo(user);
    }
  }

  if (paymentStatus === 'paypal_success') {
    const orderId = params.get('token') || localStorage.getItem(`oporail_paypal_order_${user.uid}`);
    if (!orderId) return;
    const result = await capturePayPalOrder(orderId);
    if (result?.status === 'COMPLETED') {
      const planStatus = getPlanStatus(user.uid);
      planStatus.paid = true;
      savePlanStatus(user.uid, planStatus);
      clearPaymentPending(user.uid);
      fillPlanInfo(user);
      localStorage.removeItem(`oporail_paypal_order_${user.uid}`);
    }
  }

  if (paymentStatus.endsWith('_cancel')) {
    const feedback = document.getElementById('payment-feedback');
    if (feedback) {
      feedback.textContent = 'Pago cancelado. Puedes intentarlo de nuevo.';
    }
  }

  window.history.replaceState({}, document.title, window.location.pathname);
}

async function renderPaymentMethods(user) {
  const container = document.getElementById('payment-methods');
  const billingCycleSelect = document.getElementById('billing-cycle');
  const referenceInput = document.getElementById('payment-reference');
  const saveButton = document.getElementById('save-payment');
  const payButton = document.getElementById('start-payment');
  const feedback = document.getElementById('payment-feedback');
  const instructions = document.getElementById('payment-instructions');
  if (!container || !billingCycleSelect || !referenceInput || !saveButton || !payButton || !feedback || !instructions) return;

  const methods = [
    { id: 'stripe', label: 'Stripe' },
    { id: 'paypal', label: 'PayPal' },
    { id: 'card', label: 'Tarjeta' },
    { id: 'transfer', label: 'Transferencia' },
    { id: 'bizum', label: 'Bizum' },
  ];

  const raw = localStorage.getItem(`oporail_payment_${user.uid}`);
  let paymentStatus = { method: 'stripe', reference: '' };
  if (raw) {
    try {
      paymentStatus = { ...paymentStatus, ...JSON.parse(raw) };
    } catch {
      paymentStatus = { method: 'stripe', reference: '' };
    }
  }

  container.innerHTML = methods
    .map(
      (method) => `
      <label class="flex items-center gap-3 border border-gray-200 rounded-lg p-3">
        <input type="radio" name="payment-method" value="${method.id}" ${paymentStatus.method === method.id ? 'checked' : ''}>
        <span class="text-gray-700 font-semibold">${method.label}</span>
      </label>
    `,
    )
    .join('');

  referenceInput.value = paymentStatus.reference || '';

  const config = await getPaymentConfig();

  const renderInstructions = () => {
    const selected = container.querySelector('input[name="payment-method"]:checked');
    if (!selected) return;

    if (selected.value === 'transfer') {
      instructions.innerHTML = `
        <div class="border border-gray-200 rounded-lg p-3">
          <p><strong>Beneficiario:</strong> ${config.transfer.beneficiary}</p>
          <p><strong>IBAN:</strong> ${config.transfer.iban}</p>
          <p><strong>Banco:</strong> ${config.transfer.bank}</p>
          <p><strong>Concepto:</strong> ${config.transfer.concept}</p>
        </div>
      `;
      return;
    }

    if (selected.value === 'bizum') {
      instructions.innerHTML = `
        <div class="border border-gray-200 rounded-lg p-3">
          <p><strong>Beneficiario:</strong> ${config.bizum.beneficiary}</p>
          <p><strong>Teléfono Bizum:</strong> ${config.bizum.phone}</p>
        </div>
      `;
      return;
    }

    instructions.innerHTML = '';
  };

  renderInstructions();
  container.querySelectorAll('input[name="payment-method"]').forEach((input) => {
    input.addEventListener('change', renderInstructions);
  });

  saveButton.addEventListener('click', () => {
    const selected = container.querySelector('input[name="payment-method"]:checked');
    if (!selected) {
      feedback.textContent = 'Selecciona un método de pago.';
      return;
    }
    const reference = referenceInput.value.trim();
    localStorage.setItem(
      `oporail_payment_${user.uid}`,
      JSON.stringify({ method: selected.value, reference, updatedAt: new Date().toISOString() }),
    );
    feedback.textContent = 'Método guardado correctamente.';
  });

  payButton.addEventListener('click', async () => {
    const selected = container.querySelector('input[name="payment-method"]:checked');
    if (!selected) {
      feedback.textContent = 'Selecciona un método de pago.';
      return;
    }

    const planStatus = getPlanStatus(user.uid);
    if (planStatus.planId === 'free') {
      feedback.textContent = 'El Plan Gratuito no requiere pago.';
      return;
    }

    const billingCycle = billingCycleSelect.value;
    const reference = referenceInput.value.trim();
    const baseOrigin = window.location.origin;

    if (selected.value === 'stripe' || selected.value === 'card') {
      const payload = {
        planId: planStatus.planId,
        billingCycle,
        successUrl: new URL(config.stripe.successUrl, baseOrigin).toString(),
        cancelUrl: new URL(config.stripe.cancelUrl, baseOrigin).toString(),
        customerEmail: user.email || '',
      };
      feedback.textContent = 'Redirigiendo a Stripe...';
      const response = await createStripeCheckout(payload);
      if (response?.url) {
        window.location.href = response.url;
      } else {
        feedback.textContent = response?.error || 'No se pudo iniciar el pago con Stripe.';
      }
      return;
    }

    if (selected.value === 'paypal') {
      const payload = {
        planId: planStatus.planId,
        billingCycle,
        returnUrl: new URL(config.paypal.returnUrl, baseOrigin).toString(),
        cancelUrl: new URL(config.paypal.cancelUrl, baseOrigin).toString(),
      };
      feedback.textContent = 'Redirigiendo a PayPal...';
      const response = await createPayPalOrder(payload);
      if (response?.url) {
        localStorage.setItem(`oporail_paypal_order_${user.uid}`, response.id);
        window.location.href = response.url;
      } else {
        feedback.textContent = response?.error || 'No se pudo iniciar el pago con PayPal.';
      }
      return;
    }

    if (selected.value === 'transfer' || selected.value === 'bizum') {
      setPaymentPending(user.uid, {
        method: selected.value,
        reference,
        createdAt: new Date().toISOString(),
      });
      feedback.textContent = 'Pago marcado como pendiente. Verificaremos la operación en 24-48h.';
      fillPlanInfo(user);
      return;
    }
  });
}

function renderReminderSettings(user) {
  const enabledInput = document.getElementById('reminder-enabled');
  const daysInput = document.getElementById('reminder-days');
  const webhookInput = document.getElementById('reminder-webhook');
  const saveButton = document.getElementById('save-reminder');
  const feedback = document.getElementById('reminder-feedback');
  if (!enabledInput || !daysInput || !webhookInput || !saveButton || !feedback) return;

  const config = getReminderConfig(user.uid);
  enabledInput.checked = Boolean(config.enabled);
  daysInput.value = config.daysInactive || 7;
  webhookInput.value = config.webhookUrl || '';

  saveButton.addEventListener('click', () => {
    const updated = {
      enabled: enabledInput.checked,
      daysInactive: Number(daysInput.value) || 7,
      webhookUrl: webhookInput.value.trim(),
    };
    saveReminderConfig(user.uid, { ...config, ...updated });
    feedback.textContent = 'Recordatorios guardados. Recuerda configurar el webhook en tu backend.';
  });
}

onUserChanged((user) => {
  if (!user) return;
  fillUserInfo(user);
  fillPlanInfo(user);
  renderDashboard(user);
  renderPlanSettings(user);
  renderPaymentMethods(user);
  renderReminderSettings(user);
  updateLastActive(user.uid);
  checkReminder(user.uid, user.email || '');
  getAdminList().then((admins) => {
    const isAdmin = admins.includes(user.email);
    setAdminSectionVisible(isAdmin);
    localStorage.setItem('oporail_is_admin', isAdmin ? 'true' : 'false');
  });
  handlePaymentReturn(user);
});

bindLogout();
