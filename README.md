# Liquidity Pool Explorer

A minimal liquidity pool explorer with a chat interface powered by the Venice AI API.

## Features

- **Liquidity Pool Exploration**: Browse and explore various liquidity pools.
- **Chat Interface**: Interact with Peanutoshi via the Venice AI API.

## Setup and Installation

1. **Clone the Repository**
    ```bash
    git clone <repository_url>
    cd liquidity
    ```

2. **Install Dependencies**
    ```bash
    npm install
    ```

3. **Configure Environment Variables**

    - Obtain your API key from [Venice AI](https://venice.ai).
    - Create a `.env` file in the root directory and add:
      ```env
      VENICE_API_KEY=your_api_key_here
      ```

## Running the Project

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Start (Production)
```bash
npm run start
```

### Testing
```bash
npm test
```

## Venice AI API Integration

This project uses the Venice AI API to enable the chat functionality.

### Request Structure

The API uses the `POST` method to communicate with the Venice endpoint. An example payload:

```json
{
  "model": "llama-3.3-70b",
  "messages": [{"role": "user", "content": "Hello"}],
  "venice_parameters": {
    "enable_web_search": "auto",
    "include_venice_system_prompt": true,
    "character_slug": "venice"
  },
  "temperature": 0.7,
  "top_p": 0.9
}
```

### Venice Parameters

The `venice_parameters` are configured as follows:
- `enable_web_search`: `false`
- `include_venice_system_prompt`: `false`
- `character_slug`: `"peanutoshi-nutkamoto"`

Settings have been removed as the character handles all configurations automatically.

### Error Handling

Ensure:
- Proper validation of the `Authorization` headers.
- Correct payload structure.
- Graceful handling of API response errors.

## Advanced Configuration

Customize the chat experience by adjusting:
- `temperature`
- `top_p`
- `frequency_penalty`
- Other settings via the chat interface settings modal.

For more details, refer to the [Venice API Documentation](https://docs.venice.ai).

## License

[Insert license details if applicable]

## Orchard TVL Sign (n8n)

The homepage includes an optional rustic Orchard TVL sign that pulls metrics from an n8n workflow.

Environment variables:

- `N8N_WEBHOOK_URL`: URL of your n8n Webhook node (Respond to Webhook output should match sample). Example:
  `https://n8n.example.com/webhook/1e5b023d-38e3-4f55-9bb0-49593c38a683`
- `FEATURE_ORCHARD_SIGN_ENABLED`: Set to `false` to disable backend validation for the sign (default `true`).
- `NEXT_PUBLIC_FEATURE_ORCHARD_SIGN_ENABLED`: Set to `false` to hide the sign in the UI (default `true`).

API proxy:

- `GET /api/orchard-tvl` — Proxies the webhook and normalizes the response to:
  `{ tvl, assets, pools, timestamp, volume24hTotal, priceChange24hAvg }`. TVL is pulled dynamically; no hardcoded fallback is used.

UI component:

- `components/OrchardTVLNotice.js` — Renders a wood-style sign: `123,456 TVL planted 🌰 across 14 soil mixes and 19 nut groves`,
  plus small timestamp and 24h metrics. Updates every 5 minutes. Zero values are shown (not hidden) to reflect small-project transparency.

### Caching and refresh

- `GET /api/orchard-tvl` uses a 24h cache (Redis if configured, else in-memory). It returns cached data instantly and refreshes in the background if stale. If no cached value exists and the webhook fails, the endpoint returns `502` (no fallback).
- Optional forced refresh: `POST /api/orchard-tvl/refresh` with header `Authorization: Bearer <CRON_REFRESH_TOKEN>` writes fresh data to the cache.
- For exact scheduling, configure a daily cron to hit the refresh endpoint (e.g., Vercel Cron or GitHub Actions).

Env variables:

- `CRON_REFRESH_TOKEN` — Shared secret for the refresh endpoint.
- `ORCHARD_REFRESH_URL` — Absolute URL to your refresh endpoint; used by `npm run cron:orchard-refresh`.