export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

function xml(strings: TemplateStringsArray, ...values: any[]) {
  const out = strings.map((s, i) => s + (values[i] ?? '')).join('');
  return out.replace(/\n\s+/g, ' ').trim();
}

function base64UrlDecode(input: string): string {
  return Buffer.from(input, 'base64url').toString('utf8');
}

function base64UrlEncode(input: string): string {
  return Buffer.from(input).toString('base64url');
}

async function getAssistantReply(messages: ChatMessage[]): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return 'The system is missing its AI key. Please set the OpenAI API key.';
  }
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.6,
      max_tokens: 180,
    }),
  });
  if (!response.ok) {
    const errText = await response.text().catch(() => String(response.status));
    return `I am having trouble thinking right now. (${errText})`;
  }
  const data = await response.json();
  const text = data.choices?.[0]?.message?.content?.toString?.() ?? '';
  return text || 'Apologies, I did not generate a response.';
}

function trimHistory(messages: ChatMessage[], maxTurns: number = 6): ChatMessage[] {
  const system = messages.find((m) => m.role === 'system');
  const convo = messages.filter((m) => m.role !== 'system');
  const keep = convo.slice(-maxTurns);
  return system ? [system, ...keep] : keep;
}

export async function POST(req: Request) {
  const voice = process.env.AGENT_VOICE || 'Polly.Joanna';
  const url = new URL(req.url);
  const stateParam = url.searchParams.get('state');

  const bodyText = await req.text();
  const form = new URLSearchParams(bodyText);
  const userText = form.get('SpeechResult')?.toString()?.trim();

  let state: { messages: ChatMessage[] } = { messages: [] };
  try {
    if (stateParam) state = JSON.parse(base64UrlDecode(stateParam));
  } catch {
    state = { messages: [] };
  }

  if (!userText) {
    const retryUrl = `${url.origin}/api/voice/gather?state=${stateParam ?? ''}`;
    const twimlNoSpeech = xml`<?xml version="1.0" encoding="UTF-8"?>
    <Response>
      <Say voice="${voice}">I did not hear anything. Could you please repeat?</Say>
      <Gather input="speech" language="en-US" action="${retryUrl}" method="POST" speechTimeout="auto" timeout="5">
        <Say voice="${voice}">I am listening.</Say>
      </Gather>
    </Response>`;
    return new Response(twimlNoSpeech, { headers: { 'Content-Type': 'text/xml' } });
  }

  const messages = [
    ...(state.messages ?? []),
    { role: 'user', content: userText } as ChatMessage,
  ];

  const assistant = await getAssistantReply(messages);
  const newMessages = trimHistory([...messages, { role: 'assistant', content: assistant }]);
  const newState = base64UrlEncode(JSON.stringify({ messages: newMessages }));
  const nextUrl = `${url.origin}/api/voice/gather?state=${newState}`;

  const twiml = xml`<?xml version="1.0" encoding="UTF-8"?>
  <Response>
    <Say voice="${voice}">${assistant}</Say>
    <Gather input="speech" language="en-US" action="${nextUrl}" method="POST" speechTimeout="auto" timeout="6">
      <Say voice="${voice}">Your turn.</Say>
    </Gather>
  </Response>`;

  return new Response(twiml, { headers: { 'Content-Type': 'text/xml' } });
}

export const GET = POST;
