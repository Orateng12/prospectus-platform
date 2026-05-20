'use client';

import { useEffect, useRef, useState } from 'react';
import type { Route, PsychProfileData, CapabilityData } from '@/lib/types';

interface DiscoverPageProps {
  navigate: (r: Route) => void;
  psychProfile?: PsychProfileData | null;
  capabilityData?: CapabilityData | null;
}

type RiasecKey = 'realistic' | 'investigative' | 'artistic' | 'social' | 'enterprising' | 'conventional';

const RIASEC_LABELS: Record<RiasecKey, string> = {
  investigative: 'Investigative', realistic: 'Realistic', artistic: 'Artistic',
  social: 'Social', enterprising: 'Enterprising', conventional: 'Conventional',
};

interface Citation {
  label: string;
  route: Route;
}

interface ChatMessage {
  role: 'user' | 'ai';
  text?: string;
  citations?: Citation[];
  typing?: boolean;
}

const SEED_MESSAGES: ChatMessage[] = [
  { role: 'user', text: 'Which Wits programmes have the highest funding match for me?' },
  {
    role: 'ai',
    text: 'Three Wits programmes line up well for you, in this order:\n\n**BSc Actuarial Science** (88% match) — your strongest funding signal because Investec, Old Mutual and Sanlam all run named bursaries here and you clear the 75% Maths threshold on every one. Expected stack: NSFAS + Investec + merit = full cover.\n\n**BSc Computer Science** (84% match) — Standard Bank and FNB bursaries open here, but their thresholds are softer than Actuarial.\n\n**BEng Industrial** (71% match) — Sasol service-contract bursary fits but locks 2–3 years post-graduation.',
    citations: [
      { label: 'Funding Strategy', route: 'funding' },
      { label: 'Scholarships', route: 'scholarships' },
      { label: 'Programmes', route: 'programmes' },
    ],
  },
];

const CANNED_REPLIES: Record<string, { text: string; citations: Citation[] }> = {
  maths_english: {
    text: 'Programmes that **reward both Maths and English** as core inputs are unusual — most lean one direction. Three worth shortlisting:\n\n**BCom Economics & Politics** (UCT, SUN, Wits) — quantitative econ + heavy writing.\n**BA Politics, Philosophy & Economics** (UCT) — a maths paper every year, three essay-driven majors.\n**BSc Mathematical Statistics + English minor** (UP) — unusual stack, lets you go quant trader or analyst-journalist.',
    citations: [{ label: 'Programme explorer', route: 'programmes' }],
  },
  outdoors: {
    text: 'For careers that put you outside more than half the week, three paths fit:\n\n**BSc Geological Sciences** (Wits, Rhodes) — mining + environmental field work. SA labour market is mid-demand but the bursary pipeline is dense.\n\n**BSc Forestry & Wood Science** (SUN) — small intake, almost guaranteed employment with Sappi or Mondi.\n\n**BSc Agricultural Sciences** (UP, SUN, UFS) — TVET pathway also available.',
    citations: [{ label: 'Career Explorer', route: 'careers' }, { label: 'Programmes', route: 'programmes' }],
  },
  geography: {
    text: 'Dropping History for Geography is a **net positive** on your profile. Three reasons:\n\n1. Geography is a designated subject with broader programme acceptance — specifically opens BSc Environmental and BSc GIS pathways.\n2. Your Investigative + Realistic RIASEC scores correlate higher with spatial reasoning — Geography exercises that directly.\n3. APS impact: assuming you score similarly (~68), your APS stays flat. No downside.',
    citations: [{ label: 'Open simulator', route: 'simulator' }, { label: 'Programmes', route: 'programmes' }],
  },
  nsfas: {
    text: 'Five-step NSFAS guide for 2026:\n\n**1. Confirm eligibility.** Household income under R350k = full cover; under R600k = partial.\n**2. Apply online.** nsfas.org.za, between September and January each year.\n**3. Upload supporting docs.** Payslips, ID, school report, SARS notice.\n**4. Track in your dashboard.** Paste your reference number into Applications.\n**5. Re-confirm yearly.** NSFAS is renewable but requires 50% pass rate.',
    citations: [{ label: 'NSFAS Calculator', route: 'nsfas' }, { label: 'Funding Strategy', route: 'funding' }],
  },
  default: {
    text: 'I\'d need a more specific question — try one of the prompts below, or phrase it as a trade-off ("X or Y?"), a goal ("how do I afford Z?"), or a constraint ("only programmes in KZN").',
    citations: [{ label: 'Career Explorer', route: 'careers' }, { label: 'Programmes', route: 'programmes' }],
  },
};

function guessReply(prompt: string): { text: string; citations: Citation[] } {
  const p = prompt.toLowerCase();
  if (p.includes('maths') && p.includes('english')) return CANNED_REPLIES.maths_english;
  if (p.includes('outdoor') || p.includes('outside') || p.includes('field')) return CANNED_REPLIES.outdoors;
  if (p.includes('geography') || p.includes('history')) return CANNED_REPLIES.geography;
  if (p.includes('nsfas') || p.includes('fund') || p.includes('bursary')) return CANNED_REPLIES.nsfas;
  return CANNED_REPLIES.default;
}

const SUGGESTED_PROMPTS = [
  'Show me programmes where I can use my Maths and English equally',
  'I want to work outdoors — what should I study?',
  'What if I drop History and add Geography?',
  'How does NSFAS actually work?',
];

function renderText(text: string): React.ReactNode[] {
  return text.split('\n\n').map((block, i) => {
    const parts: React.ReactNode[] = [];
    let last = 0;
    const re = /\*\*(.+?)\*\*/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(block)) !== null) {
      if (m.index > last) parts.push(block.slice(last, m.index));
      parts.push(<strong key={m.index}>{m[1]}</strong>);
      last = m.index + m[0].length;
    }
    if (last < block.length) parts.push(block.slice(last));
    return <p key={i}>{parts}</p>;
  });
}

export default function DiscoverPage({ navigate, psychProfile }: DiscoverPageProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(SEED_MESSAGES);
  const [input, setInput] = useState('');
  const transcriptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [messages]);

  function sendMessage(prompt: string) {
    const trimmed = prompt.trim();
    if (!trimmed) return;
    setInput('');
    setMessages(prev => [
      ...prev,
      { role: 'user', text: trimmed },
      { role: 'ai', typing: true },
    ]);
    setTimeout(() => {
      const reply = guessReply(trimmed);
      setMessages(prev => [...prev.slice(0, -1), { role: 'ai', ...reply }]);
    }, 1100);
  }

  const initial = psychProfile?.openness !== undefined ? 'L' : 'L';

  return (
    <div className="page-anim">
      <div className="page-head">
        <div className="breadcrumb">Workspace · Discover</div>
        <div className="row-between">
          <div>
            <div className="eyebrow"><span className="dot" />Ask in plain language</div>
            <h2 className="heading" style={{ marginTop: '0.375rem' }}>Discover · AI search</h2>
            <p className="body-text" style={{ marginTop: '0.5rem', maxWidth: '44rem' }}>
              Ask anything about your options. The engine cross-references your profile, the labour market and 4,200 programmes — then cites specifically what it used.
            </p>
          </div>
          <div className="row">
            <button className="btn btn-outline" onClick={() => setMessages([])}>Clear conversation</button>
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ gridTemplateColumns: '1.6fr 1fr', alignItems: 'flex-start', gap: '1.25rem' }}>
        <div className="card" style={{ padding: '1.25rem' }}>
          <div className="chat-shell">
            <div className="chat-transcript" ref={transcriptRef}>
              {messages.length === 0 && (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'hsl(var(--muted-fg))' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✦</div>
                  <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>Ask Prospectus AI anything</div>
                  <div className="caption" style={{ marginTop: '0.25rem' }}>Try one of the prompts on the right to get started.</div>
                </div>
              )}
              {messages.map((msg, i) => (
                <div key={i} className={`chat-msg ${msg.role}`}>
                  <div className="chat-av">{msg.role === 'ai' ? 'AI' : initial}</div>
                  <div className="chat-bubble">
                    {msg.typing ? (
                      <div className="chat-typing">
                        <span /><span /><span />
                      </div>
                    ) : (
                      <>
                        {renderText(msg.text ?? '')}
                        {msg.citations && msg.citations.length > 0 && (
                          <div className="chat-cites">
                            {msg.citations.map((c, j) => (
                              <button
                                key={j}
                                className="chat-cite"
                                onClick={() => navigate(c.route)}
                              >
                                {c.label} →
                              </button>
                            ))}
                          </div>
                        )}
                        {msg.role === 'ai' && (
                          <div className="chat-meta">
                            <span>GPT-4 · cross-checked by Gemini</span>
                            <span style={{ marginLeft: 'auto' }}>grounded in your profile</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="chat-composer">
              <textarea
                className="chat-input"
                placeholder="Ask something specific — try a trade-off, a goal, or a constraint…"
                rows={2}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(input);
                  }
                }}
              />
              <button
                className="btn btn-primary btn-lg"
                style={{ height: 56, alignSelf: 'stretch' }}
                onClick={() => sendMessage(input)}
              >
                Ask →
              </button>
            </div>
          </div>
        </div>

        <div className="stack-3">
          <div className="card">
            <div className="eyebrow"><span className="dot" />Try one of these</div>
            <div className="stack" style={{ marginTop: '0.625rem' }}>
              {SUGGESTED_PROMPTS.map(p => (
                <button
                  key={p}
                  className="focus-item"
                  style={{ background: 'transparent', cursor: 'pointer', width: '100%', textAlign: 'left', border: '1px solid hsl(var(--border))' }}
                  onClick={() => sendMessage(p)}
                >
                  <span className="focus-num">?</span>
                  <div style={{ flex: 1, fontWeight: 500, fontSize: '0.8125rem' }}>{p}</div>
                  <span className="badge brand">Ask</span>
                </button>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="eyebrow"><span className="dot" />How the engine reasons</div>
            <div className="stack-2" style={{ marginTop: '0.625rem' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.8125rem' }}>1. Profile pull</div>
                <div className="caption">Your APS, Big Five, RIASEC, capability graph and household profile.</div>
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.8125rem' }}>2. Domain search</div>
                <div className="caption">4,200 programmes, 250 careers, 180 funding sources, labour market signal.</div>
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.8125rem' }}>3. Reason &amp; cite</div>
                <div className="caption">GPT-4 reasons over the union, Gemini cross-checks, both produce citations.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
