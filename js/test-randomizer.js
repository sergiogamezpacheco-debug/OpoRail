(function () {
  'use strict';

  // Aleatoriza cualquier banco de preguntas sin modificar el número de preguntas
  // que utiliza el motor del test. El banco puede crecer sin tocar este código.
  const nativeFetch = window.fetch.bind(window);

  function shuffle(array) {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i -= 1) {
      const randomIndex = Math.floor(Math.random() * (i + 1));
      [result[i], result[randomIndex]] = [result[randomIndex], result[i]];
    }
    return result;
  }

  window.fetch = async function (input, init) {
    const response = await nativeFetch(input, init);

    try {
      const url = typeof input === 'string' ? input : input?.url || '';
      const normalizedUrl = new URL(url, window.location.href).pathname;

      if (!normalizedUrl.includes('/data/question-banks/') || !response.ok) {
        return response;
      }

      const payload = await response.clone().json();
      if (!Array.isArray(payload?.questions) || payload.questions.length < 2) {
        return response;
      }

      const randomizedPayload = {
        ...payload,
        questions: shuffle(payload.questions),
      };

      return new Response(JSON.stringify(randomizedPayload), {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });
    } catch (error) {
      console.error('[OpoRail] No se pudo aleatorizar el banco de preguntas:', error);
      return response;
    }
  };
})();
