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