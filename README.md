# liquidity

A minimal liquidity pool explorer with a chat interface powered by the Venice AI API.

## Features
- Explore liquidity pools.
- Chat with Peanutoshi using Venice AI.

## Run Commands
To run the project, use the following commands:

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Start
```bash
npm run start
```

### Test
```bash
npm test
```

## Venice API Integration
This project uses the Venice AI API for chat functionality. Ensure the following steps are completed to configure the API:

1. **Set up API Key**:
   - Obtain your API key from [Venice AI](https://venice.ai).
   - Add it to your environment variables as `VENICE_API_KEY`.

2. **API Configuration**:
   - The API uses the `POST` method to communicate with the Venice endpoint.
   - Example payload:
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

3. **Advanced Settings**:
   - Use the settings modal in the chat interface to configure advanced Venice API parameters such as `temperature`, `top_p`, `frequency_penalty`, and more.
   - These settings allow you to customize the behavior of the Venice AI model.

4. **Error Handling**:
   - Ensure proper error handling for API responses.
   - Check for valid `Authorization` headers and payload structure.

For more details, refer to the [Venice API Documentation](https://docs.venice.ai).