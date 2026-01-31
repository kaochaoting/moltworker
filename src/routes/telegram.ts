import { Hono } from 'hono';

// Telegram webhook router
// Expects env TELEGRAM_TOKEN; optional OPENAI_COMPAT for overall app behavior

type Bindings = {
    TELEGRAM_TOKEN: string;
    OPENAI_COMPAT?: string;
};

const telegram = new Hono<{ Bindings: Bindings }>();

telegram.get('/health', (c) => c.text('ok'));

telegram.post('/webhook', async (c) => {
    let update: any = null;
    try {
          update = await c.req.json();
    } catch (_) {
          // ignore parse errors
    }
    const token = c.env.TELEGRAM_TOKEN;
    if (!token) {
          return c.text('Missing TELEGRAM_TOKEN', 500);
    }
    const chatId = update?.message?.chat?.id;
    const text = update?.message?.text ?? 'Received';

                if (chatId) {
                      const resp = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
                              method: 'POST',
                              headers: { 'content-type': 'application/json' },
                              body: JSON.stringify({ chat_id: chatId, text }),
                      });
                      try { await resp.text(); } catch (_) {}
                }
    return c.json({ ok: true });
});

export default telegram;
