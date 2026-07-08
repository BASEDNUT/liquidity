/**
 * Simple War Action API — BASED NUT Great Nut War
 * Stub handler to prevent 500 errors. Returns placeholder war action state.
 * TODO: Implement full war action logic when Redis + Venice API are configured.
 */

export default async function handler(req, res) {
  const { method, body } = req;

  if (method === 'GET') {
    return res.status(200).json({
      ok: true,
      message: 'Simple war action endpoint is active but not fully configured.',
      actions: [],
      timestamp: new Date().toISOString(),
    });
  }

  if (method === 'POST') {
    const { action, target, amount } = body || {};

    if (!action) {
      return res.status(400).json({
        ok: false,
        error: 'Missing required field: action',
      });
    }

    return res.status(200).json({
      ok: true,
      message: `War action '${action}' received but not fully configured.`,
      received: { action, target, amount },
      timestamp: new Date().toISOString(),
    });
  }

  return res.status(405).json({
    ok: false,
    error: `Method ${method} not allowed`,
  });
}
