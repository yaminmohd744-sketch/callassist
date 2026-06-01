import { useState } from 'react';
import { AppContext } from '../contexts/AppContext';
import { AppShell } from '../components/layout/AppShell';
import { DashboardScreen } from './DashboardScreen';
import { AnalyticsScreen } from './AnalyticsScreen';
import { LeadsScreen } from './LeadsScreen';
import { PostCallScreen } from './PostCallScreen';
import { PreCallScreen } from './PreCallScreen';
import { Header } from '../components/layout/Header';
import { StatusBar } from '../components/layout/StatusBar';
import { TranscriptPanel } from '../components/panels/TranscriptPanel';
import { AIIntelligencePanel } from '../components/panels/AIIntelligencePanel';
import { LeadProfilePanel } from '../components/panels/LeadProfilePanel';
import type { CallSession, CallConfig, TranscriptEntry, AISuggestion } from '../types';
import './DemoTourScreen.css';

type DemoTab = 'dashboard' | 'precall' | 'livecall' | 'postcall' | 'analytics' | 'leads';

const TABS: { id: DemoTab; label: string }[] = [
  { id: 'dashboard',  label: 'Dashboard'  },
  { id: 'precall',    label: 'Pre-Call'   },
  { id: 'livecall',   label: 'Live Call'  },
  { id: 'postcall',   label: 'Post-Call'  },
  { id: 'analytics',  label: 'Analytics'  },
  { id: 'leads',      label: 'Leads CRM'  },
];

// ── Mock AppContext value ──────────────────────────────────────────────────────

const MOCK_CTX = {
  appLanguage: 'en-US' as const,
  onChangeLanguage: () => {},
  currentLangLabel: 'English',
  userName: 'Alex',
  userEmail: 'alex@pitchr.org',
  profilePic: null,
  onProfilePicChange: () => {},
  onProfilePicError: () => {},
  totalCallSeconds: 9_432,
  totalCallCount: 24,
};

// ── Demo session (used for Post-Call screen) ───────────────────────────────────

const DEMO_SESSION: CallSession = {
  id: 'demo-1',
  config: {
    prospectName: 'Amara Osei',
    company: 'Meridian Growth',
    callGoal: 'Book a discovery demo',
    yourPitch:
      'Pitchr gives your reps real-time AI coaching during live calls.\n' +
      '• Objection detection & instant rebuttals\n' +
      '• Buying signal alerts\n' +
      '• Auto-generated follow-up emails',
    language: 'en-US',
    callType: 'discovery',
    prospectTitle: 'VP of Sales',
  },
  durationSeconds: 551,
  finalCloseProbability: 81,
  objectionsCount: 2,
  callStage: 'close',
  endedAt: '2026-05-30T09:38:00.000Z',
  leadScore: 88,
  talkRatio: 0.48,
  outcome: 'pipeline',
  transcript: [
    { id: 't1', speaker: 'rep',      text: "Hi Amara — thanks for making time. What's your biggest bottleneck with new business right now?",                                               timestampSeconds: 12,  signal: 'neutral'       },
    { id: 't2', speaker: 'prospect', text: "Honestly? Our reps spend half their day on admin instead of selling. We're losing maybe 30% of potential conversations to friction.",           timestampSeconds: 28,  signal: 'buying-signal' },
    { id: 't3', speaker: 'rep',      text: "That's significant. Is it more the research side, the follow-up, or something in between?",                                                    timestampSeconds: 52,  signal: 'neutral'       },
    { id: 't4', speaker: 'prospect', text: "Both, but follow-up is worse. Some reps ghost prospects for a week — zero consistent process.",                                                timestampSeconds: 68,  signal: 'neutral'       },
    { id: 't5', speaker: 'rep',      text: "What does that cost you in pipeline per quarter, roughly?",                                                                                    timestampSeconds: 94,  signal: 'neutral'       },
    { id: 't6', speaker: 'prospect', text: "Our head of sales estimates £80K in stalled deals that could have closed.",                                                                    timestampSeconds: 112, signal: 'buying-signal' },
    { id: 't7', speaker: 'rep',      text: "£80K in stalled pipeline is a real number. I'd love to show you how teams like yours have cut follow-up time by 70% — could we get 30 minutes this week?", timestampSeconds: 420, signal: 'neutral' },
    { id: 't8', speaker: 'prospect', text: "Yeah, that makes sense. Send me Thursday afternoon options — I'm free after 2pm.",                                                             timestampSeconds: 445, signal: 'buying-signal' },
  ],
  suggestions: [
    { id: 's1', type: 'objection-response', headline: 'Budget concern handled', body: 'Amara pushed back on cost; you reframed around the £80K stalled pipeline figure — strong ROI pivot.', triggeredBy: 'budget', timestampSeconds: 310, createdAt: Date.now() },
    { id: 's2', type: 'close-attempt',      headline: 'Demo booked — Thursday confirmed', body: 'Prospect agreed to Thursday demo slot after pain was quantified. Strong close signal.',       triggeredBy: 'Thursday', timestampSeconds: 445, createdAt: Date.now() },
    { id: 's3', type: 'discovery',          headline: 'Quantified pain early',            body: 'Good move asking "what does that cost you" — anchored the value conversation before the pitch.', triggeredBy: 'cost', timestampSeconds: 94, createdAt: Date.now() },
  ],
  notes: [
    'Mentioned head of sales is Alex — reference in demo invite',
    'Budget review end of June — good timing window',
  ],
  aiSummary: `WHAT WENT WELL
• Opened with a sharp question that surfaced a real pain point fast
• Quantified the problem (£80K stalled pipeline) before pitching
• Talk ratio strong — Amara spoke more than 50% of the time

GAPS
• Took too long to bridge from pain discovery to the demo ask
• Price objection could have been handled with a harder ROI frame

NEXT STEPS
• Send Thursday 2pm+ calendar options by EOD today
• Reference the £80K figure in the demo invite`,
  followUpEmail: `Hi Amara,

Really appreciated the conversation today — the point about 30% of conversations lost to admin friction is one I keep hearing from heads of sales who are scaling fast.

As promised, here are a few slots for Thursday:
• 2:00 PM – 2:30 PM
• 3:00 PM – 3:30 PM
• 4:00 PM – 4:30 PM

In the 30-minute session I'll show you exactly how teams at your stage have cut follow-up time by 70% — I'll bring the numbers.

Just reply with which slot works and I'll send the invite straight over.

Best,
Alex`,
};

// ── Live call mock data ────────────────────────────────────────────────────────

const LIVE_CONFIG: CallConfig = {
  prospectName: 'Amara Osei',
  company: 'Meridian Growth',
  yourPitch:
    'Pitchr gives your reps real-time AI coaching during live calls.\n' +
    '• Objection detection & instant rebuttals\n' +
    '• Buying signal alerts\n' +
    '• Stage-aware coaching prompts',
  callGoal: 'Book a discovery demo',
  language: 'en-US',
  callType: 'discovery',
  prospectTitle: 'VP of Sales',
  priorContext:
    'Runs 12 AEs. Pain point: reps spend too much time on admin and prep. Budget cycle resets Q3. Uses Salesforce.',
};

const LIVE_TRANSCRIPT: TranscriptEntry[] = [
  { id: 'lt1', speaker: 'rep',      text: "Hi Amara — thanks for making time. Quick question to kick off: what's the biggest bottleneck stopping your team from having more conversations right now?", timestampSeconds: 12,  signal: 'neutral'       },
  { id: 'lt2', speaker: 'prospect', text: "Honestly? Our reps spend half their day on admin and prep instead of actually selling. We're losing maybe 30% of potential conversations just to friction.",  timestampSeconds: 28,  signal: 'buying-signal' },
  { id: 'lt3', speaker: 'rep',      text: "That's significant. When you say friction — is it more the research side, the follow-up, or something in between?",                                           timestampSeconds: 52,  signal: 'neutral'       },
  { id: 'lt4', speaker: 'prospect', text: "Both, but follow-up is worse. Some reps send great emails, others ghost prospects for a week. No consistent process.",                                        timestampSeconds: 68,  signal: 'neutral'       },
  { id: 'lt5', speaker: 'rep',      text: "What does that cost you in pipeline per quarter, roughly?",                                                                                                  timestampSeconds: 94,  signal: 'neutral'       },
  { id: 'lt6', speaker: 'prospect', text: "We haven't measured it precisely, but our head of sales estimates maybe £80K in stalled deals that could have closed.",                                      timestampSeconds: 112, signal: 'buying-signal' },
];

const LIVE_SUGGESTIONS: AISuggestion[] = [
  {
    id: 'ls1',
    type: 'close-attempt',
    headline: 'Bridge to the demo — now',
    body:
      '£80K in stalled pipeline is strong quantified pain. Bridge directly:\n"If I showed you how teams like yours cut follow-up time by 70% — would you be open to a 30-min demo this week?"',
    triggeredBy: '£80K',
    timestampSeconds: 115,
    createdAt: 115,
  },
];

// ── Frozen live-call view (static, no hooks/timers) ───────────────────────────

function LiveCallDemoView() {
  return (
    <div className="live-call">
      <Header
        prospectName="Amara Osei"
        company="Meridian Growth"
        onEndCall={() => {}}
      />
      <StatusBar
        status="active"
        formattedTime="06:42"
        objectionsCount={2}
        closeProbability={74}
      />
      <div className="live-call__panels">
        <TranscriptPanel
          entries={LIVE_TRANSCRIPT}
          isListening={true}
          interimText=""
        />
        <AIIntelligencePanel
          suggestions={LIVE_SUGGESTIONS}
          callStage="discovery"
          phaseLabel="Discovery"
          prospectTone="Curious"
          elapsedSeconds={115}
        />
        <LeadProfilePanel
          config={LIVE_CONFIG}
          closeProbability={74}
          objectionsCount={2}
          notes={[
            'Head of sales is Alex — reference in demo invite',
            'Budget review end of June — good timing',
          ]}
          noteInput=""
          onNoteChange={() => {}}
          onAddNote={() => {}}
        />
      </div>
    </div>
  );
}

// ── Demo tour root ─────────────────────────────────────────────────────────────

export function DemoTourScreen() {
  const [tab, setTab] = useState<DemoTab>('dashboard');

  return (
    <AppContext.Provider value={MOCK_CTX}>
      <div className="demo-tour">

        <div className="demo-tour__body">

          {tab === 'dashboard' && (
            <AppShell
              activeScreen="dashboard"
              onNavigate={s => {
                if (s === 'analytics') setTab('analytics');
                if (s === 'leads') setTab('leads');
              }}
              onStartCall={() => setTab('precall')}
              onUploadCall={() => {}}
              onSignOut={() => {}}
            >
              <DashboardScreen
                pastSessions={[]}
                onStartCall={() => setTab('precall')}
                onUploadCall={() => {}}
                onViewSession={() => setTab('postcall')}
                onDeleteSession={() => {}}
                userName="Alex"
                learningLog={[]}
              />
            </AppShell>
          )}

          {tab === 'precall' && (
            <PreCallScreen
              onStartCall={() => setTab('livecall')}
              onBack={() => setTab('dashboard')}
              defaultLanguage="en-US"
              defaultConfig={{
                prospectName:  'Amara Osei',
                company:       'Meridian Growth',
                prospectTitle: 'VP of Sales',
                callType:      'discovery',
                callGoal:      'Book a discovery demo',
                yourPitch:
                  'Pitchr gives your reps real-time AI coaching during live calls.\n' +
                  '• Objection detection & instant rebuttals\n' +
                  '• Buying signal alerts\n' +
                  '• Auto-generated follow-up emails',
                priorContext:
                  'Spoke at SaaS Summit in March. Interested in reducing CAC. Uses Salesforce. Budget cycle resets Q3.',
              }}
            />
          )}

          {tab === 'livecall' && <LiveCallDemoView />}

          {tab === 'postcall' && (
            <PostCallScreen
              session={DEMO_SESSION}
              onBack={() => setTab('dashboard')}
              onNewCall={() => setTab('precall')}
            />
          )}

          {tab === 'analytics' && (
            <AppShell
              activeScreen="analytics"
              onNavigate={s => {
                if (s === 'dashboard') setTab('dashboard');
                if (s === 'leads') setTab('leads');
              }}
              onStartCall={() => setTab('precall')}
              onUploadCall={() => {}}
              onSignOut={() => {}}
            >
              <AnalyticsScreen pastSessions={[]} />
            </AppShell>
          )}

          {tab === 'leads' && (
            <AppShell
              activeScreen="leads"
              onNavigate={s => {
                if (s === 'dashboard') setTab('dashboard');
                if (s === 'analytics') setTab('analytics');
              }}
              onStartCall={() => setTab('precall')}
              onUploadCall={() => {}}
              onSignOut={() => {}}
            >
              <LeadsScreen
                userId="demo-user"
                pastSessions={[]}
                onCallLead={() => setTab('precall')}
              />
            </AppShell>
          )}

        </div>

        {/* ── Tour nav — sits at the bottom, easy to crop out of screenshots ── */}
        <nav className="demo-tour__nav">
          <span className="demo-tour__badge">DEMO</span>
          {TABS.map(t => (
            <button
              key={t.id}
              className={`demo-tour__tab${tab === t.id ? ' demo-tour__tab--active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>

      </div>
    </AppContext.Provider>
  );
}
