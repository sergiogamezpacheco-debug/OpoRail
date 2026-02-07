const STRIPE_API_BASE = 'https://api.stripe.com/v1';
const ALLOWED_ORIGIN = process.env.APP_ORIGIN || '*';

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const payload = JSON.parse(event.body || '{}');
    const { sessionId } = payload;
    if (!sessionId) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': ALLOWED_ORIGIN },
        body: JSON.stringify({ error: 'sessionId requerido.' }),
      };
    }

    const response = await fetch(`${STRIPE_API_BASE}/checkout/sessions/${sessionId}`, {
      headers: {
        Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      return {
        statusCode: response.status,
        headers: { 'Access-Control-Allow-Origin': ALLOWED_ORIGIN },
        body: JSON.stringify({ error: data?.error?.message || 'Error verificando sesión.' }),
      };
    }

    const paid = data.payment_status === 'paid';
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': ALLOWED_ORIGIN },
      body: JSON.stringify({ paid, customerEmail: data.customer_details?.email || null }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': ALLOWED_ORIGIN },
      body: JSON.stringify({ error: 'Error interno verificando Stripe.' }),
    };
  }
};
