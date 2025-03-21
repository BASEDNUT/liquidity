# Venice API Integration

This document provides an overview of integrating the [Venice API](https://docs.venice.ai/api-reference/api-spec) into our application.  
We use the `peautoshi` character slug, and Venice handles most of the logic for chat completions.

---

## Base URL

All API requests must use the following base URL:

```
https://api.venice.ai/api/v1
```

---

## Client Setup

To configure the OpenAI client with Venice’s base URL:

```javascript
import OpenAI from "openai";

const openAI = new OpenAI({
  apiKey: process.env.VENICE_API_KEY, // Ensure this is set in your environment variables
  baseURL: "https://api.venice.ai/api/v1",
});
```

---

## Chat Completions

To generate chat completions using Venice:

```javascript
const options = {
  model: "llama-3.3-70b",
  messages: [{ role: "user", content: "Your prompt here" }],
  venice_parameters: {
    enable_web_search: false, // Disable web search
    include_venice_system_prompt: false, // Disable system prompts
    character_slug: "peanutoshi-nutkamoto", // Updated character slug
  },
  stream: true, // Enable streaming if needed
};

const response = await openAI.chat.completions.create(options);
console.log(response);
```

### Notes:
1. Use `venice_parameters` for Venice-specific configurations.
2. Set `character_slug` to `peautoshi` for our app's character.

---

## Image Generation

To generate images using Venice:

```javascript
fetch("https://api.venice.ai/api/v1/image/generate", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${process.env.VENICE_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "fluently-xl",
    prompt: "A beautiful sunset over a mountain range",
    style_preset: "3D Model",
    width: 1024,
    height: 1024,
  }),
})
  .then((res) => res.json())
  .then((json) => console.log(json))
  .catch((err) => console.error(err));
```

---

## Common HTTP Errors

- **401**: Authentication failed  
- **429**: Rate limit exceeded  
- **500**: Inference processing failed  
- **503**: Model at capacity  

---

## Best Practices

- **Secure API Keys**: Keep your `VENICE_API_KEY` secure and rotate it regularly.
- **Error Handling**: Implement robust error handling for all API responses.
- **System Prompts**: Test both with and without Venice’s system prompts to determine the best fit for your use case.
- **Rate Limiting**: Be mindful of rate limits during the beta period.

