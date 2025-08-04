/**
 * To jest kod Cloudflare Pages Function. Służy jako bezpieczny proxy
 * dla webhooka Make.com.
 *
 * Plik powinien znajdować się w folderze `/functions/api/chat.js`.
 *
 * UWAGA: MAKE_WEBHOOK_URL musi być ustawiony jako zmienna środowiskowa
 * (Environment Variable) w panelu Cloudflare Pages dla Twojego projektu.
 */
export async function onRequest(context) {
    // Sprawdź, czy webhook URL jest ustawiony jako zmienna środowiskowa
    const makeWebhookUrl = context.env.MAKE_WEBHOOK_URL;
    if (!makeWebhookUrl) {
        return new Response('Błąd: MAKE_WEBHOOK_URL nie jest skonfigurowany.', { status: 500 });
    }

    // Upewnij się, że zapytanie jest typu POST
    if (context.request.method !== 'POST') {
        return new Response('Metoda niedozwolona.', { status: 405 });
    }

    try {
        const payload = await context.request.json();
        
        // Zbuduj nową treść zapytania dla webhooka
        const webhookResponse = await fetch(makeWebhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        // Przekaż odpowiedź z webhooka z powrotem do klienta
        const responseText = await webhookResponse.text();
        return new Response(responseText, {
            status: webhookResponse.status,
            headers: {
                'Content-Type': 'application/json'
            }
        });

    } catch (error) {
        return new Response(`Błąd wewnętrzny serwera: ${error.message}`, { status: 500 });
    }
}
