'use client';

import { useEffect, useRef, useState } from 'react';
import type { Route, PsychProfileData, CapabilityData } from '@/lib/types';
import { chat, ROUTE_LABELS } from '@/app/actions/chat';
import type { ChatTurn } from '@/app/actions/chat';

interface DiscoverPageProps {
  navigate: (r: Route) => void;
  psychProfile?: PsychProfileData | null;
  capabilityData?: CapabilityData | null;
  userAps?: number;
  householdIncome?: number;
  userFirstName?: string;
}

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

function buildSuggestedPrompts(userAps?: number, householdIncome?: number, psychProfile?: { realistic?: number; investigative?: number; social?: number; enterprising?: number; artistic?: number } | null): string[] {
  const prompts: string[] = [];

  if (userAps) {
    prompts.push(`My APS is ${userAps} — which programmes have the best career outcomes?`);
  } else {
    prompts.push('Show me programmes where I can use my Maths and English equally');
  }

  if (psychProfile) {
    const riasec = [
      { k: 'realistic', v: psychProfile.realistic ?? 0, prompt: 'What careers use hands-on technical skills and suit a practical personality?' },
      { k: 'investigative', v: psychProfile.investigative ?? 0, prompt: 'I love research and analysis — what high-demand careers fit this?' },
      { k: 'social', v: psychProfile.social ?? 0, prompt: 'I want to work with people and make a social impact — what should I study?' },
      { k: 'enterprising', v: psychProfile.enterprising ?? 0, prompt: 'I have entrepreneurial drive — which degree will best prepare me to start a business?' },
      { k: 'artistic', v: psychProfile.artistic ?? 0, prompt: 'What careers combine creativity with a good salary in South Africa?' },
    ].sort((a, b) => b.v - a.v);
    prompts.push(riasec[0].prompt);
  } else {
    prompts.push('I want to work outdoors — what should I study?');
  }

  if (householdIncome !== undefined && householdIncome <= 600_000) {
    prompts.push('How do I stack NSFAS with a bursary to fully cover my costs?');
  } else {
    prompts.push('What merit bursaries can I apply for without an income test?');
  }

  prompts.push('Compare engineering vs computer science for long-term salary growth in SA');
  return prompts.slice(0, 4);
}

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

export default function DiscoverPage({ navigate, psychProfile, capabilityData, userAps, householdIncome, userFirstName }: DiscoverPageProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(SEED_MESSAGES);
  const [conversationHistory, setConversationHistory] = useState<ChatTurn[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const transcriptRef = useRef<HTMLDivElement>(null);

  const suggestedPrompts = buildSuggestedPrompts(userAps, householdIncome, psychProfile);

  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [messages]);

  async function sendMessage(prompt: string) {
    const trimmed = prompt.trim();
    if (!trimmed || isLoading) return;
    setInput('');
    setIsLoading(true);

    const snapshot = conversationHistory;
    setMessages(prev => [
      ...prev,
      { role: 'user', text: trimmed },
      { role: 'ai', typing: true },
    ]);

    const result = await chat(snapshot, trimmed);

    if ('error' in result) {
      setMessages(prev => [
        ...prev.slice(0, -1),
        {
          role: 'ai',
          text: result.error === 'AI not configured'
            ? 'The AI advisor is not yet configured — ask the platform admin to add an API key.'
            : 'I had trouble reaching the AI — please try again in a moment.',
          citations: [],
        },
      ]);
    } else {
      const citations: Citation[] = result.routes
        .filter(r => r in ROUTE_LABELS)
        .map(r => ({ label: ROUTE_LABELS[r], route: r as Route }));

      setMessages(prev => [
        ...prev.slice(0, -1),
        { role: 'ai', text: result.text, citations },
      ]);
      setConversationHistory(prev => [
        ...prev,
        { role: 'user', content: trimmed },
        { role: 'assistant', content: result.text },
      ]);
    }

    setIsLoading(false);
  }

  const initial = userFirstName ? userFirstName.charAt(0).toUpperCase() : 'S';

  return (
    <div className="page-anim">
      <div className="page-head">
        <div className="breadcrumb">Workspace · Discover</div>
        <div className="row-between">
          <div>
            <div className="eyebrow"><span className="dot" />Ask in plain language</div>
            <h2 className="heading" style={{ marginTop: '0.375rem' }}>Discover · AI Advisor</h2>
            <p className="body-text" style={{ marginTop: '0.5rem', maxWidth: '44rem' }}>
              Ask anything about your options. Claude cross-references your profile, the SA labour market and thousands of programmes — then cites specifically what it used.
            </p>
          </div>
          <div className="row">
            <button
              className="btn btn-outline"
              onClick={() => { setMessages([]); setConversationHistory([]); }}
            >
              Clear conversation
            </button>
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
                  <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>Ask your personal advisor anything</div>
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
                            <span>Powered by Claude · grounded in your profile</span>
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
                disabled={isLoading}
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
                style={{ height: 56, alignSelf: 'stretch', opacity: isLoading ? 0.6 : 1 }}
                disabled={isLoading}
                onClick={() => sendMessage(input)}
              >
                {isLoading ? '…' : 'Ask →'}
              </button>
            </div>
          </div>
        </div>

        <div className="stack-3">
          <div className="card">
            <div className="eyebrow"><span className="dot" />Try one of these</div>
            <div className="stack" style={{ marginTop: '0.625rem' }}>
              {suggestedPrompts.map(p => (
                <button
                  key={p}
                  className="focus-item"
                  style={{ background: 'transparent', cursor: isLoading ? 'not-allowed' : 'pointer', width: '100%', textAlign: 'left', border: '1px solid hsl(var(--border))', opacity: isLoading ? 0.5 : 1 }}
                  onClick={() => sendMessage(p)}
                  disabled={isLoading}
                >
                  <span className="focus-num">?</span>
                  <div style={{ flex: 1, fontWeight: 500, fontSize: '0.8125rem' }}>{p}</div>
                  <span className="badge brand">Ask</span>
                </button>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="eyebrow"><span className="dot" />What Claude can see</div>
            <div className="stack" style={{ marginTop: '0.625rem' }}>
              {([
                {
                  label: 'APS score',
                  loaded: !!userAps && userAps > 0,
                  detail: userAps && userAps > 0 ? `${userAps} pts · programme eligibility live` : 'Add subjects on Profile page',
                },
                {
                  label: 'RIASEC + Big Five',
                  loaded: !!psychProfile,
                  detail: psychProfile
                    ? `${['Realistic','Investigative','Artistic','Social','Enterprising','Conventional'].sort((a,b)=>(psychProfile[b.toLowerCase() as keyof PsychProfileData] as number??0)-(psychProfile[a.toLowerCase() as keyof PsychProfileData] as number??0)).slice(0,2).join('-')} dominant · career matching active`
                    : 'Take assessment to unlock career matching',
                },
                {
                  label: '8 capability dimensions',
                  loaded: !!capabilityData,
                  detail: capabilityData
                    ? `Composite ${Math.round([capabilityData.analytical_thinking,capabilityData.technical_aptitude,capabilityData.communication_skills,capabilityData.creative_thinking,capabilityData.leadership_potential,capabilityData.entrepreneurial_drive,capabilityData.perseverance,capabilityData.academic_readiness].reduce((a,b)=>a+b,0)/8)}/100 · gap analysis live`
                    : 'Assessment not yet taken',
                },
                {
                  label: 'Household income',
                  loaded: !!householdIncome,
                  detail: householdIncome
                    ? `R${Math.round(householdIncome/1000)}k/yr · ${householdIncome <= 350_000 ? 'NSFAS-eligible · bursary matching on' : 'Corporate + merit bursary matching on'}`
                    : 'Add on Profile to improve funding advice',
                },
              ] as Array<{ label: string; loaded: boolean; detail: string }>).map(src => (
                <div key={src.label} className="row" style={{ gap: '0.5rem', alignItems: 'flex-start', padding: '0.375rem 0', borderBottom: '1px solid hsl(var(--border))' }}>
                  <span className={`badge ${src.loaded ? 'success' : 'accent'}`} style={{ fontSize: '0.5rem', flexShrink: 0, marginTop: 3 }}>
                    {src.loaded ? '✓' : '?'}
                  </span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{src.label}</div>
                    <div className="caption" style={{ fontSize: '0.6875rem', marginTop: 1 }}>{src.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
