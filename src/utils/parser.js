// ...existing code...
const parseResponse = (reply) => {
  return reply.replace(/<think>(.*?)<\/think>/g, (_, content) => {
    const escapedContent = content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
    return `<span class="thinking">${escapedContent}</span>`;
  });
};
// ...existing code...
