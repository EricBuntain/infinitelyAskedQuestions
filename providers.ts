export function connectAnthropic(
  apiKey: string,
  systemPrompt: string,
  question: string,
  maxTokens: number,
): Promise<Response> {
  return fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6',
      max_tokens: maxTokens,
      stream: true,
      system: systemPrompt,
      messages: [{ role: 'user', content: question }],
    }),
  });
}

export function extractText(payload: string): string | undefined {
  try {
    const event = JSON.parse(payload);
    return event.type === 'content_block_delta' && event.delta?.type === 'text_delta'
      ? event.delta.text
      : undefined;
  } catch {
    return undefined;
  }
}
