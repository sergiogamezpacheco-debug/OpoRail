const PAYPAL_BASE = process.env.PAYPAL_BASE_URL || 'https://api-m.sandbox.paypal.com';
const ALLOWED_ORIGIN = process.env.APP_ORIGIN || '*';

const PLAN_PRICE = {
  basic_monthly: process.env.PAYPAL_BASIC_MONTHLY_PRICE || '7.49',
  basic_annual: process.env.PAYPAL_BASIC_ANNUAL_PRICE || '49.00',
  advanced_monthly: process.env.PAYPAL_ADVANCED_MONTHLY_PRICE || '12.49',
  advanced_annual: process.env.PAYPAL_ADVANCED_ANNUAL_PRICE || '79.00',
};

async function getAccessToken() {
  const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64');
  const response = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error_description || 'No se pudo autenticar con PayPal.');
  }
  return data.access_token;
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const payload = JSON.parse(event.body || '{}');
    const { planId, billingCycle, returnUrl, cancelUrl } = payload;
    const priceKey = `${planId}_${billingCycle}`;
    const amount = PLAN_PRICE[priceKey];

    if (!amount) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': ALLOWED_ORIGIN },
        body: JSON.stringify({ error: 'Precio PayPal no configurado.' }),
      };
    }

    const accessToken = await getAccessToken();
    const response = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'EUR',
              value: amount,
            },
          },
        ],
        application_context: {
          return_url: returnUrl,
          cancel_url: cancelUrl,
        },
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return {
        statusCode: response.status,
        headers: { 'Access-Control-Allow-Origin': ALLOWED_ORIGIN },
        body: JSON.stringify({ error: data?.message || 'Error creando orden.' }),
      };
    }

    const approvalLink = data.links?.find((link) => link.rel === 'approve')?.href;
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': ALLOWED_ORIGIN },
      body: JSON.stringify({ id: data.id, url: approvalLink }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': ALLOWED_ORIGIN },
      body: JSON.stringify({ error: 'Error interno de PayPal.' }),
    };
  }
};
