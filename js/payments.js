const DEFAULT_PAYMENT_CONFIG = {
  stripe: {
    publishableKey: '',
    successUrl: '/user/dashboard.html?payment=stripe_success&session_id={CHECKOUT_SESSION_ID}',
    cancelUrl: '/user/settings.html?payment=stripe_cancel',
  },
  paypal: {
    clientId: '',
    returnUrl: '/user/dashboard.html?payment=paypal_success',
    cancelUrl: '/user/settings.html?payment=paypal_cancel',
  },
  transfer: {
    beneficiary: 'OpoRail',
    iban: '',
    bank: '',
    concept: 'Suscripción OpoRail',
  },
  bizum: {
    beneficiary: 'OpoRail',
    phone: '',
  },
};

function resolvePaymentConfigPath() {
  return window.location.pathname.includes('/user/') ? '../data/payment.json' : '/data/payment.json';
}

async function getPaymentConfig() {
  try {
    const res = await fetch(resolvePaymentConfigPath());
    if (!res.ok) throw new Error('No se pudo cargar payment.json');
    const config = await res.json();
    return { ...DEFAULT_PAYMENT_CONFIG, ...config };
  } catch (error) {
    console.error('Error cargando configuración de pagos:', error);
    return { ...DEFAULT_PAYMENT_CONFIG };
  }
}

async function createStripeCheckout(payload) {
  const res = await fetch('/.netlify/functions/stripe-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

async function verifyStripeSession(sessionId) {
  const res = await fetch('/.netlify/functions/stripe-verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId }),
  });
  return res.json();
}

async function createPayPalOrder(payload) {
  const res = await fetch('/.netlify/functions/paypal-create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

async function capturePayPalOrder(orderId) {
  const res = await fetch('/.netlify/functions/paypal-capture-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId }),
  });
  return res.json();
}

export {
  getPaymentConfig,
  createStripeCheckout,
  verifyStripeSession,
  createPayPalOrder,
  capturePayPalOrder,
};
