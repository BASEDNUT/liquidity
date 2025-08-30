// Central model registry sourced from environment

function parseCsvList(value, fallback = []) {
  if (!value) return fallback;
  return value.split(',').map(s => s.trim()).filter(Boolean);
}

const chatModel = process.env.VENICE_CHAT_MODEL || 'default-reasoning';
// Default to modern Venice image models if env not provided
const defaultImageModel = process.env.VENICE_IMAGE_MODEL_DEFAULT || 'qwen-image';
const allowedImageModels = parseCsvList(process.env.VENICE_IMAGE_MODELS, [
  'qwen-image',
  'hidream-i1',
  'stable-diffusion-3.5-large',
]);

function getValidImageModel(candidate) {
  const trimmed = typeof candidate === 'string' ? candidate.trim() : '';
  return allowedImageModels.includes(trimmed) ? trimmed : defaultImageModel;
}

// Minimal sanity checks for chat models; fall back if an invalid/default alias is provided.
const knownChatModelHints = [
  'qwen',
  'llama',
  'deepseek',
  'mixtral',
  'phi',
  'gemma',
  'gpt',
  'mistral',
];

function getValidChatModel(candidate) {
  const raw = (candidate || chatModel || '').trim();
  if (!raw) return 'llama-3.3-70b';
  const key = raw.toLowerCase();

  // Alias map so env-friendly names resolve to real Venice models
  const aliasMap = {
    'default-reasoning': process.env.VENICE_DEFAULT_REASONING_MODEL || 'llama-3.3-70b',
    'default': process.env.VENICE_DEFAULT_CHAT_MODEL || 'llama-3.3-70b',
  };

  if (aliasMap[key]) return aliasMap[key];

  // If it smells like a real model name (vendor hint), pass it through
  const looksValid = knownChatModelHints.some(h => key.includes(h));
  return looksValid ? raw : (aliasMap['default'] || 'llama-3.3-70b');
}

module.exports = {
  chatModel,
  image: {
    defaultModel: defaultImageModel,
    allowedModels: allowedImageModels,
    getValidImageModel,
  },
  getValidChatModel,
};
