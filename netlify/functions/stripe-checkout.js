const STRIPE_API_BASE = 'https://api.stripe.com/v1';

const PRICE_MAP = {
  basic_monthly: process.env.STRIPE_PRICE_BASIC_MONTHLY,
  basic_annual: process.env.STRIPE_PRICE_BASIC_ANNUAL,
  advanced_monthly: process.env.STRIPE_PRICE_ADVANCED_MONTHLY,
  advanced_annual: process.env.STRIPE_PRICE_ADVANCED_ANNUAL,
};

const ALLOWED_ORIGIN = process.env.APP_ORIGIN || '*';

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const payload = JSON.parse(event.body || '{}');
    const { planId, billingCycle, successUrl, cancelUrl, customerEmail } = payload;
    const priceKey = `${planId}_${billingCycle}`;
    const priceId = PRICE_MAP[priceKey];

    if (!priceId) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': ALLOWED_ORIGIN },
        body: JSON.stringify({ error: 'Precio no configurado para este plan.' }),
      };
    }

    const params = new URLSearchParams({
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      'line_items[0][price]': priceId,
      'line_items[0][quantity]': '1',
    });

    if (customerEmail) {
      params.set('customer_email', customerEmail);
    }

    const response = await fetch(`${STRIPE_API_BASE}/checkout/sessions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    const data = await response.json();
    if (!response.ok) {
      return {
        statusCode: response.status,
        headers: { 'Access-Control-Allow-Origin': ALLOWED_ORIGIN },
        body: JSON.stringify({ error: data?.error?.message || 'Error creando sesión.' }),
      };
    }

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': ALLOWED_ORIGIN },
      body: JSON.stringify({ url: data.url, id: data.id }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': ALLOWED_ORIGIN },
      body: JSON.stringify({ error: 'Error interno de Stripe.' }),
    };
  }
};
