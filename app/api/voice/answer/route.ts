export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function xml(strings: TemplateStringsArray, ...values: any[]) {
  const out = strings.map((s, i) => s + (values[i] ?? '')).join('');
  return out.replace(/\n\s+/g, ' ').trim();
}

function base64UrlEncode(input: string): string {
  return Buffer.from(input).toString('base64url');
}

function initialState(): string {
  const state = {
    messages: [
      {
        role: 'system',
        content:
          'You are a helpful phone agent. Speak concisely, one or two sentences per turn. Ask clarifying questions when needed. Never mention being an AI unless asked. Maintain a friendly, professional tone.',
      },
    ],
  };
  return base64UrlEncode(JSON.stringify(state));
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const state = initialState();
  const gatherUrl = `${url.origin}/api/voice/gather?state=${state}`;
  const voice = process.env.AGENT_VOICE || 'Polly.Joanna';

  const twiml = xml`<?xml version="1.0" encoding="UTF-8"?>
  <Response>
    <Say voice="${voice}">Hello! Thanks for calling. How can I help you today?</Say>
    <Gather input="speech" language="en-US" action="${gatherUrl}" method="POST" speechTimeout="auto" timeout="5">
      <Say voice="${voice}">I am listening.</Say>
    </Gather>
    <Say voice="${voice}">I did not catch that. Goodbye.</Say>
    <Hangup/>
  </Response>`;

  return new Response(twiml, { headers: { 'Content-Type': 'text/xml' } });
}

export const POST = GET;
