// Server-side Yahoo Finance v8 chart proxy.
// Avoids browser CORS and Yahoo 403s (v8 is uncredentialled; needs browser UA).
// 15-min delayed, informational only.

const YAHOO_SYMBOL = {
  "2222.SR": "2222.SR", XOM: "XOM", SHEL: "SHEL", CVX: "CVX", TTE: "TTE",
  BP: "BP", COP: "COP", MPC: "MPC", PSX: "PSX", VLO: "VLO",
  DUK: "DUK", SO: "SO", NEE: "NEE", AEP: "AEP", ENGI: "ENGI.PA",
  UAL: "UAL", DAL: "DAL", AAL: "AAL", LUV: "LUV", IAG: "IAG.L",
  "MAERSK-B.CO": "MAERSK-B.CO", FDX: "FDX", UPS: "UPS", UNP: "UNP",
  MT: "MT", NUE: "NUE", CLF: "CLF", BHP: "BHP", RIO: "RIO",
  HOLN: "HOLN.SW", CRH: "CRH", DOW: "DOW", LYB: "LYB", BAS: "BAS.DE",
  TM: "TM", F: "F", TSLA: "TSLA", WMT: "WMT", AMZN: "AMZN",
  MSFT: "MSFT", GOOGL: "GOOGL", AAPL: "AAPL",
};

async function fetchOne(ourTicker) {
  const yahoo = YAHOO_SYMBOL[ourTicker] ?? ourTicker;
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahoo)}?interval=1d&range=1d`;
  try {
    const res = await fetch(url, {
      headers: {
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        accept: "application/json",
      },
    });
    if (!res.ok) return { ticker: ourTicker, price: null, currency: null, error: `HTTP ${res.status}` };
    const j = await res.json();
    const m = j?.chart?.result?.[0]?.meta;
    if (!m || m.regularMarketPrice == null) {
      return { ticker: ourTicker, price: null, currency: null, error: j?.chart?.error?.description ?? "no data" };
    }
    const prev = m.chartPreviousClose ?? m.previousClose ?? null;
    return {
      ticker: ourTicker,
      price: m.regularMarketPrice,
      change: prev != null ? m.regularMarketPrice - prev : null,
      changePct: prev != null && prev !== 0 ? (m.regularMarketPrice - prev) / prev : null,
      currency: m.currency ?? null,
      marketState: m.marketState ?? null,
      ts: m.regularMarketTime ?? null,
      error: null,
    };
  } catch (e) {
    return { ticker: ourTicker, price: null, currency: null, error: e?.message ?? "fetch failed" };
  }
}

export default async function handler(req, res) {
  const tickers = Object.keys(YAHOO_SYMBOL);
  const quotes = await Promise.all(tickers.map(fetchOne));
  res.setHeader("Cache-Control", "public, max-age=60, s-maxage=60");
  res.status(200).json({ quotes, fetchedAt: Date.now() });
}
