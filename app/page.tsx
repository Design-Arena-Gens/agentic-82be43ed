export default function Page() {
  const prodUrl = 'https://agentic-82be43ed.vercel.app';
  return (
    <main>
      <div className="card">
        <span className="badge">AI Call Agent</span>
        <h1>Answer and talk to callers with AI</h1>
        <p>
          This app provides Twilio-compatible webhooks to answer incoming calls and hold a
          back-and-forth conversation powered by OpenAI. It uses speech recognition via Twilio
          <code> &lt;Gather input="speech" /&gt; </code> and responds using Twilio <code>&lt;Say&gt;</code>.
        </p>
        <div className="section">
          <h3>Setup</h3>
          <div className="grid">
            <div>
              <strong>1) Environment</strong>
              <p>Set the environment variable <code>OPENAI_API_KEY</code> in your deployment.</p>
            </div>
            <div>
              <strong>2) Twilio Number Webhook</strong>
              <p>
                In your Twilio Console, set the Voice webhook for your phone number to:
              </p>
              <pre>
{prodUrl + '/api/voice/answer'}
              </pre>
              <p className="small">Method: HTTP POST (or GET). Content-Type is returned as XML.</p>
            </div>
            <div>
              <strong>3) Optional voice</strong>
              <p>
                Set <code>AGENT_VOICE</code> to a Twilio-supported voice (e.g. <code>Polly.Joanna</code>).
              </p>
            </div>
          </div>
        </div>
        <div className="section">
          <h3>Status</h3>
          <p>
            Home page renders without hitting the AI. Your callers will interact fully over the phone.
          </p>
        </div>
      </div>
    </main>
  );
}
