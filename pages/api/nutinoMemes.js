import { validateEnv } from '../../utils/validateEnv';
import modelCatalog from '../../utils/modelCatalog';

export default async function handler(req, res) {
  try {
    validateEnv(); // Ensure VENICE_API_KEY is set

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { input, style, model } = req.body; // Add model to destructuring
    if (!input || typeof input !== 'string' || input.trim() === '') {
      console.error('Invalid input:', input); // Debugging log
      return res.status(400).json({ error: 'Invalid input' });
    }

    // Validate style
    const validStyles = ['kawaii', 'cursed'];
    const selectedStyle = validStyles.includes(style) ? style : 'kawaii';

    // Validate model
  // Validate/normalize requested image model against catalog
  const selectedModel = modelCatalog.image.getValidImageModel(model);

    // Define prompts for each style
    const stylePrompts = {
      kawaii: "Add adorable emotional visual tone using kawaii styled 3D nuts and nut-based characters with oversized sparkling eyes round faces blushing cheeks joyful or surprised expressions and playful gestures Use soft color palettes dreamy lighting and light whimsical elements like floating shapes magical sparkles and fantasy inspired scenery Encourage visual charm surreal humor and internet meme aesthetics Characters should appear plush vibrant expressive and visually delightful in high resolution Avoid specific object anchors and ensure open ended imaginative rendering Do not use any markdown symbols or commas or contractions in your response",
      cursed: "Add ultra-high-resolution hyperrealistic 3D anthropomorphic nuts and nut-based characters in states of hilarious extreme exaggerated emotion with hilarious expressive faces massive gaping mouths clenched teeth bulging eyes cracked warped textures and contorted shell anatomy Design each figure with unique personality driven by absurd stylized intensity Emphasize physical tension exaggerated anatomy kinetic motion distorted proportions oversized hands fists boots and facial features Saturate with conflicting emotional energy hysteria rage glee panic portrayed through hyperexpressive poses and asymmetry Highlight deranged charisma and surreal absurdity through texture lighting and contrast Prioritize dense visual storytelling in every character with layered detail polished rendering and amplified emotion to drive unpredictable emergent results Do not use any markdown symbols or commas or contractions in your response"
    };

    // STEP 1: Get Peanutoshi's dankified prompt using a chat model.
    // Append the style prompt to the user's input.
    const chatMessage = `${stylePrompts[selectedStyle]} ${input}`;
    const chatPayload = {
      model: modelCatalog.getValidChatModel(modelCatalog.chatModel),
      messages: [
        {
          role: "system",
          content:
            "Take the following user input and expand it into a surreal +8k high definition meme image prompt that is visually rich extremely funny and infused with internet meme culture Use a variety of stylized 3D (similar to pixar illumination entertainment dreamworks animations) mixed nut characters in unexpected absurd whimsical or dramatic scenes Describe in deails the characters aesthetics and scenery Emphasize humor visual surprise and creative storytelling with strong composition expressive characters and imaginative scenarios Encourage symbolic or surreal elements when contextually relevant without anchoring to specific terms Do not use Based NUT or Defi r crypto elements unless specified If it has a caption or text make sure to elaborate Ensure clean sharp high quality rendering with textured detail suitable for viral image generation Do not use any markdown symbols or commas or contractions in your response When returning response ensure that you dont use any symbols only letters and spaces and no more than exactly 1500 characters",
        },
        { role: "user", content: chatMessage },
      ],
      venice_parameters: {
        enable_web_search: "auto",
        include_venice_system_prompt: false,
        character_slug: "peanutoshi-nutkamoto",
      },
    };

    let comment = "No comment available";
    try {
      const chatResponse = await fetch("https://api.venice.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${process.env.VENICE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chatPayload),
      });

      if (chatResponse.ok) {
        const chatData = await chatResponse.json();
        console.log("Chat Data:", JSON.stringify(chatData, null, 2)); // Debugging log

        comment = chatData.reply ||
                  chatData.choices?.[0]?.message?.content ||
                  chatData.choices?.[0]?.text ||
                  chatData.messages?.[0]?.content ||
                  comment;
      } else {
        const errorData = await chatResponse.json();
        console.error('Error from Venice Chat API:', errorData);
        return res.status(chatResponse.status).json({
          error: 'Error from Venice Chat API',
          details: errorData,
        });
      }
    } catch (chatError) {
      console.error('Chat call error:', chatError);
      return res.status(500).json({ error: 'Chat call failed', details: chatError.message });
    }

    // STEP 2: Create image generation prompt by combining user input with Peanutoshi's dankified output.
    if (!comment) {
      console.error('Comment is undefined or empty.');
      return res.status(500).json({ error: 'Failed to generate comment from chat API.' });
    }

    // Extract and sanitize Peanutoshi's response
    const thinkRegex = /<think>([\s\S]*?)<\/think>/;
    const thinkingMatch = comment.match(thinkRegex);
    const thinking = thinkingMatch ? thinkingMatch[1].trim() : null; // Extract <think> content
    const sanitizedComment = comment.replace(thinkRegex, '').trim(); // Remove <think> content
    console.log("Sanitized Comment:", sanitizedComment);
    console.log("Thinking Content:", thinking);

    // Format the image prompt using Peanutoshi’s reworded output and truncate to 1500 characters
    const prompt = sanitizedComment.slice(0, 1500);
    console.log("Generated Prompt for Image (truncated to 1500 characters):", prompt);

    const imagePayload = {
      model: selectedModel, // Ensure only the validated model is sent
      prompt, // Use the sanitized prompt
      style_preset: "3D Model",
      width: 1024,
      height: 1024,
      steps: 30, // Added steps property
      safe_mode: true,
      hide_watermark: true,
      cfg_scale: 10, // Updated cfg_scale value
      negative_prompt: "human, skin, low-quality, grayscale, watermark",
      return_binary: true, // Request binary image output
      format: "webp",
    };

    // Add debugging log to confirm the payload
    console.log("Image Payload:", JSON.stringify(imagePayload, null, 2));

    // Add logging to verify payload
    console.log("Sending payload to Venice Image API:", JSON.stringify(imagePayload, null, 2));

  const controller = new AbortController();
  const timeoutMs = parseInt(process.env.REQUEST_TIMEOUT_MS || '120000', 10);
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const imageResponse = await fetch("https://api.venice.ai/api/v1/image/generate", {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${process.env.VENICE_API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/octet-stream',  // Added header for binary response
        },
        body: JSON.stringify(imagePayload),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!imageResponse.ok) {
        const errData = await imageResponse.json();
        console.error('Error from Venice Image API:', errData); // Log error details
        return res.status(imageResponse.status).json({
          error: 'Error from Venice Image API',
          details: errData,
        });
      }
      
      // Process the binary response and convert to a base64 data URL
      const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
      const imageBase64 = imageBuffer.toString('base64');
      const imageUrl = `data:image/webp;base64,${imageBase64}`;

      // Return the response in the correct order: 
      // 1. thinking, 2. response, 3. image.
      return res.status(200).json({
        comment, // Include the comment field
        imageUrl, // Include the image URL
        steps: [
          { step: 1, message: "thinking", detail: "Generating meme prompt and image..." },
          { step: 2, message: "peanutoshi", detail: comment },
          { step: 3, message: "image", image: imageUrl },
        ],
      });
    } catch (error) {
      clearTimeout(timeout);
      if (error.name === 'AbortError') {
        return res.status(504).json({ error: 'Request timed out' });
      }
      console.error('Error from Venice Image API:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } catch (error) {
    console.error('Error in Nutino Memes handler:', error);
    return res.status(500).json({
      error: 'Environment validation error',
      message: error.message,
    });
  }
}
