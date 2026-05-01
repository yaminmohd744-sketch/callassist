import type { LanguageCode } from './languages';

// ─── Translation shape ────────────────────────────────────────────────────────
export interface T {
  // Navigation
  nav: {
    dashboard: string;
    training: string;
    analytics: string;
    leads: string;
    meetings: string;
    newCall: string;
    upload: string;
  };
  // Common actions
  common: {
    back: string;
    cancel: string;
    save: string;
    send: string;
    start: string;
    done: string;
    close: string;
    loading: string;
    signOut: string;
    next: string;
    skip: string;
    edit: string;
    delete: string;
    confirm: string;
    tryAgain: string;
    learnMore: string;
    or: string;
  };
  // Profile / shell
  profile: {
    activity: string;
    appearance: string;
    dark: string;
    light: string;
    calls: (n: number) => string;
    trainingSessions: (n: number) => string;
    totalOnPlatform: string;
    maxRank?: string;
    appLanguage: string;
    langNote: string;
  };
  // Tiers — optional; kept in data for backwards compat but no longer rendered
  tiers?: {
    title: string;
    subtitle: string;
    unlocked: string;
    noCalls: string;
    noSessions: string;
    calls: string;
    sessions: string;
    percentThere: string;
  };
  // Dashboard
  dashboard: {
    greeting: (name: string) => string;
    tagline: string;
    streakMessage: (n: number) => string;
    recentCalls: string;
    noCalls: string;
    noCallsSub: string;
    startCall: string;
    uploadCall: string;
    duration: string;
    score: string;
    stage: string;
    viewSession: string;
    deleteSession: string;
    totalCalls: string;
    avgCloseProb: string;
    totalObjections: string;
    avgDuration: string;
    practiceStreak: string;
    total: string;
    overview: string;
    contacts: string;
    contactsSub: string;
    noContacts: string;
    noContactsSub: string;
    noResults: string;
    searchPlaceholder: string;
    latestScore: string;
    bestCloseProb: string;
    latestSummary: string;
    latestNotes: string;
    latestEmail: string;
    callHistory: string;
    copy: string;
    copied: string;
    callCount: (n: number) => string;
  };
  // Training
  training: {
    title: string;
    subtitle: string;
    language: string;
    startTraining: string;
    endSession: string;
    practicing: string;
    yourResponse: string;
    generating: string;
    sessionComplete: string;
    practiceAgain: string;
    backToDashboard: string;
    quota: (used: number, total: number) => string;
    quotaExhausted: (total: number) => string;
    setupContext: string;
    whatSelling: string;
    whatSellingPlaceholder: string;
    selectSub: string;
    difficulty: string;
    easy: string;
    medium: string;
    hard: string;
    customScenario: string;
    customPlaceholder: string;
    sessionHistory: string;
    exchanges: (n: number) => string;
    score: string;
    keyTakeaway: string;
    strengths: string;
    improvements: string;
    practice: string;
    academy: string;
    loadingAcademy: string;
    generatingReport: string;
    scenarioLabel: string;
    recent: string;
    describeProspect: string;
    describeProspectSub: string;
    whatSellingContextSub: string;
    prospectSpeaking: string;
    yourTurn: string;
    aiThinking: string;
    waiting: string;
  };
  // Scenarios
  scenarios: {
    priceObjection: string; priceObjectionDesc: string;
    notInterested: string; notInterestedDesc: string;
    thinkItOver: string; thinkItOverDesc: string;
    sendMeInfo: string; sendMeInfoDesc: string;
    coldOpener: string; coldOpenerDesc: string;
    discovery: string; discoveryDesc: string;
    closing: string; closingDesc: string;
    random: string; randomDesc: string;
    custom: string; customDesc: string;
  };
  // Analytics
  analytics: {
    title: string;
    subtitle: string;
    totalCalls: string;
    totalTime: string;
    avgScore: string;
    objections: string;
    noCalls: string;
    noCallsSub: string;
    callHistory: string;
    performance: string;
    callIntel: string;
    training: string;
    team: string;
    avgCloseProb: string;
    avgLeadScore: string;
    avgDuration: string;
    closeProbChart: (n: number) => string;
    callsByStage: string;
    activityDays: string;
    viewDetails: string;
    both: string;
    call: string;
    demoData: string;
    totalSessions: string;
    bestScore: string;
    lessonsTried: string;
    scoreSessions: (n: number) => string;
    bestPerLesson: string;
    avgClosePercent: string;
    bestCall: string;
    callsWon: string;
    activeStages: string;
    mostCalls: string;
    bestStageAvg: string;
    highScores: string;
    mastered: string;
    avgBest: string;
    totalAttempts: string;
    activeDays: string;
    callAndTraining: string;
    callOnly: string;
    trainingOnly: string;
    trainingLabel: string;
    topObjections: string;
    winningPatterns: string;
    stageDistribution: string;
    bestDayToCall: string;
    objectionToCloseRate: string;
    objectionCloseRateDesc: string;
    closeProbOverTime: string;
    repScoreTrend: (n: number) => string;
    fullCallLog: string;
    callVolumeByStage: string;
    perStageBreakdown: string;
    dayGrid28: string;
    dailyBreakdown: string;
    callDay: string;
    daysOff: string;
    teamLeaderboard: string;
    managerCreateTeam: string;
    repJoinTeam: string;
    teamCodeDesc: string;
    teamJoinDesc: string;
    codeCopied: string;
    teamCodeCreated: string;
    joinedTeamMsg: (code: string) => string;
    currentlyInTeam: string;
    copyBtn: string;
    generateTeamCode: string;
    joinBtn: string;
    teamCodePlaceholder: string;
    colDate: string;
    colDuration: string;
    colClosePercent: string;
    colLeadScore: string;
    colStage: string;
    colObjections: string;
    colCalls: string;
    colAvgClosePercent: string;
    colAvgDuration: string;
    colRep: string;
    colTraining: string;
    colStreak: string;
    closeProbDetail: string;
    closeProbDetailSub: string;
    callsByStageDetail: string;
    callsByStageDetailSub: string;
    activityLogDetail: string;
    activityLogDetailSub: string;
    avgRepScore: string;
    avgTalkRatio: string;
    avgCloseProbLabel: string;
    successWhenHandled: (pct: number) => string;
    objZero: string;
    objOne: string;
    objTwoPlus: string;
    callsUnit: string;
    winPatternDuration: (botDur: string) => string;
    winPatternObjections: (botObj: string) => string;
    winPatternCloseStage: (otherP: number) => string;
    objPriceBudget: string;
    objNotRightTime: string;
    objAlreadyVendor: string;
    objNotInterested: string;
    techAnchorROI: string;
    techFuturePace: string;
    techContrast: string;
  };
  // Training extra
  trainingExtra: {
    practiceTitle: string;
    practiceDesc: string;
    practiceFeature1: string;
    practiceFeature2: string;
    practiceFeature3: string;
    practiceCta: string;
    academyTitle: string;
    academyDesc: string;
    academyFeature1: string;
    academyFeature2: string;
    academyFeature3: string;
    academyCta: string;
    backToSelection: string;
    switchToAcademy: string;
    switchToPractice: string;
  };
  // Pre-call
  precall: {
    title: string;
    prospectName: string;
    prospectNamePlaceholder: string;
    company: string;
    companyPlaceholder: string;
    callGoal: string;
    callGoalPlaceholder: string;
    yourPitch: string;
    yourPitchPlaceholder: string;
    language: string;
    startCall: string;
  };
  // Live call
  liveCall: {
    endCall: string;
    mute: string;
    unmute: string;
    aiSuggestions: string;
    transcript: string;
    closeProbability: string;
    stage: string;
    note: string;
    addNote: string;
    listening: string;
    liveMode: string;
    noProspect: string;
    active: string;
    standby: string;
    objections: string;
    closeProb: string;
    aiFeed: string;
    coaching: string;
    readyToAssist: string;
    readyDesc: string;
    transcriptFeed: string;
    live: string;
    you: string;
    prospect: string;
    system: string;
    listeningStatus: string;
    micStarting: string;
    typeProspect: string;
    typeRep?: string;
    leadProfile: string;
    name: string;
    company: string;
    goal: string;
    pitch: string;
    callStats: string;
    quickActions: string;
    callNotes: string;
    noLeadData: string;
    summarizeCall: string;
    generateEmail: string;
    exportLead: string;
    scoreLead: string;
    stageOpener: string;
    stageDiscovery: string;
    stagePitch: string;
    stageClose: string;
  };
  // Post-call
  postcall: {
    title: string;
    summary: string;
    transcript: string;
    newCall: string;
    backToDashboard: string;
    followUp: string;
    copyEmail: string;
    notes: string;
    addNote: string;
    saveNote: string;
    duration: string;
    score: string;
    objections: string;
    leadScore: string;
    entries: string;
    stageReached: string;
    savedToCrm: string;
    download: string;
  };
  // Auth
  auth: {
    signIn: string;
    signUp: string;
    email: string;
    password: string;
    forgotPassword: string;
    continueWithGoogle: string;
    alreadyHaveAccount: string;
    dontHaveAccount: string;
    backToHome: string;
  };
  // Onboarding
  onboarding: {
    welcome: string;
    yourName: string;
    yourNamePlaceholder: string;
    yourRole: string;
    yourRolePlaceholder: string;
    whatYouSell: string;
    whatYouSellPlaceholder: string;
    language: string;
    letsGo: string;
  };
  // Upload call
  upload: {
    title: string;
    subtitle: string;
    dropzone: string;
    analyzing: string;
    browseFiles: string;
  };
  // Error messages — optional so existing compact language objects don't need updating;
  // screens fall back to English when undefined
  errors?: {
    required: string;
    saveLead: string;
    fileRead: string;
    transcriptParse: string;
  };
}

// ─── Translation data ─────────────────────────────────────────────────────────

const en: T = {
  nav: {
    dashboard: 'Dashboard',
    training: 'Training',
    analytics: 'Analytics',
    leads: 'Leads',
    meetings: 'Meetings',
    newCall: '▶ New Call',
    upload: '↑ Upload',
  },
  common: {
    back: 'Back',
    cancel: 'Cancel',
    save: 'Save',
    send: 'Send',
    start: 'Start',
    done: 'Done',
    close: 'Close',
    loading: 'Loading...',
    signOut: 'Sign out',
    next: 'Next',
    skip: 'Skip',
    edit: 'Edit',
    delete: 'Delete',
    confirm: 'Confirm',
    tryAgain: 'Try again',
    learnMore: 'Learn more',
    or: 'or',
  },
  profile: {
    activity: 'ACTIVITY',
    appearance: 'APPEARANCE',
    dark: 'Dark',
    light: 'Light',
    calls: n => `${n} call${n !== 1 ? 's' : ''}`,
    trainingSessions: n => `${n} training session${n !== 1 ? 's' : ''}`,
    totalOnPlatform: 'total on platform',
    maxRank: '✦ Max rank achieved',
    appLanguage: 'App language',
    langNote: 'Affects coaching and training language. Override per call in Pre-Call Setup.',
  },
  tiers: {
    title: 'Rank Tiers',
    subtitle: 'Unlock tiers by completing real calls and training sessions. Both must meet the threshold to advance.',
    unlocked: 'Unlocked',
    noCalls: 'No calls required',
    noSessions: 'No sessions required',
    calls: 'calls',
    sessions: 'training sessions',
    percentThere: '% there',
  },
  dashboard: {
    greeting: name => `Welcome back${name ? `, ${name}` : ''}`,
    tagline: 'Your personal AI sales coach',
    streakMessage: n => `${n}-day practice streak — keep the momentum!`,
    recentCalls: 'Recent Calls',
    noCalls: 'No calls yet',
    noCallsSub: 'Start your first call to see your history here.',
    startCall: 'Start New Call',
    uploadCall: 'Upload Recording',
    duration: 'Duration',
    score: 'Score',
    stage: 'Stage',
    viewSession: 'View',
    deleteSession: 'Delete',
    totalCalls: 'Total Calls',
    avgCloseProb: 'Avg Close Prob',
    totalObjections: 'Total Objections',
    avgDuration: 'Avg Duration',
    practiceStreak: 'Practice Streak',
    total: 'total',
    overview: 'Overview',
    contacts: 'Contacts',
    contactsSub: 'All prospects from your call history',
    noContacts: 'No contacts yet',
    noContactsSub: 'Complete a call to see contacts appear here automatically.',
    noResults: 'No results',
    searchPlaceholder: 'Search by name or company…',
    latestScore: 'Latest Score',
    bestCloseProb: 'Best Close Prob',
    latestSummary: 'Latest AI Summary',
    latestNotes: 'Latest Call Notes',
    latestEmail: 'Latest Follow-Up Email',
    callHistory: 'Call History',
    copy: 'Copy',
    copied: 'Copied',
    callCount: n => `${n} ${n === 1 ? 'call' : 'calls'}`,
  },
  training: {
    title: 'Training Mode',
    subtitle: 'Pick a scenario. The AI plays the prospect. End the call when you\'re ready for your coaching report.',
    language: 'LANGUAGE',
    startTraining: 'Start Training',
    endSession: 'End Session',
    practicing: 'Practicing',
    yourResponse: 'Your response...',
    generating: 'Generating...',
    sessionComplete: 'Session Complete',
    practiceAgain: 'Practice Again',
    backToDashboard: 'Back to Dashboard',
    quota: (used, total) => `${total - used} of ${total} sessions remaining this month`,
    quotaExhausted: total => `Monthly limit reached — upgrade to continue. (${total} sessions used)`,
    setupContext: 'Set up your scenario',
    whatSelling: 'What are you selling?',
    whatSellingPlaceholder: 'e.g. SaaS tool, consulting service, insurance...',
    selectSub: 'Select a sub-scenario',
    difficulty: 'Difficulty',
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
    customScenario: 'Describe your scenario',
    customPlaceholder: 'Describe the prospect and situation...',
    sessionHistory: 'Session History',
    exchanges: n => `${n} exchange${n !== 1 ? 's' : ''}`,
    score: 'Score',
    keyTakeaway: 'KEY TAKEAWAY',
    strengths: '✓ What you did well',
    improvements: '✗ What to work on',
    practice: 'Practice',
    academy: 'Academy',
    loadingAcademy: 'Loading Academy...',
    generatingReport: 'Generating your coaching report...',
    scenarioLabel: 'SCENARIO',
    recent: 'RECENT',
    describeProspect: 'Describe your prospect',
    describeProspectSub: 'Tell the AI who they are, their attitude, and their situation.',
    whatSellingContextSub: 'Give the AI context so it can simulate a realistic prospect for your industry.',
    prospectSpeaking: 'PROSPECT SPEAKING',
    yourTurn: 'YOUR TURN',
    aiThinking: 'AI THINKING...',
    waiting: 'WAITING...',
  },
  scenarios: {
    priceObjection: 'Price Objection', priceObjectionDesc: 'Prospect says it\'s too expensive',
    notInterested: 'Not Interested', notInterestedDesc: 'Prospect wants to end the call',
    thinkItOver: 'Think It Over', thinkItOverDesc: 'Prospect is stalling for time',
    sendMeInfo: 'Send Me Info', sendMeInfoDesc: 'Prospect deflects with email request',
    coldOpener: 'Cold Opener', coldOpenerDesc: 'Start a cold call from scratch',
    discovery: 'Discovery', discoveryDesc: 'Uncover pain points and needs',
    closing: 'Closing', closingDesc: 'Push for commitment at the end',
    random: 'Random Scenario', randomDesc: 'AI generates a surprise situation',
    custom: 'Custom Scenario', customDesc: 'Describe your own prospect persona',
  },
  analytics: {
    title: 'Analytics',
    subtitle: 'Performance trends across calls and training',
    totalCalls: 'Total Calls',
    totalTime: 'Total Time',
    avgScore: 'Avg. Score',
    objections: 'Objections Handled',
    noCalls: 'No data yet',
    noCallsSub: 'Complete some calls to see your analytics.',
    callHistory: 'Call History',
    performance: 'Performance',
    callIntel: 'Call Intel',
    training: 'Training',
    team: 'Team',
    avgCloseProb: 'Avg Close Prob',
    avgLeadScore: 'Avg Lead Score',
    avgDuration: 'Avg Duration',
    closeProbChart: n => `Close Probability — Last ${n} Calls`,
    callsByStage: 'Calls by Final Stage',
    activityDays: 'Activity — Last 28 Days',
    viewDetails: 'View Details →',
    both: 'Both',
    call: 'Call',
    demoData: 'Demo Data',
    totalSessions: 'Total Sessions',
    bestScore: 'Best Score',
    lessonsTried: 'Lessons Tried',
    scoreSessions: n => `Score — Last ${n} Sessions`,
    bestPerLesson: 'Best Score Per Lesson',
    avgClosePercent: 'Avg Close %',
    bestCall: 'Best Call',
    callsWon: 'Calls Won',
    activeStages: 'Active Stages',
    mostCalls: 'Most Calls',
    bestStageAvg: 'Best Stage Avg',
    highScores: 'High Scores',
    mastered: 'Mastered',
    avgBest: 'Avg Best',
    totalAttempts: 'Total Attempts',
    activeDays: 'Active Days',
    callAndTraining: 'Call + Training',
    callOnly: 'Call Only',
    trainingOnly: 'Training Only',
    trainingLabel: 'Training',
    topObjections: 'Top Objections & Techniques',
    winningPatterns: 'Winning Patterns',
    stageDistribution: 'Stage Distribution',
    bestDayToCall: 'Best Day to Call',
    objectionToCloseRate: 'Objection-to-Close Rate',
    objectionCloseRateDesc: 'How your close probability shifts based on how many objections came up on a call.',
    closeProbOverTime: 'Close Probability Over Time',
    repScoreTrend: n => `Rep Score Trend (${n} calls)`,
    fullCallLog: 'Full Call Log',
    callVolumeByStage: 'Call Volume by Stage',
    perStageBreakdown: 'Per-Stage Breakdown',
    dayGrid28: '28-Day Grid',
    dailyBreakdown: 'Daily Breakdown',
    callDay: 'Call day',
    daysOff: 'Days Off',
    teamLeaderboard: 'Team Leaderboard — This Month',
    managerCreateTeam: 'Manager — Create Team',
    repJoinTeam: 'Rep — Join a Team',
    teamCodeDesc: "Generate a team code and share it with your reps to connect everyone's stats.",
    teamJoinDesc: 'Enter the code your manager shared to join their team and appear in the leaderboard.',
    codeCopied: 'Code copied!',
    teamCodeCreated: 'Team code created. Share it with your reps.',
    joinedTeamMsg: code => `Joined team ${code}.`,
    currentlyInTeam: 'Currently in team: ',
    copyBtn: '⎘ Copy',
    generateTeamCode: 'Generate Team Code',
    joinBtn: 'Join',
    teamCodePlaceholder: 'Team code (e.g. ABC123)',
    colDate: 'Date', colDuration: 'Duration', colClosePercent: 'Close %', colLeadScore: 'Lead Score', colStage: 'Stage', colObjections: 'Objections', colCalls: 'Calls', colAvgClosePercent: 'Avg Close %', colAvgDuration: 'Avg Duration', colRep: 'Rep', colTraining: 'Training', colStreak: 'Streak',
    closeProbDetail: 'Close Probability', closeProbDetailSub: 'Win-rate trend across every recorded call',
    callsByStageDetail: 'Calls by Stage', callsByStageDetailSub: 'Where your calls are ending — and how they perform at each stage',
    activityLogDetail: 'Activity Log', activityLogDetailSub: 'Daily call activity over the last 28 days',
    avgRepScore: 'Avg Rep Score', avgTalkRatio: 'Avg Talk Ratio', avgCloseProbLabel: 'avg close probability',
    successWhenHandled: pct => `${pct}% success when handled`,
    objZero: '0 objections', objOne: '1 objection', objTwoPlus: '2+ objections', callsUnit: 'calls',
    winPatternDuration: botDur => `avg duration on your top-performing calls vs ${botDur} on lower-performing ones`,
    winPatternObjections: botObj => `avg objections on winning calls vs ${botObj} on losing ones — handling early matters`,
    winPatternCloseStage: otherP => `avg close probability on calls that reached Close stage vs ${otherP}% on earlier-stage calls`,
    objPriceBudget: 'Price / budget concern', objNotRightTime: 'Not the right time', objAlreadyVendor: 'Already have a vendor', objNotInterested: 'Not interested',
    techAnchorROI: 'Anchor to ROI — tie cost to the value saved or problem avoided',
    techFuturePace: 'Future-pace the delay cost — show what waiting costs them',
    techContrast: 'Contrast positioning — isolate the one thing you do better',
  },
  trainingExtra: {
    practiceTitle: 'Practice Scenarios',
    practiceDesc: 'Train with AI-powered prospect simulations. Get instant coaching feedback on every reply.',
    practiceFeature1: '9 unique sales scenarios',
    practiceFeature2: 'Easy, medium, and brutal difficulty',
    practiceFeature3: 'Full coaching report at the end of every session',
    practiceCta: 'Start Practicing →',
    academyTitle: 'AI Academy',
    academyDesc: 'Structured lessons designed to build real sales skill — from cold openers to closing hard deals.',
    academyFeature1: '3 skill levels — Beginner to Advanced',
    academyFeature2: '27 lessons: taught first, then tested',
    academyFeature3: 'Track your scores and improvement',
    academyCta: 'Start Learning →',
    backToSelection: '← Back to selection',
    switchToAcademy: 'Switch to Academy ◈',
    switchToPractice: 'Switch to Practice ◎',
  },
  precall: {
    title: 'Pre-Call Setup',
    prospectName: 'Prospect Name',
    prospectNamePlaceholder: 'e.g. John Smith',
    company: 'Company',
    companyPlaceholder: 'e.g. Acme Corp',
    callGoal: 'Call Goal',
    callGoalPlaceholder: 'e.g. Book a demo, close the deal...',
    yourPitch: 'Your Pitch / Product',
    yourPitchPlaceholder: 'What are you selling?',
    language: 'Language',
    startCall: 'Start Call',
  },
  liveCall: {
    endCall: 'End Call', mute: 'Mute', unmute: 'Unmute', aiSuggestions: 'AI Suggestions', transcript: 'Transcript', closeProbability: 'Close Probability', stage: 'Stage', note: 'Note', addNote: 'Add note...', listening: 'Listening...', liveMode: 'LIVE MODE', noProspect: 'No prospect', active: 'ACTIVE', standby: 'STANDBY', objections: 'OBJECTIONS', closeProb: 'CLOSE PROB', aiFeed: 'AI INTELLIGENCE FEED', coaching: 'COACHING', readyToAssist: 'Ready to Assist', readyDesc: 'Click Listen in the transcript panel to start your mic. I\'ll detect objections, buying signals, and coach you in real-time.', transcriptFeed: 'TRANSCRIPT FEED', live: 'LIVE', you: 'YOU', prospect: 'PROSPECT', system: 'SYSTEM', listeningStatus: 'Listening — speakers are detected automatically.', micStarting: 'Mic starting... or type prospect dialogue below.', typeProspect: 'Type what the prospect said...', typeRep: 'Type your response...', leadProfile: 'LEAD PROFILE', name: 'Name', company: 'Company', goal: 'Goal', pitch: 'Pitch', callStats: 'CALL STATS', quickActions: 'QUICK ACTIONS', callNotes: 'CALL NOTES', noLeadData: 'No lead data extracted yet. Start a conversation to build the profile.', summarizeCall: 'Summarize call', generateEmail: 'Generate follow-up email', exportLead: 'Export lead data', scoreLead: 'Score this lead', stageOpener: 'OPENER', stageDiscovery: 'DISCOVERY', stagePitch: 'PITCH', stageClose: 'CLOSE',
  },
  postcall: {
    title: 'Call Review',
    summary: 'Summary',
    transcript: 'Transcript',
    newCall: 'New Call',
    backToDashboard: 'Back to Dashboard',
    followUp: 'Follow-up Email',
    copyEmail: 'Copy Email',
    notes: 'Notes',
    addNote: 'Add a note...',
    saveNote: 'Save',
    duration: 'Duration',
    score: 'Close Score',
    objections: 'Objections',
    leadScore: 'Lead Score',
    entries: 'Entries',
    stageReached: 'Stage Reached',
    savedToCrm: 'Saved to CRM',
    download: 'Download .TXT',
  },
  auth: {
    signIn: 'Sign in',
    signUp: 'Sign up',
    email: 'Email',
    password: 'Password',
    forgotPassword: 'Forgot password?',
    continueWithGoogle: 'Continue with Google',
    alreadyHaveAccount: 'Already have an account?',
    dontHaveAccount: "Don't have an account?",
    backToHome: 'Back to home',
  },
  onboarding: {
    welcome: 'Welcome to Pitchbase',
    yourName: 'Your Name',
    yourNamePlaceholder: 'e.g. Alex Johnson',
    yourRole: 'Your Role',
    yourRolePlaceholder: 'e.g. Account Executive',
    whatYouSell: 'What do you sell?',
    whatYouSellPlaceholder: 'e.g. SaaS, consulting, insurance...',
    language: 'Preferred Language',
    letsGo: "Let's go →",
  },
  upload: {
    title: 'Upload Call Recording',
    subtitle: 'Upload a call recording to get AI coaching and a full debrief.',
    dropzone: 'Drop your audio file here',
    analyzing: 'Analyzing your call...',
    browseFiles: 'Browse files',
  },
  errors: {
    required: 'Required',
    saveLead: 'Failed to save lead. Try again.',
    fileRead: 'Could not read file. Please try another file.',
    transcriptParse: 'Could not parse the transcript. Check the format and try again.',
  },
};

const es: T = {
  nav: { dashboard: 'Panel', training: 'Entrenamiento', analytics: 'Análisis', leads: 'Clientes', meetings: 'Reuniones', newCall: '▶ Nueva Llamada', upload: '↑ Subir' },
  common: { back: 'Volver', cancel: 'Cancelar', save: 'Guardar', send: 'Enviar', start: 'Iniciar', done: 'Hecho', close: 'Cerrar', loading: 'Cargando...', signOut: 'Cerrar sesión', next: 'Siguiente', skip: 'Omitir', edit: 'Editar', delete: 'Eliminar', confirm: 'Confirmar', tryAgain: 'Intentar de nuevo', learnMore: 'Saber más', or: 'o' },
  profile: { activity: 'ACTIVIDAD', appearance: 'APARIENCIA', dark: 'Oscuro', light: 'Claro', calls: n => `${n} llamada${n !== 1 ? 's' : ''}`, trainingSessions: n => `${n} sesión${n !== 1 ? 'es' : ''} de entrenamiento`, totalOnPlatform: 'total en la plataforma', maxRank: '✦ Rango máximo alcanzado', appLanguage: 'Idioma de la app', langNote: 'Afecta el idioma del coaching y el entrenamiento. Se puede cambiar por llamada en la configuración previa.' },
  tiers: { title: 'Niveles de Rango', subtitle: 'Desbloquea niveles completando llamadas reales y sesiones de entrenamiento. Ambos deben alcanzar el umbral para avanzar.', unlocked: 'Desbloqueado', noCalls: 'Sin llamadas requeridas', noSessions: 'Sin sesiones requeridas', calls: 'llamadas', sessions: 'sesiones de entrenamiento', percentThere: '% ahí' },
  dashboard: { greeting: name => `Bienvenido de nuevo${name ? `, ${name}` : ''}`, tagline: 'Tu entrenador de ventas AI personal', streakMessage: n => `Racha de ${n} día${n !== 1 ? 's' : ''} — ¡sigue así!`, recentCalls: 'Llamadas Recientes', noCalls: 'Sin llamadas aún', noCallsSub: 'Inicia tu primera llamada para ver tu historial aquí.', startCall: 'Nueva Llamada', uploadCall: 'Subir Grabación', duration: 'Duración', score: 'Puntuación', stage: 'Etapa', viewSession: 'Ver', deleteSession: 'Eliminar', totalCalls: 'Total Llamadas', avgCloseProb: 'Prob. Cierre Prom.', totalObjections: 'Total Objeciones', avgDuration: 'Duración Prom.', practiceStreak: 'Racha de Práctica', total: 'total', overview: 'Resumen', contacts: 'Contactos', contactsSub: 'Todos los prospectos de tu historial', noContacts: 'Sin contactos aún', noContactsSub: 'Completa una llamada para ver los contactos aquí.', noResults: 'Sin resultados', searchPlaceholder: 'Buscar por nombre o empresa…', latestScore: 'Última Puntuación', bestCloseProb: 'Mejor Prob. Cierre', latestSummary: 'Último Resumen AI', latestNotes: 'Últimas Notas', latestEmail: 'Último Email de Seguimiento', callHistory: 'Historial de Llamadas', copy: 'Copiar', copied: 'Copiado', callCount: n => `${n} ${n === 1 ? 'llamada' : 'llamadas'}` },
  training: { title: 'Modo de Entrenamiento', subtitle: 'Elige un escenario. La IA interpreta al prospecto. Termina la llamada cuando estés listo para tu informe.', language: 'IDIOMA', startTraining: 'Iniciar Entrenamiento', endSession: 'Terminar Sesión', practicing: 'Practicando', yourResponse: 'Tu respuesta...', generating: 'Generando...', sessionComplete: 'Sesión Completa', practiceAgain: 'Practicar de Nuevo', backToDashboard: 'Volver al Panel', quota: (u, t) => `${u} / ${t} sesiones usadas este mes`, quotaExhausted: t => `Límite mensual alcanzado — ${t} sesiones usadas. Se restablece el próximo mes.`, setupContext: 'Configura tu escenario', whatSelling: '¿Qué estás vendiendo?', whatSellingPlaceholder: 'p.ej. software, consultoría, seguros...', selectSub: 'Selecciona un sub-escenario', difficulty: 'Dificultad', easy: 'Fácil', medium: 'Medio', hard: 'Difícil', customScenario: 'Describe tu escenario', customPlaceholder: 'Describe el prospecto y la situación...', sessionHistory: 'Historial de Sesiones', exchanges: n => `${n} intercambio${n !== 1 ? 's' : ''}`, score: 'Puntuación', keyTakeaway: 'CONCLUSIÓN CLAVE', strengths: '✓ Lo que hiciste bien', improvements: '✗ En qué trabajar', practice: 'Práctica', academy: 'Academia', loadingAcademy: 'Cargando Academia...', generatingReport: 'Generando tu informe de coaching...', scenarioLabel: 'ESCENARIO', recent: 'RECIENTES', describeProspect: 'Describe tu prospecto', describeProspectSub: 'Cuéntale a la IA quiénes son, su actitud y su situación.', whatSellingContextSub: 'Dale contexto a la IA para que simule un prospecto realista para tu industria.', prospectSpeaking: 'PROSPECTO HABLANDO', yourTurn: 'TU TURNO', aiThinking: 'IA PENSANDO...', waiting: 'ESPERANDO...' },
  scenarios: { priceObjection: 'Objeción de Precio', priceObjectionDesc: 'El prospecto dice que es muy caro', notInterested: 'No Interesado', notInterestedDesc: 'El prospecto quiere terminar la llamada', thinkItOver: 'Lo Pensaré', thinkItOverDesc: 'El prospecto está ganando tiempo', sendMeInfo: 'Envíame Info', sendMeInfoDesc: 'El prospecto esquiva con una solicitud de email', coldOpener: 'Apertura en Frío', coldOpenerDesc: 'Comenzar una llamada en frío desde cero', discovery: 'Descubrimiento', discoveryDesc: 'Descubrir puntos de dolor y necesidades', closing: 'Cierre', closingDesc: 'Buscar el compromiso al final', random: 'Escenario Aleatorio', randomDesc: 'La IA genera una situación sorpresa', custom: 'Escenario Personalizado', customDesc: 'Describe tu propia persona de prospecto' },
  analytics: { avgClosePercent: 'Prob. Cierre Prom.', bestCall: 'Mejor Llamada', callsWon: 'Llamadas Ganadas', activeStages: 'Etapas Activas', mostCalls: 'Más Llamadas', bestStageAvg: 'Mejor Etapa Prom.', highScores: 'Puntuaciones Altas', mastered: 'Dominadas', avgBest: 'Mejor Prom.', totalAttempts: 'Total Intentos', activeDays: 'Días Activos', callAndTraining: 'Llamada + Entrenamiento', callOnly: 'Solo Llamada', trainingOnly: 'Solo Entrenamiento', trainingLabel: 'Entrenamiento', title: 'Análisis', subtitle: 'Tendencias de rendimiento en llamadas y entrenamiento', totalCalls: 'Total de Llamadas', totalTime: 'Tiempo Total', avgScore: 'Puntuación Media', objections: 'Objeciones Manejadas', noCalls: 'Sin datos aún', noCallsSub: 'Completa algunas llamadas para ver tus análisis.', callHistory: 'Historial de Llamadas', performance: 'Rendimiento', callIntel: 'Inteligencia', training: 'Entrenamiento', team: 'Equipo', avgCloseProb: 'Prob. Cierre Prom.', avgLeadScore: 'Puntuación Lead Prom.', avgDuration: 'Duración Prom.', closeProbChart: n => `Prob. Cierre — Últimas ${n} Llamadas`, callsByStage: 'Llamadas por Etapa', activityDays: 'Actividad — Últimos 28 Días', viewDetails: 'Ver Detalles →', both: 'Ambos', call: 'Llamada', demoData: 'Datos Demo', totalSessions: 'Total Sesiones', bestScore: 'Mejor Puntuación', lessonsTried: 'Lecciones Probadas', scoreSessions: n => `Puntuación — Últimas ${n} Sesiones`, bestPerLesson: 'Mejor Puntuación por Lección', topObjections: 'Principales Objeciones y Técnicas', winningPatterns: 'Patrones Ganadores', stageDistribution: 'Distribución por Etapas', bestDayToCall: 'Mejor Día para Llamar', objectionToCloseRate: 'Tasa Objeción-Cierre', objectionCloseRateDesc: 'Cómo cambia tu probabilidad de cierre según el número de objeciones en la llamada.', closeProbOverTime: 'Probabilidad de Cierre en el Tiempo', repScoreTrend: n => `Tendencia de Puntuación (${n} llamadas)`, fullCallLog: 'Registro Completo de Llamadas', callVolumeByStage: 'Volumen de Llamadas por Etapa', perStageBreakdown: 'Desglose por Etapa', dayGrid28: 'Cuadrícula de 28 Días', dailyBreakdown: 'Desglose Diario', callDay: 'Día de llamada', daysOff: 'Días sin llamadas', teamLeaderboard: 'Clasificación del Equipo — Este Mes', managerCreateTeam: 'Gerente — Crear Equipo', repJoinTeam: 'Rep — Unirse a un Equipo', teamCodeDesc: "Genera un código de equipo y compártelo con tus representantes para conectar las estadísticas de todos.", teamJoinDesc: 'Ingresa el código que compartió tu gerente para unirte a su equipo y aparecer en la clasificación.', codeCopied: '¡Código copiado!', teamCodeCreated: 'Código de equipo creado. Compártelo con tus representantes.', joinedTeamMsg: code => `Te uniste al equipo ${code}.`, currentlyInTeam: 'Equipo actual: ', copyBtn: '⎘ Copiar', generateTeamCode: 'Generar Código de Equipo', joinBtn: 'Unirse', teamCodePlaceholder: 'Código del equipo (ej. ABC123)', colDate: 'Fecha', colDuration: 'Duración', colClosePercent: 'Cierre %', colLeadScore: 'Punt. Lead', colStage: 'Etapa', colObjections: 'Objeciones', colCalls: 'Llamadas', colAvgClosePercent: 'Cierre % Prom.', colAvgDuration: 'Duración Prom.', colRep: 'Rep', colTraining: 'Entrenamiento', colStreak: 'Racha', closeProbDetail: 'Probabilidad de Cierre', closeProbDetailSub: 'Tendencia de tasa de éxito en todas las llamadas registradas', callsByStageDetail: 'Llamadas por Etapa', callsByStageDetailSub: 'Dónde terminan tus llamadas y cómo rinden en cada etapa', activityLogDetail: 'Registro de Actividad', activityLogDetailSub: 'Actividad diaria de llamadas en los últimos 28 días', avgRepScore: 'Punt. Rep Prom.', avgTalkRatio: 'Ratio de Habla Prom.', avgCloseProbLabel: 'probabilidad de cierre promedio', successWhenHandled: pct => `${pct}% de éxito al gestionar`, objZero: '0 objeciones', objOne: '1 objeción', objTwoPlus: '2+ objeciones', callsUnit: 'llamadas', winPatternDuration: botDur => `duración media en tus llamadas de mayor rendimiento vs ${botDur} en las de menor rendimiento`, winPatternObjections: botObj => `objeciones medias en llamadas ganadoras vs ${botObj} en las perdedoras — gestionarlas pronto importa`, winPatternCloseStage: otherP => `probabilidad de cierre media en llamadas que alcanzaron la etapa Cierre vs ${otherP}% en etapas anteriores`, objPriceBudget: 'Precio / presupuesto', objNotRightTime: 'No es el momento', objAlreadyVendor: 'Ya tienen proveedor', objNotInterested: 'No interesado', techAnchorROI: 'Anclar al ROI — relaciona el costo con el valor ahorrado o el problema resuelto', techFuturePace: 'Anticipar el costo del retraso — muestra lo que cuesta esperar', techContrast: 'Posicionamiento por contraste — aísla lo único que haces mejor' },
  trainingExtra: { practiceTitle: 'Escenarios de Práctica', practiceDesc: 'Entrena con simulaciones de prospectos impulsadas por IA. Obtén retroalimentación inmediata en cada respuesta.', practiceFeature1: '9 escenarios de ventas únicos', practiceFeature2: 'Dificultad fácil, media y brutal', practiceFeature3: 'Informe completo al final de cada sesión', practiceCta: 'Empezar a Practicar →', academyTitle: 'Academia AI', academyDesc: 'Lecciones estructuradas para desarrollar habilidades reales de ventas.', academyFeature1: '3 niveles — Principiante a Avanzado', academyFeature2: '27 lecciones: primero enseñadas, luego evaluadas', academyFeature3: 'Rastrea tus puntuaciones y progreso', academyCta: 'Empezar a Aprender →', backToSelection: '← Volver a la selección', switchToAcademy: 'Cambiar a Academia ◈', switchToPractice: 'Cambiar a Práctica ◎' },
  precall: { title: 'Configuración Previa', prospectName: 'Nombre del Prospecto', prospectNamePlaceholder: 'p.ej. Juan García', company: 'Empresa', companyPlaceholder: 'p.ej. Acme Corp', callGoal: 'Objetivo de la Llamada', callGoalPlaceholder: 'p.ej. Reservar una demo, cerrar el trato...', yourPitch: 'Tu Propuesta / Producto', yourPitchPlaceholder: '¿Qué estás vendiendo?', language: 'Idioma', startCall: 'Iniciar Llamada' },
  liveCall: { endCall: 'Terminar Llamada', mute: 'Silenciar', unmute: 'Activar Micrófono', aiSuggestions: 'Sugerencias de IA', transcript: 'Transcripción', closeProbability: 'Prob. de Cierre', stage: 'Etapa', note: 'Nota', addNote: 'Añadir nota...', listening: 'Escuchando...', liveMode: 'MODO EN VIVO', noProspect: 'Sin prospecto', active: 'ACTIVO', standby: 'EN ESPERA', objections: 'OBJECIONES', closeProb: 'PROB. CIERRE', aiFeed: 'FEED DE INTELIGENCIA IA', coaching: 'COACHING', readyToAssist: 'Listo para Asistir', readyDesc: 'Haz clic en Escuchar en el panel de transcripción para activar el micrófono.', transcriptFeed: 'FEED DE TRANSCRIPCIÓN', live: 'EN VIVO', you: 'TÚ', prospect: 'PROSPECTO', system: 'SISTEMA', listeningStatus: 'Escuchando — los hablantes se detectan automáticamente.', micStarting: 'Iniciando micrófono... o escribe el diálogo del prospecto abajo.', typeProspect: 'Escribe lo que dijo el prospecto...', leadProfile: 'PERFIL DEL PROSPECTO', name: 'Nombre', company: 'Empresa', goal: 'Objetivo', pitch: 'Propuesta', callStats: 'ESTADÍSTICAS', quickActions: 'ACCIONES RÁPIDAS', callNotes: 'NOTAS DE LLAMADA', noLeadData: 'Sin datos de prospecto aún. Inicia una conversación para construir el perfil.', summarizeCall: 'Resumir llamada', generateEmail: 'Generar email de seguimiento', exportLead: 'Exportar datos del prospecto', scoreLead: 'Puntuar este prospecto', stageOpener: 'APERTURA', stageDiscovery: 'DESCUBRIMIENTO', stagePitch: 'PROPUESTA', stageClose: 'CIERRE' },
  postcall: { title: 'Revisión de Llamada', summary: 'Resumen', transcript: 'Transcripción', newCall: 'Nueva Llamada', backToDashboard: 'Volver al Panel', followUp: 'Correo de Seguimiento', copyEmail: 'Copiar Correo', notes: 'Notas', addNote: 'Añadir nota...', saveNote: 'Guardar', duration: 'Duración', score: 'Puntuación de Cierre', objections: 'Objeciones', leadScore: 'Puntuación del Prospecto', entries: 'Entradas', stageReached: 'Etapa Alcanzada', savedToCrm: 'Guardado en CRM', download: 'Descargar .TXT' },
  auth: { signIn: 'Iniciar sesión', signUp: 'Registrarse', email: 'Correo electrónico', password: 'Contraseña', forgotPassword: '¿Olvidaste tu contraseña?', continueWithGoogle: 'Continuar con Google', alreadyHaveAccount: '¿Ya tienes cuenta?', dontHaveAccount: '¿No tienes cuenta?', backToHome: 'Volver al inicio' },
  onboarding: { welcome: 'Bienvenido a Pitchbase', yourName: 'Tu Nombre', yourNamePlaceholder: 'p.ej. Alex García', yourRole: 'Tu Rol', yourRolePlaceholder: 'p.ej. Ejecutivo de Cuentas', whatYouSell: '¿Qué vendes?', whatYouSellPlaceholder: 'p.ej. SaaS, consultoría, seguros...', language: 'Idioma Preferido', letsGo: 'Vamos →' },
  upload: { title: 'Subir Grabación', subtitle: 'Sube una grabación para obtener coaching de IA y un resumen completo.', dropzone: 'Suelta tu archivo de audio aquí', analyzing: 'Analizando tu llamada...', browseFiles: 'Buscar archivos' },
};

const fr: T = {
  nav: { dashboard: 'Tableau de bord', training: 'Entraînement', analytics: 'Analytique', leads: 'Prospects', meetings: 'Réunions', newCall: '▶ Nouvel Appel', upload: '↑ Importer' },
  common: { back: 'Retour', cancel: 'Annuler', save: 'Enregistrer', send: 'Envoyer', start: 'Démarrer', done: 'Terminé', close: 'Fermer', loading: 'Chargement...', signOut: 'Se déconnecter', next: 'Suivant', skip: 'Passer', edit: 'Modifier', delete: 'Supprimer', confirm: 'Confirmer', tryAgain: 'Réessayer', learnMore: 'En savoir plus', or: 'ou' },
  profile: { activity: 'ACTIVITÉ', appearance: 'APPARENCE', dark: 'Sombre', light: 'Clair', calls: n => `${n} appel${n !== 1 ? 's' : ''}`, trainingSessions: n => `${n} session${n !== 1 ? 's' : ''} d'entraînement`, totalOnPlatform: 'total sur la plateforme', maxRank: '✦ Rang maximum atteint', appLanguage: 'Langue de l\'app', langNote: 'Affecte la langue du coaching et de l\'entraînement. Peut être changé par appel dans la configuration.' },
  tiers: { title: 'Niveaux de Rang', subtitle: 'Débloquez les niveaux en complétant des appels réels et des sessions d\'entraînement. Les deux doivent atteindre le seuil pour progresser.', unlocked: 'Débloqué', noCalls: 'Aucun appel requis', noSessions: 'Aucune session requise', calls: 'appels', sessions: 'sessions d\'entraînement', percentThere: '% accompli' },
  dashboard: { greeting: name => `Bon retour${name ? `, ${name}` : ''}`, tagline: 'Votre coach de vente AI personnel', streakMessage: n => `Série de ${n} jour${n !== 1 ? 's' : ''} — continuez !`, recentCalls: 'Appels Récents', noCalls: 'Aucun appel encore', noCallsSub: 'Commencez votre premier appel pour voir votre historique ici.', startCall: 'Nouvel Appel', uploadCall: 'Importer Enregistrement', duration: 'Durée', score: 'Score', stage: 'Étape', viewSession: 'Voir', deleteSession: 'Supprimer', totalCalls: 'Total Appels', avgCloseProb: 'Prob. Clôture Moy.', totalObjections: 'Total Objections', avgDuration: 'Durée Moy.', practiceStreak: 'Série de Pratique', total: 'total', overview: 'Aperçu', contacts: 'Contacts', contactsSub: 'Tous les prospects de votre historique', noContacts: 'Aucun contact encore', noContactsSub: 'Complétez un appel pour voir les contacts ici.', noResults: 'Aucun résultat', searchPlaceholder: 'Rechercher par nom ou entreprise…', latestScore: 'Dernier Score', bestCloseProb: 'Meilleure Prob. Clôture', latestSummary: 'Dernier Résumé AI', latestNotes: 'Dernières Notes', latestEmail: 'Dernier E-mail de Suivi', callHistory: 'Historique des Appels', copy: 'Copier', copied: 'Copié', callCount: n => `${n} appel${n !== 1 ? 's' : ''}` },
  training: { title: 'Mode Entraînement', subtitle: 'Choisissez un scénario. L\'IA joue le prospect. Terminez l\'appel quand vous êtes prêt pour votre rapport.', language: 'LANGUE', startTraining: 'Démarrer l\'Entraînement', endSession: 'Terminer la Session', practicing: 'En pratique', yourResponse: 'Votre réponse...', generating: 'Génération...', sessionComplete: 'Session Terminée', practiceAgain: 'Pratiquer à Nouveau', backToDashboard: 'Retour au Tableau de Bord', quota: (u, t) => `${u} / ${t} sessions utilisées ce mois`, quotaExhausted: t => `Limite mensuelle atteinte — ${t} sessions utilisées. Se réinitialise le mois prochain.`, setupContext: 'Configurez votre scénario', whatSelling: 'Que vendez-vous ?', whatSellingPlaceholder: 'ex. logiciel SaaS, conseil, assurance...', selectSub: 'Sélectionnez un sous-scénario', difficulty: 'Difficulté', easy: 'Facile', medium: 'Moyen', hard: 'Difficile', customScenario: 'Décrivez votre scénario', customPlaceholder: 'Décrivez le prospect et la situation...', sessionHistory: 'Historique des Sessions', exchanges: n => `${n} échange${n !== 1 ? 's' : ''}`, score: 'Score', keyTakeaway: 'POINT CLÉ', strengths: '✓ Ce que vous avez bien fait', improvements: '✗ Ce sur quoi travailler', practice: 'Pratique', academy: 'Académie', loadingAcademy: 'Chargement de l\'Académie...', generatingReport: 'Génération de votre rapport de coaching...', scenarioLabel: 'SCÉNARIO', recent: 'RÉCENT', describeProspect: 'Décrivez votre prospect', describeProspectSub: 'Décrivez à l\'IA qui ils sont, leur attitude et leur situation.', whatSellingContextSub: 'Donnez du contexte à l\'IA pour simuler un prospect réaliste dans votre secteur.', prospectSpeaking: 'PROSPECT EN PAROLE', yourTurn: 'VOTRE TOUR', aiThinking: 'IA EN RÉFLEXION...', waiting: 'EN ATTENTE...' },
  scenarios: { priceObjection: 'Objection Prix', priceObjectionDesc: 'Le prospect dit que c\'est trop cher', notInterested: 'Pas Intéressé', notInterestedDesc: 'Le prospect veut mettre fin à l\'appel', thinkItOver: 'J\'y Réfléchirai', thinkItOverDesc: 'Le prospect cherche à gagner du temps', sendMeInfo: 'Envoyez-moi Info', sendMeInfoDesc: 'Le prospect esquive avec une demande d\'email', coldOpener: 'Appel à Froid', coldOpenerDesc: 'Commencer un appel à froid de zéro', discovery: 'Découverte', discoveryDesc: 'Découvrir les points de douleur et besoins', closing: 'Clôture', closingDesc: 'Pousser pour l\'engagement à la fin', random: 'Scénario Aléatoire', randomDesc: 'L\'IA génère une situation surprise', custom: 'Scénario Personnalisé', customDesc: 'Décrivez votre propre persona de prospect' },
  analytics: { avgClosePercent: 'Prob. Clôture Moy.', bestCall: 'Meilleur Appel', callsWon: 'Appels Gagnés', activeStages: 'Étapes Actives', mostCalls: 'Le Plus d\'Appels', bestStageAvg: 'Meilleure Étape Moy.', highScores: 'Scores Élevés', mastered: 'Maîtrisées', avgBest: 'Meilleur Moy.', totalAttempts: 'Total Tentatives', activeDays: 'Jours Actifs', callAndTraining: 'Appel + Formation', callOnly: 'Appel Seulement', trainingOnly: 'Formation Seulement', trainingLabel: 'Formation', title: 'Analytique', subtitle: 'Tendances de performance sur les appels et la formation', totalCalls: 'Total d\'Appels', totalTime: 'Temps Total', avgScore: 'Score Moyen', objections: 'Objections Gérées', noCalls: 'Pas encore de données', noCallsSub: 'Complétez quelques appels pour voir vos analyses.', callHistory: 'Historique des Appels', performance: 'Performance', callIntel: 'Intel Appel', training: 'Formation', team: 'Équipe', avgCloseProb: 'Prob. Clôture Moy.', avgLeadScore: 'Score Lead Moy.', avgDuration: 'Durée Moy.', closeProbChart: n => `Prob. Clôture — ${n} Derniers Appels`, callsByStage: 'Appels par Étape', activityDays: 'Activité — 28 Derniers Jours', viewDetails: 'Voir Détails →', both: 'Les deux', call: 'Appel', demoData: 'Données Démo', totalSessions: 'Total Séances', bestScore: 'Meilleur Score', lessonsTried: 'Leçons Essayées', scoreSessions: n => `Score — ${n} Dernières Séances`, bestPerLesson: 'Meilleur Score par Leçon', topObjections: 'Principales Objections et Techniques', winningPatterns: 'Schémas Gagnants', stageDistribution: 'Distribution par Étape', bestDayToCall: 'Meilleur Jour pour Appeler', objectionToCloseRate: 'Taux Objection-Clôture', objectionCloseRateDesc: "Comment votre probabilité de clôture évolue selon le nombre d'objections lors de l'appel.", closeProbOverTime: 'Probabilité de Clôture dans le Temps', repScoreTrend: n => `Tendance du Score (${n} appels)`, fullCallLog: "Journal Complet des Appels", callVolumeByStage: "Volume d'Appels par Étape", perStageBreakdown: 'Détail par Étape', dayGrid28: 'Grille de 28 Jours', dailyBreakdown: 'Détail Quotidien', callDay: "Jour d'appel", daysOff: 'Jours sans appels', teamLeaderboard: "Classement de l'Équipe — Ce Mois", managerCreateTeam: 'Manager — Créer une Équipe', repJoinTeam: 'Commercial — Rejoindre une Équipe', teamCodeDesc: "Générez un code d'équipe et partagez-le avec vos commerciaux pour connecter les statistiques de tous.", teamJoinDesc: 'Entrez le code partagé par votre manager pour rejoindre son équipe et apparaître dans le classement.', codeCopied: 'Code copié !', teamCodeCreated: "Code d'équipe créé. Partagez-le avec vos commerciaux.", joinedTeamMsg: code => `Équipe ${code} rejointe.`, currentlyInTeam: 'Équipe actuelle : ', copyBtn: '⎘ Copier', generateTeamCode: "Générer le Code d'Équipe", joinBtn: 'Rejoindre', teamCodePlaceholder: 'Code équipe (ex. ABC123)', colDate: 'Date', colDuration: 'Durée', colClosePercent: 'Clôture %', colLeadScore: 'Score Lead', colStage: 'Étape', colObjections: 'Objections', colCalls: 'Appels', colAvgClosePercent: 'Clôture % Moy.', colAvgDuration: 'Durée Moy.', colRep: 'Commercial', colTraining: 'Formation', colStreak: 'Série', closeProbDetail: 'Probabilité de Clôture', closeProbDetailSub: 'Tendance du taux de réussite sur tous les appels enregistrés', callsByStageDetail: 'Appels par Étape', callsByStageDetailSub: 'Où se terminent vos appels et comment ils performent à chaque étape', activityLogDetail: "Journal d'Activité", activityLogDetailSub: "Activité quotidienne d'appels sur les 28 derniers jours", avgRepScore: 'Score Commercial Moy.', avgTalkRatio: 'Ratio de Parole Moy.', avgCloseProbLabel: 'probabilité de clôture moyenne', successWhenHandled: pct => `${pct}% de succès géré`, objZero: '0 objection', objOne: '1 objection', objTwoPlus: '2+ objections', callsUnit: 'appels', winPatternDuration: botDur => `durée moyenne sur vos appels les plus performants vs ${botDur} sur les moins performants`, winPatternObjections: botObj => `objections moyennes sur les appels gagnants vs ${botObj} sur les perdants — gérer tôt est clé`, winPatternCloseStage: otherP => `probabilité de clôture moyenne sur les appels ayant atteint l'étape Clôture vs ${otherP}% sur les étapes antérieures`, objPriceBudget: 'Prix / budget', objNotRightTime: 'Pas le bon moment', objAlreadyVendor: 'A déjà un fournisseur', objNotInterested: 'Pas intéressé', techAnchorROI: "Ancrage au ROI — liez le coût à la valeur économisée ou au problème résolu", techFuturePace: "Projection du coût du délai — montrez ce que coûte l'attente", techContrast: 'Positionnement par contraste — isolez le point sur lequel vous êtes meilleur' },
  trainingExtra: { practiceTitle: 'Scénarios de Pratique', practiceDesc: 'Entraînez-vous avec des simulations de prospects propulsées par IA. Obtenez des retours instantanés.', practiceFeature1: '9 scénarios de vente uniques', practiceFeature2: 'Difficulté facile, moyenne et brutale', practiceFeature3: 'Rapport complet à la fin de chaque séance', practiceCta: 'Commencer à Pratiquer →', academyTitle: 'Académie AI', academyDesc: 'Leçons structurées pour développer de vraies compétences en vente.', academyFeature1: '3 niveaux — Débutant à Avancé', academyFeature2: '27 leçons : enseignées puis testées', academyFeature3: 'Suivez vos scores et votre progression', academyCta: 'Commencer à Apprendre →', backToSelection: '← Retour à la sélection', switchToAcademy: 'Passer à l\'Académie ◈', switchToPractice: 'Passer à la Pratique ◎' },
  precall: { title: 'Configuration Pré-Appel', prospectName: 'Nom du Prospect', prospectNamePlaceholder: 'ex. Jean Dupont', company: 'Entreprise', companyPlaceholder: 'ex. Acme Corp', callGoal: 'Objectif de l\'Appel', callGoalPlaceholder: 'ex. Réserver une démo, conclure l\'affaire...', yourPitch: 'Votre Offre / Produit', yourPitchPlaceholder: 'Que vendez-vous ?', language: 'Langue', startCall: 'Démarrer l\'Appel' },
  liveCall: { endCall: 'Terminer l\'Appel', mute: 'Muet', unmute: 'Réactiver', aiSuggestions: 'Suggestions IA', transcript: 'Transcription', closeProbability: 'Prob. de Clôture', stage: 'Étape', note: 'Note', addNote: 'Ajouter une note...', listening: 'En écoute...', liveMode: 'MODE EN DIRECT', noProspect: 'Aucun prospect', active: 'ACTIF', standby: 'VEILLE', objections: 'OBJECTIONS', closeProb: 'PROB. CLÔTURE', aiFeed: 'FLUX D\'INTELLIGENCE IA', coaching: 'COACHING', readyToAssist: 'Prêt à Aider', readyDesc: 'Cliquez sur Écouter dans le panneau de transcription pour démarrer le micro.', transcriptFeed: 'FLUX DE TRANSCRIPTION', live: 'EN DIRECT', you: 'VOUS', prospect: 'PROSPECT', system: 'SYSTÈME', listeningStatus: 'Écoute en cours — les intervenants sont détectés automatiquement.', micStarting: 'Démarrage du micro... ou saisissez le dialogue du prospect ci-dessous.', typeProspect: 'Tapez ce que le prospect a dit...', leadProfile: 'PROFIL DU PROSPECT', name: 'Nom', company: 'Entreprise', goal: 'Objectif', pitch: 'Argumentaire', callStats: 'STATISTIQUES', quickActions: 'ACTIONS RAPIDES', callNotes: 'NOTES D\'APPEL', noLeadData: 'Aucune donnée prospect encore. Commencez une conversation pour construire le profil.', summarizeCall: 'Résumer l\'appel', generateEmail: 'Générer un email de suivi', exportLead: 'Exporter les données prospect', scoreLead: 'Évaluer ce prospect', stageOpener: 'INTRODUCTION', stageDiscovery: 'DÉCOUVERTE', stagePitch: 'PRÉSENTATION', stageClose: 'CLÔTURE' },
  postcall: { title: 'Révision d\'Appel', summary: 'Résumé', transcript: 'Transcription', newCall: 'Nouvel Appel', backToDashboard: 'Retour au Tableau de Bord', followUp: 'E-mail de Suivi', copyEmail: 'Copier l\'E-mail', notes: 'Notes', addNote: 'Ajouter une note...', saveNote: 'Enregistrer', duration: 'Durée', score: 'Score de Clôture', objections: 'Objections', leadScore: 'Score du Prospect', entries: 'Entrées', stageReached: 'Étape Atteinte', savedToCrm: 'Enregistré dans le CRM', download: 'Télécharger .TXT' },
  auth: { signIn: 'Se connecter', signUp: 'S\'inscrire', email: 'E-mail', password: 'Mot de passe', forgotPassword: 'Mot de passe oublié ?', continueWithGoogle: 'Continuer avec Google', alreadyHaveAccount: 'Vous avez déjà un compte ?', dontHaveAccount: 'Vous n\'avez pas de compte ?', backToHome: 'Retour à l\'accueil' },
  onboarding: { welcome: 'Bienvenue sur Pitchbase', yourName: 'Votre Nom', yourNamePlaceholder: 'ex. Alex Martin', yourRole: 'Votre Rôle', yourRolePlaceholder: 'ex. Responsable Commercial', whatYouSell: 'Que vendez-vous ?', whatYouSellPlaceholder: 'ex. SaaS, conseil, assurance...', language: 'Langue Préférée', letsGo: 'C\'est parti →' },
  upload: { title: 'Importer un Enregistrement', subtitle: 'Importez un enregistrement pour obtenir un coaching IA et un compte-rendu complet.', dropzone: 'Déposez votre fichier audio ici', analyzing: 'Analyse de votre appel...', browseFiles: 'Parcourir les fichiers' },
};

const pt: T = {
  nav: { dashboard: 'Painel', training: 'Treinamento', analytics: 'Análise', leads: 'Leads', meetings: 'Reuniões', newCall: '▶ Nova Chamada', upload: '↑ Enviar' },
  common: { back: 'Voltar', cancel: 'Cancelar', save: 'Salvar', send: 'Enviar', start: 'Iniciar', done: 'Concluído', close: 'Fechar', loading: 'Carregando...', signOut: 'Sair', next: 'Próximo', skip: 'Pular', edit: 'Editar', delete: 'Excluir', confirm: 'Confirmar', tryAgain: 'Tentar novamente', learnMore: 'Saiba mais', or: 'ou' },
  profile: { activity: 'ATIVIDADE', appearance: 'APARÊNCIA', dark: 'Escuro', light: 'Claro', calls: n => `${n} chamada${n !== 1 ? 's' : ''}`, trainingSessions: n => `${n} sessão${n !== 1 ? 'ões' : ''} de treinamento`, totalOnPlatform: 'total na plataforma', maxRank: '✦ Rank máximo atingido', appLanguage: 'Idioma do app', langNote: 'Afeta o idioma do coaching e treinamento. Pode ser alterado por chamada nas configurações.' },
  tiers: { title: 'Níveis de Rank', subtitle: 'Desbloqueie níveis completando chamadas reais e sessões de treinamento. Ambos devem atingir o limite para avançar.', unlocked: 'Desbloqueado', noCalls: 'Nenhuma chamada necessária', noSessions: 'Nenhuma sessão necessária', calls: 'chamadas', sessions: 'sessões de treinamento', percentThere: '% lá' },
  dashboard: { greeting: name => `Bem-vindo de volta${name ? `, ${name}` : ''}`, tagline: 'Seu coach de vendas AI pessoal', streakMessage: n => `Sequência de ${n} dia${n !== 1 ? 's' : ''} — continue assim!`, recentCalls: 'Chamadas Recentes', noCalls: 'Nenhuma chamada ainda', noCallsSub: 'Inicie sua primeira chamada para ver seu histórico aqui.', startCall: 'Nova Chamada', uploadCall: 'Enviar Gravação', duration: 'Duração', score: 'Pontuação', stage: 'Etapa', viewSession: 'Ver', deleteSession: 'Excluir', totalCalls: 'Total Chamadas', avgCloseProb: 'Prob. Fechamento Méd.', totalObjections: 'Total Objeções', avgDuration: 'Duração Méd.', practiceStreak: 'Sequência de Prática', total: 'total', overview: 'Visão Geral', contacts: 'Contatos', contactsSub: 'Todos os prospects do seu histórico', noContacts: 'Nenhum contato ainda', noContactsSub: 'Conclua uma chamada para ver os contatos aqui.', noResults: 'Sem resultados', searchPlaceholder: 'Pesquisar por nome ou empresa…', latestScore: 'Última Pontuação', bestCloseProb: 'Melhor Prob. Fechamento', latestSummary: 'Último Resumo AI', latestNotes: 'Últimas Notas', latestEmail: 'Último Email de Acompanhamento', callHistory: 'Histórico de Chamadas', copy: 'Copiar', copied: 'Copiado', callCount: n => `${n} chamada${n !== 1 ? 's' : ''}` },
  training: { title: 'Modo Treinamento', subtitle: 'Escolha um cenário. A IA interpreta o prospect. Encerre quando estiver pronto para seu relatório.', language: 'IDIOMA', startTraining: 'Iniciar Treinamento', endSession: 'Encerrar Sessão', practicing: 'Praticando', yourResponse: 'Sua resposta...', generating: 'Gerando...', sessionComplete: 'Sessão Concluída', practiceAgain: 'Praticar Novamente', backToDashboard: 'Voltar ao Painel', quota: (u, t) => `${u} / ${t} sessões usadas este mês`, quotaExhausted: t => `Limite mensal atingido — ${t} sessões usadas. Reinicia no próximo mês.`, setupContext: 'Configure seu cenário', whatSelling: 'O que você está vendendo?', whatSellingPlaceholder: 'ex. SaaS, consultoria, seguros...', selectSub: 'Selecione um sub-cenário', difficulty: 'Dificuldade', easy: 'Fácil', medium: 'Médio', hard: 'Difícil', customScenario: 'Descreva seu cenário', customPlaceholder: 'Descreva o prospect e a situação...', sessionHistory: 'Histórico de Sessões', exchanges: n => `${n} troca${n !== 1 ? 's' : ''}`, score: 'Pontuação', keyTakeaway: 'LIÇÃO PRINCIPAL', strengths: '✓ O que você fez bem', improvements: '✗ No que trabalhar', practice: 'Prática', academy: 'Academia', loadingAcademy: 'Carregando Academia...', generatingReport: 'Gerando seu relatório de coaching...', scenarioLabel: 'CENÁRIO', recent: 'RECENTE', describeProspect: 'Descreva seu prospect', describeProspectSub: 'Diga à IA quem são, sua atitude e sua situação.', whatSellingContextSub: 'Dê contexto à IA para simular um prospect realista para seu setor.', prospectSpeaking: 'PROSPECT FALANDO', yourTurn: 'SUA VEZ', aiThinking: 'IA PENSANDO...', waiting: 'AGUARDANDO...' },
  scenarios: { priceObjection: 'Objeção de Preço', priceObjectionDesc: 'O prospect diz que é caro demais', notInterested: 'Não Interessado', notInterestedDesc: 'O prospect quer encerrar a chamada', thinkItOver: 'Vou Pensar', thinkItOverDesc: 'O prospect está ganhando tempo', sendMeInfo: 'Mande as Informações', sendMeInfoDesc: 'O prospect desvia com pedido de email', coldOpener: 'Abertura Fria', coldOpenerDesc: 'Começar uma cold call do zero', discovery: 'Descoberta', discoveryDesc: 'Descobrir pontos de dor e necessidades', closing: 'Fechamento', closingDesc: 'Buscar comprometimento no final', random: 'Cenário Aleatório', randomDesc: 'IA gera uma situação surpresa', custom: 'Cenário Personalizado', customDesc: 'Descreva seu próprio persona de prospect' },
  analytics: { avgClosePercent: 'Prob. Fechamento Méd.', bestCall: 'Melhor Chamada', callsWon: 'Chamadas Ganhas', activeStages: 'Etapas Ativas', mostCalls: 'Mais Chamadas', bestStageAvg: 'Melhor Etapa Méd.', highScores: 'Pontuações Altas', mastered: 'Dominadas', avgBest: 'Melhor Méd.', totalAttempts: 'Total Tentativas', activeDays: 'Dias Ativos', callAndTraining: 'Chamada + Treino', callOnly: 'Só Chamada', trainingOnly: 'Só Treino', trainingLabel: 'Treinamento', title: 'Análise', subtitle: 'Tendências de desempenho em chamadas e treinamento', totalCalls: 'Total de Chamadas', totalTime: 'Tempo Total', avgScore: 'Pontuação Média', objections: 'Objeções Tratadas', noCalls: 'Sem dados ainda', noCallsSub: 'Complete algumas chamadas para ver suas análises.', callHistory: 'Histórico de Chamadas', performance: 'Desempenho', callIntel: 'Intel de Chamada', training: 'Treinamento', team: 'Equipe', avgCloseProb: 'Prob. Fechamento Méd.', avgLeadScore: 'Pontuação Lead Méd.', avgDuration: 'Duração Méd.', closeProbChart: n => `Prob. Fechamento — Últimas ${n} Chamadas`, callsByStage: 'Chamadas por Etapa', activityDays: 'Atividade — Últimos 28 Dias', viewDetails: 'Ver Detalhes →', both: 'Ambos', call: 'Chamada', demoData: 'Dados Demo', totalSessions: 'Total Sessões', bestScore: 'Melhor Pontuação', lessonsTried: 'Lições Tentadas', scoreSessions: n => `Pontuação — Últimas ${n} Sessões`, bestPerLesson: 'Melhor Pontuação por Lição', topObjections: 'Principais Objeções e Técnicas', winningPatterns: 'Padrões Vencedores', stageDistribution: 'Distribuição por Etapa', bestDayToCall: 'Melhor Dia para Ligar', objectionToCloseRate: 'Taxa Objeção-Fechamento', objectionCloseRateDesc: 'Como sua probabilidade de fechamento muda com base no número de objeções durante a chamada.', closeProbOverTime: 'Probabilidade de Fechamento ao Longo do Tempo', repScoreTrend: n => `Tendência de Pontuação (${n} chamadas)`, fullCallLog: 'Registro Completo de Chamadas', callVolumeByStage: 'Volume de Chamadas por Etapa', perStageBreakdown: 'Detalhamento por Etapa', dayGrid28: 'Grade de 28 Dias', dailyBreakdown: 'Detalhamento Diário', callDay: 'Dia de chamada', daysOff: 'Dias sem chamadas', teamLeaderboard: 'Classificação do Time — Este Mês', managerCreateTeam: 'Gerente — Criar Time', repJoinTeam: 'Representante — Entrar no Time', teamCodeDesc: "Gere um código de time e compartilhe com seus representantes para conectar as estatísticas de todos.", teamJoinDesc: 'Digite o código compartilhado pelo seu gerente para entrar no time e aparecer no ranking.', codeCopied: 'Código copiado!', teamCodeCreated: 'Código do time criado. Compartilhe com seus representantes.', joinedTeamMsg: code => `Entrou no time ${code}.`, currentlyInTeam: 'Time atual: ', copyBtn: '⎘ Copiar', generateTeamCode: 'Gerar Código do Time', joinBtn: 'Entrar', teamCodePlaceholder: 'Código do time (ex. ABC123)', colDate: 'Data', colDuration: 'Duração', colClosePercent: 'Fecha. %', colLeadScore: 'Score do Lead', colStage: 'Etapa', colObjections: 'Objeções', colCalls: 'Chamadas', colAvgClosePercent: 'Fecha. % Média', colAvgDuration: 'Duração Média', colRep: 'Representante', colTraining: 'Treinamento', colStreak: 'Sequência', closeProbDetail: 'Probabilidade de Fechamento', closeProbDetailSub: 'Tendência da taxa de sucesso em todas as chamadas registradas', callsByStageDetail: 'Chamadas por Etapa', callsByStageDetailSub: 'Onde suas chamadas estão encerrando e como elas performam em cada etapa', activityLogDetail: 'Registro de Atividade', activityLogDetailSub: 'Atividade diária de chamadas nos últimos 28 dias', avgRepScore: 'Score Médio do Rep.', avgTalkRatio: 'Taxa de Fala Média', avgCloseProbLabel: 'probabilidade de fechamento média', successWhenHandled: pct => `${pct}% de sucesso ao lidar`, objZero: '0 objeções', objOne: '1 objeção', objTwoPlus: '2+ objeções', callsUnit: 'chamadas', winPatternDuration: botDur => `duração média em suas chamadas de melhor desempenho vs ${botDur} nas de pior desempenho`, winPatternObjections: botObj => `objeções médias em chamadas vencedoras vs ${botObj} nas perdedoras — lidar cedo importa`, winPatternCloseStage: otherP => `probabilidade de fechamento média em chamadas que chegaram à etapa de Fechamento vs ${otherP}% nas etapas anteriores`, objPriceBudget: 'Preço / orçamento', objNotRightTime: 'Não é o momento certo', objAlreadyVendor: 'Já têm fornecedor', objNotInterested: 'Não tem interesse', techAnchorROI: 'Ancorar no ROI — relacione o custo ao valor economizado ou problema resolvido', techFuturePace: 'Projetar o custo do atraso — mostre o que esperar custa', techContrast: 'Posicionamento por contraste — isole o único ponto em que você é melhor' },
  trainingExtra: { practiceTitle: 'Cenários de Prática', practiceDesc: 'Treine com simulações de prospects impulsionadas por IA. Obtenha feedback instantâneo.', practiceFeature1: '9 cenários de vendas únicos', practiceFeature2: 'Dificuldade fácil, média e brutal', practiceFeature3: 'Relatório completo ao final de cada sessão', practiceCta: 'Começar a Praticar →', academyTitle: 'Academia AI', academyDesc: 'Lições estruturadas para desenvolver habilidades reais de vendas.', academyFeature1: '3 níveis — Iniciante a Avançado', academyFeature2: '27 lições: ensinadas primeiro, depois testadas', academyFeature3: 'Acompanhe suas pontuações e melhoria', academyCta: 'Começar a Aprender →', backToSelection: '← Voltar à seleção', switchToAcademy: 'Mudar para Academia ◈', switchToPractice: 'Mudar para Prática ◎' },
  precall: { title: 'Configuração Pré-Chamada', prospectName: 'Nome do Prospect', prospectNamePlaceholder: 'ex. João Silva', company: 'Empresa', companyPlaceholder: 'ex. Acme Corp', callGoal: 'Objetivo da Chamada', callGoalPlaceholder: 'ex. Agendar uma demo, fechar o negócio...', yourPitch: 'Sua Proposta / Produto', yourPitchPlaceholder: 'O que você está vendendo?', language: 'Idioma', startCall: 'Iniciar Chamada' },
  liveCall: { endCall: 'Encerrar Chamada', mute: 'Mutar', unmute: 'Desmutar', aiSuggestions: 'Sugestões de IA', transcript: 'Transcrição', closeProbability: 'Prob. de Fechamento', stage: 'Etapa', note: 'Nota', addNote: 'Adicionar nota...', listening: 'Ouvindo...', liveMode: 'MODO AO VIVO', noProspect: 'Sem prospect', active: 'ATIVO', standby: 'ESPERA', objections: 'OBJEÇÕES', closeProb: 'PROB. FECHAMENTO', aiFeed: 'FEED DE INTELIGÊNCIA IA', coaching: 'COACHING', readyToAssist: 'Pronto para Ajudar', readyDesc: 'Clique em Ouvir no painel de transcrição para iniciar o microfone.', transcriptFeed: 'FEED DE TRANSCRIÇÃO', live: 'AO VIVO', you: 'VOCÊ', prospect: 'PROSPECT', system: 'SISTEMA', listeningStatus: 'Ouvindo — os falantes são detectados automaticamente.', micStarting: 'Iniciando microfone... ou digite o diálogo do prospect abaixo.', typeProspect: 'Digite o que o prospect disse...', leadProfile: 'PERFIL DO PROSPECT', name: 'Nome', company: 'Empresa', goal: 'Objetivo', pitch: 'Proposta', callStats: 'ESTATÍSTICAS', quickActions: 'AÇÕES RÁPIDAS', callNotes: 'NOTAS DA CHAMADA', noLeadData: 'Sem dados do prospect ainda. Inicie uma conversa para construir o perfil.', summarizeCall: 'Resumir chamada', generateEmail: 'Gerar email de acompanhamento', exportLead: 'Exportar dados do prospect', scoreLead: 'Pontuar este prospect', stageOpener: 'ABERTURA', stageDiscovery: 'DESCOBERTA', stagePitch: 'PROPOSTA', stageClose: 'FECHAMENTO' },
  postcall: { title: 'Revisão da Chamada', summary: 'Resumo', transcript: 'Transcrição', newCall: 'Nova Chamada', backToDashboard: 'Voltar ao Painel', followUp: 'E-mail de Acompanhamento', copyEmail: 'Copiar E-mail', notes: 'Notas', addNote: 'Adicionar nota...', saveNote: 'Salvar', duration: 'Duração', score: 'Pontuação de Fechamento', objections: 'Objeções', leadScore: 'Pontuação do Lead', entries: 'Entradas', stageReached: 'Etapa Atingida', savedToCrm: 'Salvo no CRM', download: 'Baixar .TXT' },
  auth: { signIn: 'Entrar', signUp: 'Cadastrar', email: 'E-mail', password: 'Senha', forgotPassword: 'Esqueceu a senha?', continueWithGoogle: 'Continuar com o Google', alreadyHaveAccount: 'Já tem uma conta?', dontHaveAccount: 'Não tem uma conta?', backToHome: 'Voltar ao início' },
  onboarding: { welcome: 'Bem-vindo ao Pitchbase', yourName: 'Seu Nome', yourNamePlaceholder: 'ex. Alex Santos', yourRole: 'Seu Cargo', yourRolePlaceholder: 'ex. Executivo de Contas', whatYouSell: 'O que você vende?', whatYouSellPlaceholder: 'ex. SaaS, consultoria, seguros...', language: 'Idioma Preferido', letsGo: 'Vamos →' },
  upload: { title: 'Enviar Gravação', subtitle: 'Envie uma gravação para obter coaching de IA e um resumo completo.', dropzone: 'Solte seu arquivo de áudio aqui', analyzing: 'Analisando sua chamada...', browseFiles: 'Procurar arquivos' },
};

const de: T = {
  nav: { dashboard: 'Dashboard', training: 'Training', analytics: 'Analytik', leads: 'Leads', meetings: 'Meetings', newCall: '▶ Neuer Anruf', upload: '↑ Hochladen' },
  common: { back: 'Zurück', cancel: 'Abbrechen', save: 'Speichern', send: 'Senden', start: 'Starten', done: 'Fertig', close: 'Schließen', loading: 'Lädt...', signOut: 'Abmelden', next: 'Weiter', skip: 'Überspringen', edit: 'Bearbeiten', delete: 'Löschen', confirm: 'Bestätigen', tryAgain: 'Nochmal versuchen', learnMore: 'Mehr erfahren', or: 'oder' },
  profile: { activity: 'AKTIVITÄT', appearance: 'ERSCHEINUNGSBILD', dark: 'Dunkel', light: 'Hell', calls: n => `${n} Anruf${n !== 1 ? 'e' : ''}`, trainingSessions: n => `${n} Trainingseinheit${n !== 1 ? 'en' : ''}`, totalOnPlatform: 'gesamt auf der Plattform', maxRank: '✦ Maximaler Rang erreicht', appLanguage: 'App-Sprache', langNote: 'Beeinflusst die Coaching- und Trainingssprache. Im Vorab-Setup pro Anruf änderbar.' },
  tiers: { title: 'Rang-Stufen', subtitle: 'Stufen durch echte Anrufe und Trainingseinheiten freischalten. Beide Werte müssen den Schwellenwert erreichen.', unlocked: 'Freigeschaltet', noCalls: 'Keine Anrufe erforderlich', noSessions: 'Keine Sitzungen erforderlich', calls: 'Anrufe', sessions: 'Trainingseinheiten', percentThere: '% geschafft' },
  dashboard: { greeting: name => `Willkommen zurück${name ? `, ${name}` : ''}`, tagline: 'Ihr persönlicher AI-Verkaufscoach', streakMessage: n => `${n}-tägige Übungsserie — weiter so!`, recentCalls: 'Letzte Anrufe', noCalls: 'Noch keine Anrufe', noCallsSub: 'Starten Sie Ihren ersten Anruf, um Ihren Verlauf hier zu sehen.', startCall: 'Neuer Anruf', uploadCall: 'Aufnahme hochladen', duration: 'Dauer', score: 'Bewertung', stage: 'Phase', viewSession: 'Ansehen', deleteSession: 'Löschen', totalCalls: 'Anrufe gesamt', avgCloseProb: 'Ø Abschlusswahrsch.', totalObjections: 'Einwände gesamt', avgDuration: 'Ø Dauer', practiceStreak: 'Übungsserie', total: 'gesamt', overview: 'Übersicht', contacts: 'Kontakte', contactsSub: 'Alle Interessenten aus Ihrer Anrufhistorie', noContacts: 'Noch keine Kontakte', noContactsSub: 'Schließen Sie einen Anruf ab, um Kontakte hier zu sehen.', noResults: 'Keine Ergebnisse', searchPlaceholder: 'Nach Name oder Firma suchen…', latestScore: 'Letzter Score', bestCloseProb: 'Beste Abschlusswahrsch.', latestSummary: 'Letztes AI-Fazit', latestNotes: 'Letzte Notizen', latestEmail: 'Letzte Follow-up E-Mail', callHistory: 'Anrufverlauf', copy: 'Kopieren', copied: 'Kopiert', callCount: n => `${n} Anruf${n !== 1 ? 'e' : ''}` },
  training: { title: 'Trainingsmodus', subtitle: 'Wählen Sie ein Szenario. Die KI spielt den Interessenten. Beenden Sie den Anruf für Ihren Coaching-Bericht.', language: 'SPRACHE', startTraining: 'Training Starten', endSession: 'Sitzung Beenden', practicing: 'Im Training', yourResponse: 'Ihre Antwort...', generating: 'Wird generiert...', sessionComplete: 'Sitzung Abgeschlossen', practiceAgain: 'Erneut Üben', backToDashboard: 'Zurück zum Dashboard', quota: (u, t) => `${u} / ${t} Sitzungen diesen Monat genutzt`, quotaExhausted: t => `Monatliches Limit erreicht — ${t} Sitzungen genutzt. Wird nächsten Monat zurückgesetzt.`, setupContext: 'Szenario einrichten', whatSelling: 'Was verkaufen Sie?', whatSellingPlaceholder: 'z.B. SaaS, Beratung, Versicherung...', selectSub: 'Unter-Szenario wählen', difficulty: 'Schwierigkeit', easy: 'Leicht', medium: 'Mittel', hard: 'Schwer', customScenario: 'Szenario beschreiben', customPlaceholder: 'Beschreiben Sie den Interessenten und die Situation...', sessionHistory: 'Sitzungsverlauf', exchanges: n => `${n} Austausch${n !== 1 ? 'e' : ''}`, score: 'Bewertung', keyTakeaway: 'WICHTIGSTE ERKENNTNIS', strengths: '✓ Was Sie gut gemacht haben', improvements: '✗ Woran Sie arbeiten sollten', practice: 'Übung', academy: 'Akademie', loadingAcademy: 'Akademie wird geladen...', generatingReport: 'Coaching-Bericht wird erstellt...', scenarioLabel: 'SZENARIO', recent: 'ZULETZT', describeProspect: 'Beschreiben Sie den Interessenten', describeProspectSub: 'Teilen Sie der KI mit, wer sie sind, ihre Einstellung und ihre Situation.', whatSellingContextSub: 'Geben Sie der KI Kontext, um einen realistischen Interessenten für Ihre Branche zu simulieren.', prospectSpeaking: 'INTERESSENT SPRICHT', yourTurn: 'IHRE REIHE', aiThinking: 'KI DENKT...', waiting: 'WARTEN...' },
  scenarios: { priceObjection: 'Preiseinwand', priceObjectionDesc: 'Interessent sagt, es sei zu teuer', notInterested: 'Kein Interesse', notInterestedDesc: 'Interessent möchte das Gespräch beenden', thinkItOver: 'Ich Überlege Es Mir', thinkItOverDesc: 'Interessent gewinnt Zeit', sendMeInfo: 'Schicken Sie Info', sendMeInfoDesc: 'Interessent weicht mit E-Mail-Anfrage aus', coldOpener: 'Kaltakquise-Opener', coldOpenerDesc: 'Kaltakquise von Grund auf starten', discovery: 'Bedarfsanalyse', discoveryDesc: 'Schmerzpunkte und Bedürfnisse aufdecken', closing: 'Abschluss', closingDesc: 'Am Ende zum Commitment drängen', random: 'Zufalls-Szenario', randomDesc: 'KI generiert eine Überraschungssituation', custom: 'Eigenes Szenario', customDesc: 'Eigene Interessentenpersona beschreiben' },
  analytics: { avgClosePercent: 'Ø Abschluss %', bestCall: 'Bester Anruf', callsWon: 'Gewonnene Anrufe', activeStages: 'Aktive Phasen', mostCalls: 'Meiste Anrufe', bestStageAvg: 'Beste Phase Ø', highScores: 'Hohe Bewertungen', mastered: 'Beherrscht', avgBest: 'Bester Ø', totalAttempts: 'Versuche gesamt', activeDays: 'Aktive Tage', callAndTraining: 'Anruf + Training', callOnly: 'Nur Anruf', trainingOnly: 'Nur Training', trainingLabel: 'Training', title: 'Analytik', subtitle: 'Leistungstrends bei Anrufen und Training', totalCalls: 'Anrufe gesamt', totalTime: 'Gesamtzeit', avgScore: 'Ø Bewertung', objections: 'Behandelte Einwände', noCalls: 'Noch keine Daten', noCallsSub: 'Führen Sie Anrufe durch, um Ihre Analysen zu sehen.', callHistory: 'Anrufverlauf', performance: 'Leistung', callIntel: 'Anruf-Intel', training: 'Training', team: 'Team', avgCloseProb: 'Ø Abschlusswahrsch.', avgLeadScore: 'Ø Lead-Bewertung', avgDuration: 'Ø Dauer', closeProbChart: n => `Abschlusswahrsch. — Letzte ${n} Anrufe`, callsByStage: 'Anrufe nach Phase', activityDays: 'Aktivität — Letzte 28 Tage', viewDetails: 'Details ansehen →', both: 'Beides', call: 'Anruf', demoData: 'Demodaten', totalSessions: 'Sitzungen gesamt', bestScore: 'Beste Bewertung', lessonsTried: 'Lektionen versucht', scoreSessions: n => `Bewertung — Letzte ${n} Sitzungen`, bestPerLesson: 'Beste Bewertung pro Lektion', topObjections: 'Top-Einwände und Techniken', winningPatterns: 'Erfolgreiche Muster', stageDistribution: 'Phasenverteilung', bestDayToCall: 'Bester Anruftag', objectionToCloseRate: 'Einwand-zu-Abschluss-Rate', objectionCloseRateDesc: 'Wie sich Ihre Abschlusswahrscheinlichkeit je nach Anzahl der Einwände im Gespräch verändert.', closeProbOverTime: 'Abschlusswahrscheinlichkeit im Zeitverlauf', repScoreTrend: n => `Vertreter-Score-Trend (${n} Gespräche)`, fullCallLog: 'Vollständiges Gesprächsprotokoll', callVolumeByStage: 'Anrufvolumen nach Phase', perStageBreakdown: 'Aufschlüsselung nach Phase', dayGrid28: '28-Tage-Raster', dailyBreakdown: 'Tägliche Aufschlüsselung', callDay: 'Anruftag', daysOff: 'Anruffreie Tage', teamLeaderboard: 'Team-Rangliste — Diesen Monat', managerCreateTeam: 'Manager — Team erstellen', repJoinTeam: 'Vertreter — Team beitreten', teamCodeDesc: 'Generieren Sie einen Teamcode und teilen Sie ihn mit Ihren Vertretern, um aller Statistiken zu verbinden.', teamJoinDesc: 'Geben Sie den Code Ihres Managers ein, um seinem Team beizutreten und im Ranking zu erscheinen.', codeCopied: 'Code kopiert!', teamCodeCreated: 'Teamcode erstellt. Teilen Sie ihn mit Ihren Vertretern.', joinedTeamMsg: code => `Team ${code} beigetreten.`, currentlyInTeam: 'Aktuelles Team: ', copyBtn: '⎘ Kopieren', generateTeamCode: 'Teamcode generieren', joinBtn: 'Beitreten', teamCodePlaceholder: 'Teamcode (z.B. ABC123)', colDate: 'Datum', colDuration: 'Dauer', colClosePercent: 'Abschluss %', colLeadScore: 'Lead-Score', colStage: 'Phase', colObjections: 'Einwände', colCalls: 'Gespräche', colAvgClosePercent: 'Ø Abschluss %', colAvgDuration: 'Ø Dauer', colRep: 'Vertreter', colTraining: 'Training', colStreak: 'Serie', closeProbDetail: 'Abschlusswahrscheinlichkeit', closeProbDetailSub: 'Erfolgsquoten-Trend über alle aufgezeichneten Gespräche', callsByStageDetail: 'Gespräche nach Phase', callsByStageDetailSub: 'Wo Ihre Gespräche enden und wie sie in jeder Phase abschneiden', activityLogDetail: 'Aktivitätsprotokoll', activityLogDetailSub: 'Tägliche Anrufaktivität der letzten 28 Tage', avgRepScore: 'Ø Vertreter-Score', avgTalkRatio: 'Ø Redequote', avgCloseProbLabel: 'durchschnittliche Abschlusswahrscheinlichkeit', successWhenHandled: pct => `${pct}% Erfolg bei Behandlung`, objZero: '0 Einwände', objOne: '1 Einwand', objTwoPlus: '2+ Einwände', callsUnit: 'Gespräche', winPatternDuration: botDur => `durchschnittliche Dauer Ihrer Top-Gespräche vs ${botDur} bei schwächeren`, winPatternObjections: botObj => `durchschnittliche Einwände in gewonnenen Gesprächen vs ${botObj} in verlorenen — frühzeitige Behandlung zählt`, winPatternCloseStage: otherP => `durchschnittliche Abschlusswahrscheinlichkeit in Gesprächen, die die Abschlussphase erreichten vs ${otherP}% in früheren Phasen`, objPriceBudget: 'Preis / Budget', objNotRightTime: 'Nicht der richtige Zeitpunkt', objAlreadyVendor: 'Haben bereits einen Anbieter', objNotInterested: 'Kein Interesse', techAnchorROI: 'ROI verankern — Kosten mit gespartem Wert oder gelöstem Problem verbinden', techFuturePace: 'Verzögerungskosten vorwegnehmen — zeigen, was Warten kostet', techContrast: 'Kontrastpositionierung — den einen Punkt isolieren, in dem Sie besser sind' },
  trainingExtra: { practiceTitle: 'Übungsszenarien', practiceDesc: 'Trainieren Sie mit KI-gestützten Interessentensimulationen. Erhalten Sie sofortiges Coaching-Feedback.', practiceFeature1: '9 einzigartige Verkaufsszenarien', practiceFeature2: 'Einfache, mittlere und brutale Schwierigkeit', practiceFeature3: 'Vollständiger Coaching-Bericht am Ende jeder Sitzung', practiceCta: 'Üben starten →', academyTitle: 'KI-Akademie', academyDesc: 'Strukturierte Lektionen zum Aufbau echter Verkaufsfähigkeiten.', academyFeature1: '3 Stufen — Anfänger bis Fortgeschrittene', academyFeature2: '27 Lektionen: erst gelehrt, dann getestet', academyFeature3: 'Verfolgen Sie Ihre Ergebnisse und Fortschritte', academyCta: 'Lernen starten →', backToSelection: '← Zurück zur Auswahl', switchToAcademy: 'Zur Akademie wechseln ◈', switchToPractice: 'Zur Übung wechseln ◎' },
  precall: { title: 'Anruf-Vorbereitung', prospectName: 'Name des Interessenten', prospectNamePlaceholder: 'z.B. Max Müller', company: 'Unternehmen', companyPlaceholder: 'z.B. Acme GmbH', callGoal: 'Anrufziel', callGoalPlaceholder: 'z.B. Demo buchen, Deal abschließen...', yourPitch: 'Ihr Angebot / Produkt', yourPitchPlaceholder: 'Was verkaufen Sie?', language: 'Sprache', startCall: 'Anruf Starten' },
  liveCall: { endCall: 'Anruf Beenden', mute: 'Stumm', unmute: 'Stummschaltung aufheben', aiSuggestions: 'KI-Vorschläge', transcript: 'Transkript', closeProbability: 'Abschlusswahrsch.', stage: 'Phase', note: 'Notiz', addNote: 'Notiz hinzufügen...', listening: 'Hört zu...', liveMode: 'LIVE-MODUS', noProspect: 'Kein Interessent', active: 'AKTIV', standby: 'BEREITSCHAFT', objections: 'EINWÄNDE', closeProb: 'ABSCHLUSSWAHRSCH.', aiFeed: 'KI-INTELLIGENZ-FEED', coaching: 'COACHING', readyToAssist: 'Bereit zu Helfen', readyDesc: 'Klicken Sie auf Lauschen im Transkriptbereich, um das Mikrofon zu starten.', transcriptFeed: 'TRANSKRIPT-FEED', live: 'LIVE', you: 'SIE', prospect: 'INTERESSENT', system: 'SYSTEM', listeningStatus: 'Lauscht — Sprecher werden automatisch erkannt.', micStarting: 'Mikrofon startet... oder geben Sie den Interessentendialog unten ein.', typeProspect: 'Tippen Sie, was der Interessent sagte...', leadProfile: 'INTERESSENTENPROFIL', name: 'Name', company: 'Unternehmen', goal: 'Ziel', pitch: 'Pitch', callStats: 'ANRUFSTATISTIKEN', quickActions: 'SCHNELLAKTIONEN', callNotes: 'ANRUFNOTIZEN', noLeadData: 'Noch keine Interessentendaten. Starten Sie ein Gespräch, um das Profil aufzubauen.', summarizeCall: 'Anruf zusammenfassen', generateEmail: 'Follow-up E-Mail erstellen', exportLead: 'Interessentendaten exportieren', scoreLead: 'Interessenten bewerten', stageOpener: 'EINSTIEG', stageDiscovery: 'ERMITTLUNG', stagePitch: 'PITCH', stageClose: 'ABSCHLUSS' },
  postcall: { title: 'Anruf-Review', summary: 'Zusammenfassung', transcript: 'Transkript', newCall: 'Neuer Anruf', backToDashboard: 'Zurück zum Dashboard', followUp: 'Follow-up E-Mail', copyEmail: 'E-Mail kopieren', notes: 'Notizen', addNote: 'Notiz hinzufügen...', saveNote: 'Speichern', duration: 'Dauer', score: 'Abschluss-Bewertung', objections: 'Einwände', leadScore: 'Lead-Bewertung', entries: 'Einträge', stageReached: 'Erreichte Phase', savedToCrm: 'Im CRM gespeichert', download: '.TXT herunterladen' },
  auth: { signIn: 'Anmelden', signUp: 'Registrieren', email: 'E-Mail', password: 'Passwort', forgotPassword: 'Passwort vergessen?', continueWithGoogle: 'Mit Google fortfahren', alreadyHaveAccount: 'Haben Sie bereits ein Konto?', dontHaveAccount: 'Noch kein Konto?', backToHome: 'Zurück zur Startseite' },
  onboarding: { welcome: 'Willkommen bei Pitchbase', yourName: 'Ihr Name', yourNamePlaceholder: 'z.B. Alex Müller', yourRole: 'Ihre Position', yourRolePlaceholder: 'z.B. Account Executive', whatYouSell: 'Was verkaufen Sie?', whatYouSellPlaceholder: 'z.B. SaaS, Beratung, Versicherung...', language: 'Bevorzugte Sprache', letsGo: 'Los geht\'s →' },
  upload: { title: 'Aufnahme Hochladen', subtitle: 'Laden Sie eine Aufnahme hoch für KI-Coaching und ein vollständiges Debriefing.', dropzone: 'Audiodatei hier ablegen', analyzing: 'Anruf wird analysiert...', browseFiles: 'Dateien durchsuchen' },
};

const it: T = {
  nav: { dashboard: 'Dashboard', training: 'Formazione', analytics: 'Analisi', leads: 'Lead', meetings: 'Riunioni', newCall: '▶ Nuova Chiamata', upload: '↑ Carica' },
  common: { back: 'Indietro', cancel: 'Annulla', save: 'Salva', send: 'Invia', start: 'Avvia', done: 'Fatto', close: 'Chiudi', loading: 'Caricamento...', signOut: 'Esci', next: 'Avanti', skip: 'Salta', edit: 'Modifica', delete: 'Elimina', confirm: 'Conferma', tryAgain: 'Riprova', learnMore: 'Scopri di più', or: 'o' },
  profile: { activity: 'ATTIVITÀ', appearance: 'ASPETTO', dark: 'Scuro', light: 'Chiaro', calls: n => `${n} chiamata${n !== 1 ? 'e' : ''}`, trainingSessions: n => `${n} sessione${n !== 1 ? 'i' : ''} di formazione`, totalOnPlatform: 'totale sulla piattaforma', maxRank: '✦ Rango massimo raggiunto', appLanguage: 'Lingua dell\'app', langNote: 'Influisce sulla lingua del coaching e della formazione. Modificabile per chiamata nella configurazione.' },
  tiers: { title: 'Livelli di Rango', subtitle: 'Sblocca i livelli completando chiamate reali e sessioni di formazione. Entrambi devono raggiungere la soglia per avanzare.', unlocked: 'Sbloccato', noCalls: 'Nessuna chiamata richiesta', noSessions: 'Nessuna sessione richiesta', calls: 'chiamate', sessions: 'sessioni di formazione', percentThere: '% raggiunto' },
  dashboard: { greeting: name => `Bentornato${name ? `, ${name}` : ''}`, tagline: 'Il tuo coach di vendite AI personale', streakMessage: n => `Serie di ${n} giorno${n !== 1 ? 'i' : ''} — continua così!`, recentCalls: 'Chiamate Recenti', noCalls: 'Nessuna chiamata ancora', noCallsSub: 'Inizia la tua prima chiamata per vedere la cronologia qui.', startCall: 'Nuova Chiamata', uploadCall: 'Carica Registrazione', duration: 'Durata', score: 'Punteggio', stage: 'Fase', viewSession: 'Vedi', deleteSession: 'Elimina', totalCalls: 'Chiamate Totali', avgCloseProb: 'Prob. Chiusura Med.', totalObjections: 'Obiezioni Totali', avgDuration: 'Durata Med.', practiceStreak: 'Serie di Pratica', total: 'totale', overview: 'Panoramica', contacts: 'Contatti', contactsSub: 'Tutti i prospect dalla tua cronologia', noContacts: 'Nessun contatto ancora', noContactsSub: 'Completa una chiamata per vedere i contatti qui.', noResults: 'Nessun risultato', searchPlaceholder: 'Cerca per nome o azienda…', latestScore: 'Ultimo Punteggio', bestCloseProb: 'Miglior Prob. Chiusura', latestSummary: 'Ultimo Riepilogo AI', latestNotes: 'Ultime Note', latestEmail: 'Ultima Email di Follow-up', callHistory: 'Cronologia Chiamate', copy: 'Copia', copied: 'Copiato', callCount: n => `${n} chiamata${n !== 1 ? 'e' : ''}` },
  training: { title: 'Modalità Formazione', subtitle: 'Scegli uno scenario. L\'IA interpreta il prospect. Termina la chiamata per il tuo report di coaching.', language: 'LINGUA', startTraining: 'Inizia Formazione', endSession: 'Termina Sessione', practicing: 'In pratica', yourResponse: 'La tua risposta...', generating: 'Generazione...', sessionComplete: 'Sessione Completata', practiceAgain: 'Pratica di Nuovo', backToDashboard: 'Torna alla Dashboard', quota: (u, t) => `${u} / ${t} sessioni usate questo mese`, quotaExhausted: t => `Limite mensile raggiunto — ${t} sessioni usate. Si azzera il mese prossimo.`, setupContext: 'Configura il tuo scenario', whatSelling: 'Cosa stai vendendo?', whatSellingPlaceholder: 'es. SaaS, consulenza, assicurazione...', selectSub: 'Seleziona un sotto-scenario', difficulty: 'Difficoltà', easy: 'Facile', medium: 'Medio', hard: 'Difficile', customScenario: 'Descrivi il tuo scenario', customPlaceholder: 'Descrivi il prospect e la situazione...', sessionHistory: 'Cronologia Sessioni', exchanges: n => `${n} scambio${n !== 1 ? 'i' : ''}`, score: 'Punteggio', keyTakeaway: 'PUNTO CHIAVE', strengths: '✓ Cosa hai fatto bene', improvements: '✗ Su cosa lavorare', practice: 'Pratica', academy: 'Accademia', loadingAcademy: 'Caricamento Accademia...', generatingReport: 'Generazione del tuo report di coaching...', scenarioLabel: 'SCENARIO', recent: 'RECENTI', describeProspect: 'Descrivi il tuo prospect', describeProspectSub: 'Spiega all\'IA chi sono, il loro atteggiamento e la loro situazione.', whatSellingContextSub: 'Dai contesto all\'IA per simulare un prospect realistico per il tuo settore.', prospectSpeaking: 'PROSPECT IN PAROLA', yourTurn: 'IL TUO TURNO', aiThinking: 'IA IN ELABORAZIONE...', waiting: 'IN ATTESA...' },
  scenarios: { priceObjection: 'Obiezione Prezzo', priceObjectionDesc: 'Il prospect dice che è troppo caro', notInterested: 'Non Interessato', notInterestedDesc: 'Il prospect vuole terminare la chiamata', thinkItOver: 'Ci Penso Su', thinkItOverDesc: 'Il prospect sta guadagnando tempo', sendMeInfo: 'Mandami Info', sendMeInfoDesc: 'Il prospect schiva con una richiesta email', coldOpener: 'Apertura a Freddo', coldOpenerDesc: 'Iniziare una cold call da zero', discovery: 'Scoperta', discoveryDesc: 'Scoprire punti di dolore e necessità', closing: 'Chiusura', closingDesc: 'Spingere per l\'impegno alla fine', random: 'Scenario Casuale', randomDesc: 'L\'IA genera una situazione a sorpresa', custom: 'Scenario Personalizzato', customDesc: 'Descrivi la tua persona prospect' },
  analytics: { avgClosePercent: 'Prob. Chiusura Med.', bestCall: 'Migliore Chiamata', callsWon: 'Chiamate Vinte', activeStages: 'Fasi Attive', mostCalls: 'Più Chiamate', bestStageAvg: 'Migliore Fase Med.', highScores: 'Punteggi Alti', mastered: 'Padroneggiati', avgBest: 'Migliore Med.', totalAttempts: 'Tentativi Totali', activeDays: 'Giorni Attivi', callAndTraining: 'Chiamata + Formazione', callOnly: 'Solo Chiamata', trainingOnly: 'Solo Formazione', trainingLabel: 'Formazione', title: 'Analisi', subtitle: 'Tendenze di performance su chiamate e formazione', totalCalls: 'Chiamate Totali', totalTime: 'Tempo Totale', avgScore: 'Punteggio Medio', objections: 'Obiezioni Gestite', noCalls: 'Ancora nessun dato', noCallsSub: 'Completa alcune chiamate per vedere le tue analisi.', callHistory: 'Cronologia Chiamate', performance: 'Prestazione', callIntel: 'Intel Chiamata', training: 'Formazione', team: 'Team', avgCloseProb: 'Prob. Chiusura Med.', avgLeadScore: 'Punteggio Lead Med.', avgDuration: 'Durata Med.', closeProbChart: n => `Prob. Chiusura — Ultime ${n} Chiamate`, callsByStage: 'Chiamate per Fase', activityDays: 'Attività — Ultimi 28 Giorni', viewDetails: 'Vedi Dettagli →', both: 'Entrambi', call: 'Chiamata', demoData: 'Dati Demo', totalSessions: 'Sessioni Totali', bestScore: 'Miglior Punteggio', lessonsTried: 'Lezioni Provate', scoreSessions: n => `Punteggio — Ultime ${n} Sessioni`, bestPerLesson: 'Miglior Punteggio per Lezione', topObjections: 'Principali Obiezioni e Tecniche', winningPatterns: 'Pattern Vincenti', stageDistribution: 'Distribuzione per Fase', bestDayToCall: 'Giorno Migliore per Chiamare', objectionToCloseRate: 'Tasso Obiezione-Chiusura', objectionCloseRateDesc: 'Come cambia la tua probabilità di chiusura in base al numero di obiezioni durante la chiamata.', closeProbOverTime: 'Probabilità di Chiusura nel Tempo', repScoreTrend: n => `Tendenza Punteggio (${n} chiamate)`, fullCallLog: 'Registro Completo delle Chiamate', callVolumeByStage: 'Volume Chiamate per Fase', perStageBreakdown: 'Dettaglio per Fase', dayGrid28: 'Griglia 28 Giorni', dailyBreakdown: 'Dettaglio Giornaliero', callDay: 'Giorno di chiamata', daysOff: 'Giorni senza chiamate', teamLeaderboard: 'Classifica del Team — Questo Mese', managerCreateTeam: 'Manager — Crea Team', repJoinTeam: 'Rep — Unisciti a un Team', teamCodeDesc: 'Genera un codice team e condividilo con i tuoi rappresentanti per connettere le statistiche di tutti.', teamJoinDesc: 'Inserisci il codice condiviso dal tuo manager per unirti al team e apparire nella classifica.', codeCopied: 'Codice copiato!', teamCodeCreated: 'Codice team creato. Condividilo con i tuoi rappresentanti.', joinedTeamMsg: code => `Unito al team ${code}.`, currentlyInTeam: 'Team attuale: ', copyBtn: '⎘ Copia', generateTeamCode: 'Genera Codice Team', joinBtn: 'Unisciti', teamCodePlaceholder: 'Codice team (es. ABC123)', colDate: 'Data', colDuration: 'Durata', colClosePercent: 'Chiusura %', colLeadScore: 'Punteggio Lead', colStage: 'Fase', colObjections: 'Obiezioni', colCalls: 'Chiamate', colAvgClosePercent: 'Chiusura % Media', colAvgDuration: 'Durata Media', colRep: 'Rappresentante', colTraining: 'Formazione', colStreak: 'Serie', closeProbDetail: 'Probabilità di Chiusura', closeProbDetailSub: 'Tendenza del tasso di successo su tutte le chiamate registrate', callsByStageDetail: 'Chiamate per Fase', callsByStageDetailSub: 'Dove terminano le tue chiamate e come performano in ogni fase', activityLogDetail: 'Registro Attività', activityLogDetailSub: 'Attività giornaliera delle chiamate negli ultimi 28 giorni', avgRepScore: 'Punteggio Rep Medio', avgTalkRatio: 'Rapporto Conversazione Medio', avgCloseProbLabel: 'probabilità di chiusura media', successWhenHandled: pct => `${pct}% di successo nella gestione`, objZero: '0 obiezioni', objOne: '1 obiezione', objTwoPlus: '2+ obiezioni', callsUnit: 'chiamate', winPatternDuration: botDur => `durata media nelle tue chiamate migliori vs ${botDur} in quelle peggiori`, winPatternObjections: botObj => `obiezioni medie nelle chiamate vinte vs ${botObj} nelle perse — gestirle presto conta`, winPatternCloseStage: otherP => `probabilità di chiusura media nelle chiamate che hanno raggiunto la fase di Chiusura vs ${otherP}% nelle fasi precedenti`, objPriceBudget: 'Prezzo / budget', objNotRightTime: 'Non è il momento giusto', objAlreadyVendor: 'Hanno già un fornitore', objNotInterested: 'Non interessato', techAnchorROI: 'Ancorarsi al ROI — collega il costo al valore risparmiato o al problema risolto', techFuturePace: 'Anticipare il costo del ritardo — mostra cosa costa aspettare', techContrast: 'Posizionamento per contrasto — isola il punto in cui sei migliore' },
  trainingExtra: { practiceTitle: 'Scenari di Pratica', practiceDesc: 'Allenati con simulazioni di prospect alimentate da IA. Ottieni feedback immediato su ogni risposta.', practiceFeature1: '9 scenari di vendita unici', practiceFeature2: 'Difficoltà facile, media e brutale', practiceFeature3: 'Report completo alla fine di ogni sessione', practiceCta: 'Inizia a Praticare →', academyTitle: 'Accademia AI', academyDesc: 'Lezioni strutturate per sviluppare vere abilità di vendita.', academyFeature1: '3 livelli — Principiante ad Avanzato', academyFeature2: '27 lezioni: prima insegnate, poi testate', academyFeature3: 'Tieni traccia dei tuoi punteggi e miglioramenti', academyCta: 'Inizia a Imparare →', backToSelection: '← Torna alla selezione', switchToAcademy: 'Passa all\'Accademia ◈', switchToPractice: 'Passa alla Pratica ◎' },
  precall: { title: 'Configurazione Pre-Chiamata', prospectName: 'Nome del Prospect', prospectNamePlaceholder: 'es. Mario Rossi', company: 'Azienda', companyPlaceholder: 'es. Acme Srl', callGoal: 'Obiettivo della Chiamata', callGoalPlaceholder: 'es. Prenotare una demo, chiudere l\'affare...', yourPitch: 'La Tua Proposta / Prodotto', yourPitchPlaceholder: 'Cosa stai vendendo?', language: 'Lingua', startCall: 'Avvia Chiamata' },
  liveCall: { endCall: 'Termina Chiamata', mute: 'Silenzia', unmute: 'Riattiva', aiSuggestions: 'Suggerimenti IA', transcript: 'Trascrizione', closeProbability: 'Prob. di Chiusura', stage: 'Fase', note: 'Nota', addNote: 'Aggiungi nota...', listening: 'In ascolto...', liveMode: 'MODALITÀ LIVE', noProspect: 'Nessun prospect', active: 'ATTIVO', standby: 'STANDBY', objections: 'OBIEZIONI', closeProb: 'PROB. CHIUSURA', aiFeed: 'FEED INTELLIGENZA IA', coaching: 'COACHING', readyToAssist: 'Pronto ad Assistere', readyDesc: 'Clicca su Ascolta nel pannello di trascrizione per avviare il microfono.', transcriptFeed: 'FEED TRASCRIZIONE', live: 'LIVE', you: 'TU', prospect: 'PROSPECT', system: 'SISTEMA', listeningStatus: 'In ascolto — i parlanti vengono rilevati automaticamente.', micStarting: 'Avvio microfono... o digita il dialogo del prospect qui sotto.', typeProspect: 'Digita cosa ha detto il prospect...', leadProfile: 'PROFILO PROSPECT', name: 'Nome', company: 'Azienda', goal: 'Obiettivo', pitch: 'Proposta', callStats: 'STATISTICHE CHIAMATA', quickActions: 'AZIONI RAPIDE', callNotes: 'NOTE CHIAMATA', noLeadData: 'Nessun dato prospect ancora. Inizia una conversazione per costruire il profilo.', summarizeCall: 'Riassumi chiamata', generateEmail: 'Genera email di follow-up', exportLead: 'Esporta dati prospect', scoreLead: 'Valuta questo prospect', stageOpener: 'APERTURA', stageDiscovery: 'SCOPERTA', stagePitch: 'PROPOSTA', stageClose: 'CHIUSURA' },
  postcall: { title: 'Revisione Chiamata', summary: 'Riepilogo', transcript: 'Trascrizione', newCall: 'Nuova Chiamata', backToDashboard: 'Torna alla Dashboard', followUp: 'Email di Follow-up', copyEmail: 'Copia Email', notes: 'Note', addNote: 'Aggiungi nota...', saveNote: 'Salva', duration: 'Durata', score: 'Punteggio di Chiusura', objections: 'Obiezioni', leadScore: 'Punteggio Lead', entries: 'Voci', stageReached: 'Fase Raggiunta', savedToCrm: 'Salvato nel CRM', download: 'Scarica .TXT' },
  auth: { signIn: 'Accedi', signUp: 'Registrati', email: 'Email', password: 'Password', forgotPassword: 'Password dimenticata?', continueWithGoogle: 'Continua con Google', alreadyHaveAccount: 'Hai già un account?', dontHaveAccount: 'Non hai un account?', backToHome: 'Torna alla home' },
  onboarding: { welcome: 'Benvenuto su Pitchbase', yourName: 'Il Tuo Nome', yourNamePlaceholder: 'es. Alex Rossi', yourRole: 'Il Tuo Ruolo', yourRolePlaceholder: 'es. Account Executive', whatYouSell: 'Cosa vendi?', whatYouSellPlaceholder: 'es. SaaS, consulenza, assicurazione...', language: 'Lingua Preferita', letsGo: 'Andiamo →' },
  upload: { title: 'Carica Registrazione', subtitle: 'Carica una registrazione per ottenere coaching IA e un debriefing completo.', dropzone: 'Trascina il tuo file audio qui', analyzing: 'Analisi della chiamata in corso...', browseFiles: 'Sfoglia file' },
};

const nl: T = {
  nav: { dashboard: 'Dashboard', training: 'Training', analytics: 'Analyse', leads: 'Leads', meetings: 'Vergaderingen', newCall: '▶ Nieuw Gesprek', upload: '↑ Uploaden' },
  common: { back: 'Terug', cancel: 'Annuleren', save: 'Opslaan', send: 'Versturen', start: 'Starten', done: 'Klaar', close: 'Sluiten', loading: 'Laden...', signOut: 'Uitloggen', next: 'Volgende', skip: 'Overslaan', edit: 'Bewerken', delete: 'Verwijderen', confirm: 'Bevestigen', tryAgain: 'Opnieuw proberen', learnMore: 'Meer weten', or: 'of' },
  profile: { activity: 'ACTIVITEIT', appearance: 'WEERGAVE', dark: 'Donker', light: 'Licht', calls: n => `${n} gesprek${n !== 1 ? 'ken' : ''}`, trainingSessions: n => `${n} trainingssessie${n !== 1 ? 's' : ''}`, totalOnPlatform: 'totaal op het platform', maxRank: '✦ Maximale rang bereikt', appLanguage: 'App-taal', langNote: 'Beïnvloedt de taal van coaching en training. Per gesprek aanpasbaar in de voorbereiding.' },
  tiers: { title: 'Rang-Niveaus', subtitle: 'Ontgrendel niveaus door echte gesprekken en trainingsessies te voltooien. Beide moeten de drempel bereiken.', unlocked: 'Ontgrendeld', noCalls: 'Geen gesprekken vereist', noSessions: 'Geen sessies vereist', calls: 'gesprekken', sessions: 'trainingsessies', percentThere: '% behaald' },
  dashboard: { greeting: name => `Welkom terug${name ? `, ${name}` : ''}`, tagline: 'Uw persoonlijke AI-verkoopcoach', streakMessage: n => `${n}-daagse oefenreeks — houd het vol!`, recentCalls: 'Recente Gesprekken', noCalls: 'Nog geen gesprekken', noCallsSub: 'Start uw eerste gesprek om uw geschiedenis hier te zien.', startCall: 'Nieuw Gesprek', uploadCall: 'Opname uploaden', duration: 'Duur', score: 'Score', stage: 'Fase', viewSession: 'Bekijken', deleteSession: 'Verwijderen', totalCalls: 'Totaal Gesprekken', avgCloseProb: 'Gem. Afsluitkans', totalObjections: 'Totaal Bezwaren', avgDuration: 'Gem. Duur', practiceStreak: 'Oefenreeks', total: 'totaal', overview: 'Overzicht', contacts: 'Contacten', contactsSub: 'Alle prospects uit uw gespreksgeschiedenis', noContacts: 'Nog geen contacten', noContactsSub: 'Voltooi een gesprek om contacten hier te zien.', noResults: 'Geen resultaten', searchPlaceholder: 'Zoeken op naam of bedrijf…', latestScore: 'Laatste Score', bestCloseProb: 'Beste Afsluitkans', latestSummary: 'Laatste AI-samenvatting', latestNotes: 'Laatste Notities', latestEmail: 'Laatste Opvolg-e-mail', callHistory: 'Gespreksgeschiedenis', copy: 'Kopiëren', copied: 'Gekopieerd', callCount: n => `${n} gesprek${n !== 1 ? 'ken' : ''}` },
  training: { title: 'Trainingsmodus', subtitle: 'Kies een scenario. De AI speelt de prospect. Beëindig het gesprek voor uw coachingrapport.', language: 'TAAL', startTraining: 'Training Starten', endSession: 'Sessie Beëindigen', practicing: 'Aan het oefenen', yourResponse: 'Uw antwoord...', generating: 'Genereren...', sessionComplete: 'Sessie Voltooid', practiceAgain: 'Opnieuw oefenen', backToDashboard: 'Terug naar Dashboard', quota: (u, t) => `${u} / ${t} sessies gebruikt deze maand`, quotaExhausted: t => `Maandlimiet bereikt — ${t} sessies gebruikt. Wordt volgende maand gereset.`, setupContext: 'Scenario instellen', whatSelling: 'Wat verkoopt u?', whatSellingPlaceholder: 'bijv. SaaS, advies, verzekering...', selectSub: 'Selecteer een subscenario', difficulty: 'Moeilijkheid', easy: 'Makkelijk', medium: 'Gemiddeld', hard: 'Moeilijk', customScenario: 'Beschrijf uw scenario', customPlaceholder: 'Beschrijf de prospect en situatie...', sessionHistory: 'Sessiegeschiedenis', exchanges: n => `${n} uitwisseling${n !== 1 ? 'en' : ''}`, score: 'Score', keyTakeaway: 'BELANGRIJK INZICHT', strengths: '✓ Wat u goed deed', improvements: '✗ Waar u aan moet werken', practice: 'Oefening', academy: 'Academie', loadingAcademy: 'Academie laden...', generatingReport: 'Coachingrapport genereren...', scenarioLabel: 'SCENARIO', recent: 'RECENT', describeProspect: 'Beschrijf uw prospect', describeProspectSub: 'Vertel de AI wie ze zijn, hun houding en hun situatie.', whatSellingContextSub: 'Geef de AI context zodat het een realistische prospect voor uw branche kan simuleren.', prospectSpeaking: 'PROSPECT SPREEKT', yourTurn: 'UW BEURT', aiThinking: 'AI DENKT...', waiting: 'WACHTEN...' },
  scenarios: { priceObjection: 'Prijsbezwaar', priceObjectionDesc: 'Prospect zegt dat het te duur is', notInterested: 'Niet Geïnteresseerd', notInterestedDesc: 'Prospect wil het gesprek beëindigen', thinkItOver: 'Ik Denk Erover Na', thinkItOverDesc: 'Prospect rekent op tijd', sendMeInfo: 'Stuur Me Info', sendMeInfoDesc: 'Prospect ontwijkt met e-mailverzoek', coldOpener: 'Cold Call Opener', coldOpenerDesc: 'Koud gesprek van de grond af beginnen', discovery: 'Ontdekking', discoveryDesc: 'Pijnpunten en behoeften blootleggen', closing: 'Afsluiting', closingDesc: 'Toewijding aan het einde afdwingen', random: 'Willekeurig Scenario', randomDesc: 'AI genereert een verrassende situatie', custom: 'Aangepast Scenario', customDesc: 'Beschrijf uw eigen prospect persona' },
  analytics: { avgClosePercent: 'Gem. Afsluiting %', bestCall: 'Beste Gesprek', callsWon: 'Gewonnen Gesprekken', activeStages: 'Actieve Fases', mostCalls: 'Meeste Gesprekken', bestStageAvg: 'Beste Fase Gem.', highScores: 'Hoge Scores', mastered: 'Beheerst', avgBest: 'Beste Gem.', totalAttempts: 'Totaal Pogingen', activeDays: 'Actieve Dagen', callAndTraining: 'Gesprek + Training', callOnly: 'Alleen Gesprek', trainingOnly: 'Alleen Training', trainingLabel: 'Training', title: 'Analyse', subtitle: 'Prestatietrends bij gesprekken en training', totalCalls: 'Totaal Gesprekken', totalTime: 'Totale Tijd', avgScore: 'Gem. Score', objections: 'Bezwaren Behandeld', noCalls: 'Nog geen gegevens', noCallsSub: 'Voltooi wat gesprekken om uw analyses te zien.', callHistory: 'Gespreksgeschiedenis', performance: 'Prestatie', callIntel: 'Gesprek Intel', training: 'Training', team: 'Team', avgCloseProb: 'Gem. Afsluitkans', avgLeadScore: 'Gem. Leadscore', avgDuration: 'Gem. Duur', closeProbChart: n => `Afsluitkans — Laatste ${n} Gesprekken`, callsByStage: 'Gesprekken per Fase', activityDays: 'Activiteit — Laatste 28 Dagen', viewDetails: 'Details bekijken →', both: 'Beide', call: 'Gesprek', demoData: 'Demogegevens', totalSessions: 'Totaal Sessies', bestScore: 'Beste Score', lessonsTried: 'Lessen Geprobeerd', scoreSessions: n => `Score — Laatste ${n} Sessies`, bestPerLesson: 'Beste Score per Les', topObjections: 'Belangrijkste Bezwaren en Technieken', winningPatterns: 'Winnende Patronen', stageDistribution: 'Faseverdeling', bestDayToCall: 'Beste Dag om te Bellen', objectionToCloseRate: 'Bezwaar-naar-Afsluiting-Ratio', objectionCloseRateDesc: 'Hoe uw afsluitkans verandert op basis van het aantal bezwaren tijdens een gesprek.', closeProbOverTime: 'Afsluitkans in de Tijd', repScoreTrend: n => `Trend Vertegenwoordigerscore (${n} gesprekken)`, fullCallLog: 'Volledig Gesprekslogboek', callVolumeByStage: 'Gespreksvolume per Fase', perStageBreakdown: 'Uitsplitsing per Fase', dayGrid28: '28-Dagenraster', dailyBreakdown: 'Dagelijkse Uitsplitsing', callDay: 'Beldag', daysOff: 'Dagen zonder gesprekken', teamLeaderboard: 'Teamklassement — Deze Maand', managerCreateTeam: 'Manager — Team Aanmaken', repJoinTeam: 'Vertegenwoordiger — Team Toetreden', teamCodeDesc: 'Genereer een teamcode en deel die met uw vertegenwoordigers om statistieken te koppelen.', teamJoinDesc: 'Voer de code in die uw manager heeft gedeeld om het team te joinen en in het klassement te verschijnen.', codeCopied: 'Code gekopieerd!', teamCodeCreated: 'Teamcode aangemaakt. Deel hem met uw vertegenwoordigers.', joinedTeamMsg: code => `Team ${code} toegetreden.`, currentlyInTeam: 'Huidig team: ', copyBtn: '⎘ Kopiëren', generateTeamCode: 'Teamcode Genereren', joinBtn: 'Toetreden', teamCodePlaceholder: 'Teamcode (bijv. ABC123)', colDate: 'Datum', colDuration: 'Duur', colClosePercent: 'Afsluiting %', colLeadScore: 'Leadscore', colStage: 'Fase', colObjections: 'Bezwaren', colCalls: 'Gesprekken', colAvgClosePercent: 'Gem. Afsluiting %', colAvgDuration: 'Gemiddelde Duur', colRep: 'Vertegenwoordiger', colTraining: 'Training', colStreak: 'Reeks', closeProbDetail: 'Afsluitkans', closeProbDetailSub: 'Successratio-trend over alle geregistreerde gesprekken', callsByStageDetail: 'Gesprekken per Fase', callsByStageDetailSub: 'Waar uw gesprekken eindigen en hoe ze presteren per fase', activityLogDetail: 'Activiteitenlogboek', activityLogDetailSub: 'Dagelijkse gespreksactiviteit van de afgelopen 28 dagen', avgRepScore: 'Gem. Vertegenwoordigerscore', avgTalkRatio: 'Gem. Spreekratio', avgCloseProbLabel: 'gemiddelde afsluitkans', successWhenHandled: pct => `${pct}% succes bij afhandeling`, objZero: '0 bezwaren', objOne: '1 bezwaar', objTwoPlus: '2+ bezwaren', callsUnit: 'gesprekken', winPatternDuration: botDur => `gemiddelde duur bij uw best presterende gesprekken vs ${botDur} bij de minst presterende`, winPatternObjections: botObj => `gemiddelde bezwaren bij gewonnen gesprekken vs ${botObj} bij verloren — vroeg afhandelen telt`, winPatternCloseStage: otherP => `gemiddelde afsluitkans bij gesprekken die de Afsluitingsfase bereikten vs ${otherP}% bij eerdere fasen`, objPriceBudget: 'Prijs / budget', objNotRightTime: 'Niet het juiste moment', objAlreadyVendor: 'Hebben al een leverancier', objNotInterested: 'Niet geïnteresseerd', techAnchorROI: 'Verankeren aan ROI — koppel kosten aan waarde bespaard of probleem opgelost', techFuturePace: 'Vertragingskosten vooruitblikken — laat zien wat wachten kost', techContrast: 'Contrastpositionering — isoleer het ene punt waarop u beter bent' },
  trainingExtra: { practiceTitle: 'Oefenscenario\'s', practiceDesc: 'Train met AI-gestuurde prospectsimulaties. Ontvang direct coachingfeedback op elk antwoord.', practiceFeature1: '9 unieke verkoopscenario\'s', practiceFeature2: 'Gemakkelijke, gemiddelde en brutale moeilijkheidsgraad', practiceFeature3: 'Volledig coachingrapport aan het einde van elke sessie', practiceCta: 'Begin te Oefenen →', academyTitle: 'AI Academie', academyDesc: 'Gestructureerde lessen om echte verkoopvaardigheden op te bouwen.', academyFeature1: '3 niveaus — Beginner tot Gevorderd', academyFeature2: '27 lessen: eerst onderwezen, dan getoetst', academyFeature3: 'Volg uw scores en verbetering', academyCta: 'Begin te Leren →', backToSelection: '← Terug naar selectie', switchToAcademy: 'Overschakelen naar Academie ◈', switchToPractice: 'Overschakelen naar Oefening ◎' },
  precall: { title: 'Gespreksvoorbereiding', prospectName: 'Naam Prospect', prospectNamePlaceholder: 'bijv. Jan de Vries', company: 'Bedrijf', companyPlaceholder: 'bijv. Acme BV', callGoal: 'Gespreksdoel', callGoalPlaceholder: 'bijv. Demo boeken, deal sluiten...', yourPitch: 'Uw Aanbod / Product', yourPitchPlaceholder: 'Wat verkoopt u?', language: 'Taal', startCall: 'Gesprek Starten' },
  liveCall: { endCall: 'Gesprek Beëindigen', mute: 'Dempen', unmute: 'Dempen opheffen', aiSuggestions: 'AI-Suggesties', transcript: 'Transcript', closeProbability: 'Kans op Afsluiting', stage: 'Fase', note: 'Notitie', addNote: 'Notitie toevoegen...', listening: 'Luistert...', liveMode: 'LIVE MODUS', noProspect: 'Geen prospect', active: 'ACTIEF', standby: 'STAND-BY', objections: 'BEZWAREN', closeProb: 'AFSLUITKANS', aiFeed: 'AI INTELLIGENTIE FEED', coaching: 'COACHING', readyToAssist: 'Klaar om te Helpen', readyDesc: 'Klik op Luisteren in het transcriptpaneel om de microfoon te starten.', transcriptFeed: 'TRANSCRIPT FEED', live: 'LIVE', you: 'U', prospect: 'PROSPECT', system: 'SYSTEEM', listeningStatus: 'Luistert — sprekers worden automatisch gedetecteerd.', micStarting: 'Microfoon start... of typ het prospectdialoog hieronder.', typeProspect: 'Typ wat de prospect zei...', leadProfile: 'PROSPECT PROFIEL', name: 'Naam', company: 'Bedrijf', goal: 'Doel', pitch: 'Pitch', callStats: 'GESPREKSSTATISTIEKEN', quickActions: 'SNELLE ACTIES', callNotes: 'GESPREKSNOTITIES', noLeadData: 'Nog geen prospectgegevens. Start een gesprek om het profiel op te bouwen.', summarizeCall: 'Gesprek samenvatten', generateEmail: 'Opvolg-e-mail genereren', exportLead: 'Prospectgegevens exporteren', scoreLead: 'Dit prospect beoordelen', stageOpener: 'OPENER', stageDiscovery: 'VERKENNING', stagePitch: 'PITCH', stageClose: 'AFSLUITING' },
  postcall: { title: 'Gespreksevaluatie', summary: 'Samenvatting', transcript: 'Transcript', newCall: 'Nieuw Gesprek', backToDashboard: 'Terug naar Dashboard', followUp: 'Opvolg-e-mail', copyEmail: 'E-mail kopiëren', notes: 'Notities', addNote: 'Notitie toevoegen...', saveNote: 'Opslaan', duration: 'Duur', score: 'Afsluitingsscore', objections: 'Bezwaren', leadScore: 'Leadscore', entries: 'Items', stageReached: 'Bereikte Fase', savedToCrm: 'Opgeslagen in CRM', download: '.TXT downloaden' },
  auth: { signIn: 'Inloggen', signUp: 'Registreren', email: 'E-mail', password: 'Wachtwoord', forgotPassword: 'Wachtwoord vergeten?', continueWithGoogle: 'Doorgaan met Google', alreadyHaveAccount: 'Heeft u al een account?', dontHaveAccount: 'Heeft u nog geen account?', backToHome: 'Terug naar home' },
  onboarding: { welcome: 'Welkom bij Pitchbase', yourName: 'Uw Naam', yourNamePlaceholder: 'bijv. Alex de Vries', yourRole: 'Uw Functie', yourRolePlaceholder: 'bijv. Account Executive', whatYouSell: 'Wat verkoopt u?', whatYouSellPlaceholder: 'bijv. SaaS, advies, verzekering...', language: 'Voorkeurstaal', letsGo: 'Aan de slag →' },
  upload: { title: 'Opname Uploaden', subtitle: 'Upload een opname voor AI-coaching en een volledig debriefing.', dropzone: 'Sleep uw audiobestand hier', analyzing: 'Gesprek analyseren...', browseFiles: 'Bestanden zoeken' },
};

const zh: T = {
  nav: { dashboard: '仪表板', training: '训练', analytics: '分析', leads: '线索', meetings: '会议', newCall: '▶ 新通话', upload: '↑ 上传' },
  common: { back: '返回', cancel: '取消', save: '保存', send: '发送', start: '开始', done: '完成', close: '关闭', loading: '加载中...', signOut: '退出登录', next: '下一步', skip: '跳过', edit: '编辑', delete: '删除', confirm: '确认', tryAgain: '重试', learnMore: '了解更多', or: '或' },
  profile: { activity: '活动', appearance: '外观', dark: '深色', light: '浅色', calls: n => `${n} 次通话`, trainingSessions: n => `${n} 次训练`, totalOnPlatform: '平台总时长', maxRank: '✦ 已达最高等级', appLanguage: '应用语言', langNote: '影响辅导和训练语言。可在通话前设置中逐次更改。' },
  tiers: { title: '等级体系', subtitle: '通过完成真实通话和训练课程解锁等级，两项均须达到阈值方可晋升。', unlocked: '已解锁', noCalls: '无通话要求', noSessions: '无课程要求', calls: '次通话', sessions: '次训练', percentThere: '% 进度' },
  dashboard: { greeting: name => `欢迎回来${name ? `，${name}` : ''}`, tagline: '您的个人AI销售教练', streakMessage: n => `连续练习${n}天 — 继续加油！`, recentCalls: '近期通话', noCalls: '暂无通话', noCallsSub: '开始您的第一次通话，历史记录将显示在此处。', startCall: '新建通话', uploadCall: '上传录音', duration: '时长', score: '评分', stage: '阶段', viewSession: '查看', deleteSession: '删除', totalCalls: '总通话数', avgCloseProb: '平均成交概率', totalObjections: '总异议数', avgDuration: '平均时长', practiceStreak: '练习连击', total: '共', overview: '概览', contacts: '联系人', contactsSub: '通话历史中的所有潜在客户', noContacts: '暂无联系人', noContactsSub: '完成通话后联系人将显示在此处。', noResults: '无结果', searchPlaceholder: '按姓名或公司搜索…', latestScore: '最新评分', bestCloseProb: '最佳成交概率', latestSummary: '最新AI总结', latestNotes: '最新通话记录', latestEmail: '最新跟进邮件', callHistory: '通话历史', copy: '复制', copied: '已复制', callCount: n => `${n}次通话` },
  training: { title: '训练模式', subtitle: '选择一个场景，AI扮演潜在客户。结束通话后获取您的辅导报告。', language: '语言', startTraining: '开始训练', endSession: '结束课程', practicing: '训练中', yourResponse: '您的回复...', generating: '生成中...', sessionComplete: '课程完成', practiceAgain: '再次练习', backToDashboard: '返回仪表板', quota: (u, t) => `本月已使用 ${u} / ${t} 次`, quotaExhausted: t => `已达本月上限 — 已使用 ${t} 次。下月重置。`, setupContext: '配置场景', whatSelling: '您在销售什么？', whatSellingPlaceholder: '例如：SaaS软件、咨询服务、保险...', selectSub: '选择子场景', difficulty: '难度', easy: '简单', medium: '中等', hard: '困难', customScenario: '描述您的场景', customPlaceholder: '描述潜在客户和情况...', sessionHistory: '历史记录', exchanges: n => `${n} 次交流`, score: '评分', keyTakeaway: '关键要点', strengths: '✓ 做得好的地方', improvements: '✗ 需要改进的地方', practice: '自由练习', academy: '学院', loadingAcademy: '加载学院...', generatingReport: '正在生成辅导报告...', scenarioLabel: '场景', recent: '最近', describeProspect: '描述您的客户', describeProspectSub: '告诉AI他们是谁、他们的态度和情况。', whatSellingContextSub: '给AI提供背景，以便它能模拟您行业的真实客户。', prospectSpeaking: '客户正在说话', yourTurn: '您的回合', aiThinking: 'AI思考中...', waiting: '等待中...' },
  scenarios: { priceObjection: '价格异议', priceObjectionDesc: '客户说太贵了', notInterested: '不感兴趣', notInterestedDesc: '客户想结束通话', thinkItOver: '考虑一下', thinkItOverDesc: '客户在拖延时间', sendMeInfo: '发资料给我', sendMeInfoDesc: '客户用邮件请求来回避', coldOpener: '冷呼叫开场', coldOpenerDesc: '从零开始进行冷呼叫', discovery: '需求挖掘', discoveryDesc: '发现痛点和需求', closing: '促成成交', closingDesc: '在最后推动承诺', random: '随机场景', randomDesc: 'AI生成惊喜情境', custom: '自定义场景', customDesc: '描述您自己的客户画像' },
  analytics: { avgClosePercent: '平均成交%', bestCall: '最佳通话', callsWon: '赢得通话', activeStages: '活跃阶段', mostCalls: '最多通话', bestStageAvg: '最佳阶段均值', highScores: '高分', mastered: '已掌握', avgBest: '最佳均值', totalAttempts: '总尝试次数', activeDays: '活跃天数', callAndTraining: '通话+训练', callOnly: '仅通话', trainingOnly: '仅训练', trainingLabel: '训练', title: '分析', subtitle: '通话和培训的绩效趋势', totalCalls: '通话总数', totalTime: '总时长', avgScore: '平均评分', objections: '处理的异议', noCalls: '暂无数据', noCallsSub: '完成一些通话后查看您的分析。', callHistory: '通话历史', performance: '表现', callIntel: '通话情报', training: '训练', team: '团队', avgCloseProb: '平均成交概率', avgLeadScore: '平均线索评分', avgDuration: '平均时长', closeProbChart: n => `成交概率 — 最近${n}次通话`, callsByStage: '各阶段通话', activityDays: '活动 — 最近28天', viewDetails: '查看详情 →', both: '两者', call: '通话', demoData: '演示数据', totalSessions: '总会话数', bestScore: '最佳评分', lessonsTried: '尝试的课程', scoreSessions: n => `评分 — 最近${n}次会话`, bestPerLesson: '每课最佳评分', topObjections: '主要异议与应对技巧', winningPatterns: '成功模式', stageDistribution: '阶段分布', bestDayToCall: '最佳通话日', objectionToCloseRate: '异议与成交率', objectionCloseRateDesc: '基于通话中出现的异议数量，分析您的成交概率变化。', closeProbOverTime: '成交概率趋势', repScoreTrend: n => `销售代表评分趋势（${n}次通话）`, fullCallLog: '完整通话记录', callVolumeByStage: '各阶段通话量', perStageBreakdown: '各阶段详情', dayGrid28: '28天日历', dailyBreakdown: '每日明细', callDay: '通话日', daysOff: '空白天数', teamLeaderboard: '团队排行榜 — 本月', managerCreateTeam: '管理员 — 创建团队', repJoinTeam: '销售代表 — 加入团队', teamCodeDesc: '生成团队码并分享给您的团队成员，以连接所有人的统计数据。', teamJoinDesc: '输入您的管理员分享的团队码，加入团队并显示在排行榜中。', codeCopied: '已复制团队码！', teamCodeCreated: '团队码已创建，请分享给您的团队成员。', joinedTeamMsg: code => `已加入团队 ${code}。`, currentlyInTeam: '当前所在团队：', copyBtn: '⎘ 复制', generateTeamCode: '生成团队码', joinBtn: '加入', teamCodePlaceholder: '团队码（例：ABC123）', colDate: '日期', colDuration: '时长', colClosePercent: '成交%', colLeadScore: '线索评分', colStage: '阶段', colObjections: '异议', colCalls: '通话数', colAvgClosePercent: '平均成交%', colAvgDuration: '平均时长', colRep: '销售代表', colTraining: '训练', colStreak: '连击', closeProbDetail: '成交概率', closeProbDetailSub: '所有录制通话的成交率趋势', callsByStageDetail: '各阶段通话', callsByStageDetailSub: '您的通话在哪个阶段结束，以及各阶段的表现', activityLogDetail: '活动日志', activityLogDetailSub: '过去28天的每日通话活动', avgRepScore: '平均销售代表评分', avgTalkRatio: '平均发言比例', avgCloseProbLabel: '平均成交概率', successWhenHandled: pct => `处理成功率 ${pct}%`, objZero: '0个异议', objOne: '1个异议', objTwoPlus: '2个以上异议', callsUnit: '次通话', winPatternDuration: botDur => `您的高效通话平均时长 vs ${botDur}（低效通话）`, winPatternObjections: botObj => `获胜通话平均异议数 vs 失败通话 ${botObj}个 — 提前处理更重要`, winPatternCloseStage: otherP => `进入成交阶段的通话平均成交概率 vs 早期阶段通话 ${otherP}%`, objPriceBudget: '价格/预算问题', objNotRightTime: '时机不合适', objAlreadyVendor: '已有供应商', objNotInterested: '不感兴趣', techAnchorROI: '锚定投资回报率 — 将费用与节省的价值或解决的问题挂钩', techFuturePace: '前瞻性预测延迟成本 — 展示等待的代价', techContrast: '对比定位 — 突出您在某一点上的独特优势' },
  trainingExtra: { practiceTitle: '练习场景', practiceDesc: '使用AI驱动的潜在客户模拟进行训练，每次回复都能获得即时辅导反馈。', practiceFeature1: '9个独特的销售场景', practiceFeature2: '简单、中等和困难难度', practiceFeature3: '每次会话结束后的完整辅导报告', practiceCta: '开始练习 →', academyTitle: 'AI学院', academyDesc: '结构化课程，旨在培养真正的销售技能。', academyFeature1: '3个技能等级 — 初学者到高级', academyFeature2: '27节课：先教后测', academyFeature3: '跟踪您的分数和进步', academyCta: '开始学习 →', backToSelection: '← 返回选择', switchToAcademy: '切换到学院 ◈', switchToPractice: '切换到练习 ◎' },
  precall: { title: '通话前设置', prospectName: '潜在客户姓名', prospectNamePlaceholder: '例如：张三', company: '公司', companyPlaceholder: '例如：某科技有限公司', callGoal: '通话目标', callGoalPlaceholder: '例如：预约演示、完成成交...', yourPitch: '您的方案/产品', yourPitchPlaceholder: '您在销售什么？', language: '语言', startCall: '开始通话' },
  liveCall: { endCall: '结束通话', mute: '静音', unmute: '取消静音', aiSuggestions: 'AI建议', transcript: '实时转录', closeProbability: '成交概率', stage: '阶段', note: '备注', addNote: '添加备注...', listening: '监听中...', liveMode: '直播模式', noProspect: '无客户', active: '通话中', standby: '待机', objections: '异议', closeProb: '成交概率', aiFeed: 'AI智能推送', coaching: '辅导', readyToAssist: '准备就绪', readyDesc: '点击转录面板中的"监听"启动麦克风。', transcriptFeed: '实时转录', live: '直播', you: '您', prospect: '客户', system: '系统', listeningStatus: '监听中 — 说话人自动识别。', micStarting: '麦克风启动中...或在下方输入客户对话。', typeProspect: '输入客户说的话...', leadProfile: '客户资料', name: '姓名', company: '公司', goal: '目标', pitch: '产品介绍', callStats: '通话统计', quickActions: '快速操作', callNotes: '通话备注', noLeadData: '暂无客户数据。开始对话以建立资料。', summarizeCall: '总结通话', generateEmail: '生成跟进邮件', exportLead: '导出客户数据', scoreLead: '评分此客户', stageOpener: '开场', stageDiscovery: '挖掘需求', stagePitch: '产品介绍', stageClose: '促单' },
  postcall: { title: '通话回顾', summary: '摘要', transcript: '转录', newCall: '新建通话', backToDashboard: '返回仪表板', followUp: '跟进邮件', copyEmail: '复制邮件', notes: '备注', addNote: '添加备注...', saveNote: '保存', duration: '时长', score: '成交评分', objections: '异议', leadScore: '线索评分', entries: '条目', stageReached: '达到阶段', savedToCrm: '已保存至CRM', download: '下载.TXT' },
  auth: { signIn: '登录', signUp: '注册', email: '邮箱', password: '密码', forgotPassword: '忘记密码？', continueWithGoogle: '使用Google继续', alreadyHaveAccount: '已有账户？', dontHaveAccount: '没有账户？', backToHome: '返回首页' },
  onboarding: { welcome: '欢迎使用Pitchbase', yourName: '您的姓名', yourNamePlaceholder: '例如：张三', yourRole: '您的职位', yourRolePlaceholder: '例如：客户经理', whatYouSell: '您销售什么？', whatYouSellPlaceholder: '例如：SaaS、咨询、保险...', language: '偏好语言', letsGo: '开始 →' },
  upload: { title: '上传录音', subtitle: '上传通话录音，获取AI辅导和完整分析报告。', dropzone: '将音频文件拖放到此处', analyzing: '正在分析您的通话...', browseFiles: '浏览文件' },
};

const ja: T = {
  nav: { dashboard: 'ダッシュボード', training: 'トレーニング', analytics: '分析', leads: 'リード', meetings: 'ミーティング', newCall: '▶ 新規通話', upload: '↑ アップロード' },
  common: { back: '戻る', cancel: 'キャンセル', save: '保存', send: '送信', start: '開始', done: '完了', close: '閉じる', loading: '読み込み中...', signOut: 'サインアウト', next: '次へ', skip: 'スキップ', edit: '編集', delete: '削除', confirm: '確認', tryAgain: '再試行', learnMore: '詳細を見る', or: 'または' },
  profile: { activity: 'アクティビティ', appearance: '外観', dark: 'ダーク', light: 'ライト', calls: n => `${n} 件の通話`, trainingSessions: n => `${n} 件のトレーニング`, totalOnPlatform: 'プラットフォーム合計', maxRank: '✦ 最高ランク達成', appLanguage: 'アプリの言語', langNote: 'コーチングとトレーニングの言語に影響します。通話前設定で変更可能。' },
  tiers: { title: 'ランクティア', subtitle: '実際の通話とトレーニングを完了してティアをアンロック。両方が基準を満たす必要があります。', unlocked: 'アンロック済み', noCalls: '通話不要', noSessions: 'セッション不要', calls: '件の通話', sessions: '件のトレーニング', percentThere: '% 達成' },
  dashboard: { greeting: name => `おかえりなさい${name ? `、${name}` : ''}`, tagline: 'あなた専属のAI営業コーチ', streakMessage: n => `${n}日連続練習中 — この調子で！`, recentCalls: '最近の通話', noCalls: 'まだ通話がありません', noCallsSub: '最初の通話を開始すると、履歴がここに表示されます。', startCall: '新規通話', uploadCall: '録音をアップロード', duration: '通話時間', score: 'スコア', stage: 'ステージ', viewSession: '表示', deleteSession: '削除', totalCalls: '総通話数', avgCloseProb: '平均成約率', totalObjections: '総異議数', avgDuration: '平均通話時間', practiceStreak: '練習連続記録', total: '件', overview: '概要', contacts: '連絡先', contactsSub: '通話履歴の全見込み客', noContacts: 'まだ連絡先がありません', noContactsSub: '通話を完了すると連絡先が表示されます。', noResults: '結果なし', searchPlaceholder: '名前または会社で検索…', latestScore: '最新スコア', bestCloseProb: '最良成約率', latestSummary: '最新AIサマリー', latestNotes: '最新通話メモ', latestEmail: '最新フォローアップメール', callHistory: '通話履歴', copy: 'コピー', copied: 'コピー済み', callCount: n => `${n}件の通話` },
  training: { title: 'トレーニングモード', subtitle: 'シナリオを選んでください。AIが見込み客を演じます。コーチングレポートの準備ができたら通話を終了してください。', language: '言語', startTraining: 'トレーニング開始', endSession: 'セッション終了', practicing: '練習中', yourResponse: 'あなたの返答...', generating: '生成中...', sessionComplete: 'セッション完了', practiceAgain: 'もう一度練習', backToDashboard: 'ダッシュボードに戻る', quota: (u, t) => `今月 ${u} / ${t} セッション使用`, quotaExhausted: t => `月間上限達成 — ${t} セッション使用済み。来月リセット。`, setupContext: 'シナリオ設定', whatSelling: '何を販売していますか？', whatSellingPlaceholder: '例: SaaS、コンサルティング、保険...', selectSub: 'サブシナリオを選択', difficulty: '難易度', easy: '簡単', medium: '普通', hard: '難しい', customScenario: 'シナリオを説明', customPlaceholder: '見込み客と状況を説明してください...', sessionHistory: 'セッション履歴', exchanges: n => `${n} 回のやり取り`, score: 'スコア', keyTakeaway: '重要なポイント', strengths: '✓ うまくできたこと', improvements: '✗ 改善すべき点', practice: '練習', academy: 'アカデミー', loadingAcademy: 'アカデミー読み込み中...', generatingReport: 'コーチングレポートを生成中...', scenarioLabel: 'シナリオ', recent: '最近', describeProspect: '見込み客を説明してください', describeProspectSub: 'AIに彼らが誰であるか、態度、状況を教えてください。', whatSellingContextSub: 'AIがあなたの業界の現実的な見込み客をシミュレートできるよう、コンテキストを提供してください。', prospectSpeaking: '見込み客が話しています', yourTurn: 'あなたの番', aiThinking: 'AI考え中...', waiting: '待機中...' },
  scenarios: { priceObjection: '価格異議', priceObjectionDesc: '見込み客が高すぎると言う', notInterested: '興味なし', notInterestedDesc: '見込み客が通話を終わらせたがっている', thinkItOver: '考えさせてください', thinkItOverDesc: '見込み客が時間を稼いでいる', sendMeInfo: '資料を送って', sendMeInfoDesc: '見込み客がメール請求でかわそうとする', coldOpener: 'コールドオープナー', coldOpenerDesc: 'ゼロからコールドコールを始める', discovery: 'ディスカバリー', discoveryDesc: '問題点とニーズを探る', closing: 'クロージング', closingDesc: '最後のコミットメントを得る', random: 'ランダムシナリオ', randomDesc: 'AIがサプライズ状況を生成', custom: 'カスタムシナリオ', customDesc: '独自の見込み客像を説明する' },
  analytics: { avgClosePercent: '平均成約%', bestCall: '最良通話', callsWon: '勝利通話', activeStages: 'アクティブステージ', mostCalls: '最多通話', bestStageAvg: '最良ステージ均値', highScores: '高スコア', mastered: '習得済み', avgBest: '最良均値', totalAttempts: '総試行数', activeDays: 'アクティブ日数', callAndTraining: '通話+トレーニング', callOnly: '通話のみ', trainingOnly: 'トレーニングのみ', trainingLabel: 'トレーニング', title: '分析', subtitle: '通話とトレーニングのパフォーマンス傾向', totalCalls: '通話合計', totalTime: '合計時間', avgScore: '平均スコア', objections: '処理した異議', noCalls: 'まだデータがありません', noCallsSub: '通話を完了すると分析が表示されます。', callHistory: '通話履歴', performance: 'パフォーマンス', callIntel: '通話インテル', training: 'トレーニング', team: 'チーム', avgCloseProb: '平均成約率', avgLeadScore: '平均リードスコア', avgDuration: '平均通話時間', closeProbChart: n => `成約率 — 最近${n}件の通話`, callsByStage: 'ステージ別通話', activityDays: 'アクティビティ — 過去28日', viewDetails: '詳細を見る →', both: '両方', call: '通話', demoData: 'デモデータ', totalSessions: '総セッション数', bestScore: '最高スコア', lessonsTried: '試したレッスン', scoreSessions: n => `スコア — 最近${n}回のセッション`, bestPerLesson: 'レッスン別最高スコア', topObjections: '主な異議と対処技法', winningPatterns: '成功パターン', stageDistribution: 'ステージ分布', bestDayToCall: '最適通話曜日', objectionToCloseRate: '異議対成約率', objectionCloseRateDesc: '通話中に発生した異議の数に基づいて、成約率がどのように変化するかを示します。', closeProbOverTime: '成約率の推移', repScoreTrend: n => `担当者スコアの推移（${n}件の通話）`, fullCallLog: '通話ログ一覧', callVolumeByStage: 'ステージ別通話数', perStageBreakdown: 'ステージ別詳細', dayGrid28: '28日グリッド', dailyBreakdown: '日別内訳', callDay: '通話日', daysOff: '未通話日', teamLeaderboard: 'チームランキング — 今月', managerCreateTeam: 'マネージャー — チーム作成', repJoinTeam: '担当者 — チーム参加', teamCodeDesc: 'チームコードを生成して担当者に共有すると、全員の統計が連携されます。', teamJoinDesc: 'マネージャーが共有したコードを入力してチームに参加し、ランキングに表示されます。', codeCopied: 'コードをコピーしました！', teamCodeCreated: 'チームコードを作成しました。担当者に共有してください。', joinedTeamMsg: code => `チーム ${code} に参加しました。`, currentlyInTeam: '現在のチーム: ', copyBtn: '⎘ コピー', generateTeamCode: 'チームコードを生成', joinBtn: '参加', teamCodePlaceholder: 'チームコード（例: ABC123）', colDate: '日付', colDuration: '時間', colClosePercent: '成約率', colLeadScore: 'リードスコア', colStage: 'ステージ', colObjections: '異議', colCalls: '通話数', colAvgClosePercent: '平均成約%', colAvgDuration: '平均時間', colRep: '担当者', colTraining: 'トレーニング', colStreak: '連続記録', closeProbDetail: '成約率', closeProbDetailSub: '全録音通話の成約率推移', callsByStageDetail: 'ステージ別通話', callsByStageDetailSub: '通話がどのステージで終わったか、各ステージのパフォーマンス', activityLogDetail: '活動ログ', activityLogDetailSub: '過去28日間の日別通話活動', avgRepScore: '平均担当者スコア', avgTalkRatio: '平均発話率', avgCloseProbLabel: '平均成約率', successWhenHandled: pct => `対応成功率 ${pct}%`, objZero: '異議なし', objOne: '異議1件', objTwoPlus: '異議2件以上', callsUnit: '件', winPatternDuration: botDur => `上位通話の平均時間 vs 下位通話 ${botDur}`, winPatternObjections: botObj => `勝利通話の平均異議数 vs 敗北通話 ${botObj}件 — 早期対応が重要`, winPatternCloseStage: otherP => `クローズステージの平均成約率 vs 初期ステージ通話 ${otherP}%`, objPriceBudget: '価格・予算の懸念', objNotRightTime: 'タイミングが合わない', objAlreadyVendor: '既存ベンダーがいる', objNotInterested: '興味なし', techAnchorROI: 'ROIへのアンカリング — コストを節約した価値や解決した問題に結びつける', techFuturePace: '遅延コストの先読み — 待つことのコストを示す', techContrast: 'コントラスト・ポジショニング — あなたが優れている1点を明確にする' },
  trainingExtra: { practiceTitle: '練習シナリオ', practiceDesc: 'AI搭載の見込み客シミュレーションでトレーニング。各返答に即座のコーチングフィードバック。', practiceFeature1: '9つのユニークな営業シナリオ', practiceFeature2: '簡単・中級・超難関の難易度', practiceFeature3: '毎セッション終了後の完全コーチングレポート', practiceCta: '練習を始める →', academyTitle: 'AIアカデミー', academyDesc: '実際の営業スキルを身につけるための体系的なレッスン。', academyFeature1: '3つのスキルレベル — 初級から上級', academyFeature2: '27レッスン：まず教え、次にテスト', academyFeature3: 'スコアと改善をトラック', academyCta: '学習を始める →', backToSelection: '← 選択に戻る', switchToAcademy: 'アカデミーへ切り替え ◈', switchToPractice: '練習へ切り替え ◎' },
  precall: { title: '通話前設定', prospectName: '見込み客名', prospectNamePlaceholder: '例: 田中 太郎', company: '会社', companyPlaceholder: '例: 株式会社サンプル', callGoal: '通話目標', callGoalPlaceholder: '例: デモを予約、成約...', yourPitch: 'あなたの提案/製品', yourPitchPlaceholder: '何を販売していますか？', language: '言語', startCall: '通話開始' },
  liveCall: { endCall: '通話終了', mute: 'ミュート', unmute: 'ミュート解除', aiSuggestions: 'AI提案', transcript: 'トランスクリプト', closeProbability: '成約確率', stage: 'ステージ', note: 'メモ', addNote: 'メモを追加...', listening: '聴取中...', liveMode: 'ライブモード', noProspect: '見込み客なし', active: 'アクティブ', standby: 'スタンバイ', objections: '異議', closeProb: '成約率', aiFeed: 'AI インテリジェンスフィード', coaching: 'コーチング', readyToAssist: 'アシスト準備完了', readyDesc: 'トランスクリプトパネルの「聴取」をクリックしてマイクを開始。異議・購買シグナルをリアルタイムで検出します。', transcriptFeed: 'トランスクリプトフィード', live: 'ライブ', you: 'あなた', prospect: '見込み客', system: 'システム', listeningStatus: '聴取中 — スピーカーは自動検出されます。', micStarting: 'マイク起動中... または下に見込み客の発言を入力。', typeProspect: '見込み客の発言を入力...', leadProfile: 'リードプロフィール', name: '名前', company: '会社', goal: '目標', pitch: '提案', callStats: '通話統計', quickActions: 'クイックアクション', callNotes: '通話メモ', noLeadData: 'まだリードデータがありません。会話を開始してプロフィールを構築してください。', summarizeCall: '通話を要約', generateEmail: 'フォローアップメールを生成', exportLead: 'リードデータを書き出す', scoreLead: 'このリードをスコア', stageOpener: 'オープナー', stageDiscovery: 'ディスカバリー', stagePitch: 'ピッチ', stageClose: 'クロージング' },
  postcall: { title: '通話レビュー', summary: 'サマリー', transcript: 'トランスクリプト', newCall: '新規通話', backToDashboard: 'ダッシュボードに戻る', followUp: 'フォローアップメール', copyEmail: 'メールをコピー', notes: 'メモ', addNote: 'メモを追加...', saveNote: '保存', duration: '通話時間', score: '成約スコア', objections: '異議', leadScore: 'リードスコア', entries: '件数', stageReached: '到達ステージ', savedToCrm: 'CRMに保存済み', download: '.TXTをダウンロード' },
  auth: { signIn: 'サインイン', signUp: 'サインアップ', email: 'メールアドレス', password: 'パスワード', forgotPassword: 'パスワードを忘れた？', continueWithGoogle: 'Googleで続ける', alreadyHaveAccount: 'すでにアカウントをお持ちですか？', dontHaveAccount: 'アカウントをお持ちでない方?', backToHome: 'ホームに戻る' },
  onboarding: { welcome: 'Pitchbaseへようこそ', yourName: 'お名前', yourNamePlaceholder: '例: 田中 太郎', yourRole: '役職', yourRolePlaceholder: '例: アカウントエグゼクティブ', whatYouSell: '何を販売していますか？', whatYouSellPlaceholder: '例: SaaS、コンサルティング、保険...', language: '使用言語', letsGo: 'はじめる →' },
  upload: { title: '録音をアップロード', subtitle: '録音をアップロードしてAIコーチングと完全なレポートを取得してください。', dropzone: 'ここに音声ファイルをドロップ', analyzing: '通話を分析中...', browseFiles: 'ファイルを参照' },
};

const ar: T = {
  nav: { dashboard: 'لوحة القيادة', training: 'التدريب', analytics: 'التحليلات', leads: 'العملاء', meetings: 'الاجتماعات', newCall: '▶ مكالمة جديدة', upload: '↑ رفع' },
  common: { back: 'رجوع', cancel: 'إلغاء', save: 'حفظ', send: 'إرسال', start: 'بدء', done: 'تم', close: 'إغلاق', loading: 'جار التحميل...', signOut: 'تسجيل الخروج', next: 'التالي', skip: 'تخطي', edit: 'تعديل', delete: 'حذف', confirm: 'تأكيد', tryAgain: 'المحاولة مجددًا', learnMore: 'معرفة المزيد', or: 'أو' },
  profile: { activity: 'النشاط', appearance: 'المظهر', dark: 'داكن', light: 'فاتح', calls: n => `${n} مكالمة`, trainingSessions: n => `${n} جلسة تدريب`, totalOnPlatform: 'الإجمالي على المنصة', maxRank: '✦ تم الوصول للمرتبة القصوى', appLanguage: 'لغة التطبيق', langNote: 'يؤثر على لغة التدريب والإرشاد. يمكن تغييره لكل مكالمة في إعدادات ما قبل المكالمة.' },
  tiers: { title: 'مستويات الرتبة', subtitle: 'افتح المستويات عبر إكمال المكالمات الحقيقية وجلسات التدريب. يجب أن يصل كلاهما للحد المطلوب للتقدم.', unlocked: 'مفتوح', noCalls: 'لا يلزم مكالمات', noSessions: 'لا يلزم جلسات', calls: 'مكالمة', sessions: 'جلسات تدريب', percentThere: '% من الهدف' },
  dashboard: { greeting: name => `مرحبًا بعودتك${name ? `، ${name}` : ''}`, tagline: 'مدربك الشخصي للمبيعات بالذكاء الاصطناعي', streakMessage: n => `سلسلة تدريب ${n} يوم — واصل!`, recentCalls: 'المكالمات الأخيرة', noCalls: 'لا مكالمات بعد', noCallsSub: 'ابدأ مكالمتك الأولى لرؤية سجلك هنا.', startCall: 'مكالمة جديدة', uploadCall: 'رفع تسجيل', duration: 'المدة', score: 'النتيجة', stage: 'المرحلة', viewSession: 'عرض', deleteSession: 'حذف', totalCalls: 'إجمالي المكالمات', avgCloseProb: 'متوسط احتمال الإغلاق', totalObjections: 'إجمالي الاعتراضات', avgDuration: 'متوسط المدة', practiceStreak: 'سلسلة التدريب', total: 'إجمالي', overview: 'نظرة عامة', contacts: 'جهات الاتصال', contactsSub: 'جميع العملاء المحتملين من سجل مكالماتك', noContacts: 'لا جهات اتصال بعد', noContactsSub: 'أكمل مكالمة لرؤية جهات الاتصال هنا.', noResults: 'لا نتائج', searchPlaceholder: 'ابحث بالاسم أو الشركة…', latestScore: 'أحدث نتيجة', bestCloseProb: 'أفضل احتمال إغلاق', latestSummary: 'آخر ملخص AI', latestNotes: 'آخر ملاحظات', latestEmail: 'آخر بريد متابعة', callHistory: 'سجل المكالمات', copy: 'نسخ', copied: 'تم النسخ', callCount: n => `${n} مكالمة` },
  training: { title: 'وضع التدريب', subtitle: 'اختر سيناريو. الذكاء الاصطناعي يلعب دور العميل. انهِ المكالمة للحصول على تقرير التدريب.', language: 'اللغة', startTraining: 'بدء التدريب', endSession: 'إنهاء الجلسة', practicing: 'جار التدريب', yourResponse: 'ردك...', generating: 'جار التوليد...', sessionComplete: 'اكتملت الجلسة', practiceAgain: 'تدرب مجددًا', backToDashboard: 'العودة للوحة القيادة', quota: (u, t) => `${u} / ${t} جلسات مستخدمة هذا الشهر`, quotaExhausted: t => `تم الوصول للحد الشهري — ${t} جلسة مستخدمة. يُعاد تعيينه الشهر القادم.`, setupContext: 'إعداد السيناريو', whatSelling: 'ماذا تبيع؟', whatSellingPlaceholder: 'مثال: برمجيات، استشارات، تأمين...', selectSub: 'اختر سيناريو فرعي', difficulty: 'الصعوبة', easy: 'سهل', medium: 'متوسط', hard: 'صعب', customScenario: 'صف سيناريوك', customPlaceholder: 'صف العميل والموقف...', sessionHistory: 'سجل الجلسات', exchanges: n => `${n} تبادل`, score: 'النتيجة', keyTakeaway: 'الدرس الرئيسي', strengths: '✓ ما أجدت فيه', improvements: '✗ ما يجب تحسينه', practice: 'تدريب حر', academy: 'الأكاديمية', loadingAcademy: 'جار تحميل الأكاديمية...', generatingReport: 'جار إنشاء تقرير التدريب...', scenarioLabel: 'السيناريو', recent: 'الأخيرة', describeProspect: 'صف عميلك المحتمل', describeProspectSub: 'أخبر الذكاء الاصطناعي من هم وموقفهم وظروفهم.', whatSellingContextSub: 'أعطِ الذكاء الاصطناعي سياقاً لمحاكاة عميل محتمل واقعي في مجال عملك.', prospectSpeaking: 'العميل يتحدث', yourTurn: 'دورك', aiThinking: 'الذكاء الاصطناعي يفكر...', waiting: 'في انتظار...' },
  scenarios: { priceObjection: 'اعتراض السعر', priceObjectionDesc: 'العميل يقول إنه غالٍ جداً', notInterested: 'غير مهتم', notInterestedDesc: 'العميل يريد إنهاء المكالمة', thinkItOver: 'سأفكر في الأمر', thinkItOverDesc: 'العميل يكسب الوقت', sendMeInfo: 'أرسل لي معلومات', sendMeInfoDesc: 'العميل يتملص بطلب إيميل', coldOpener: 'فتح اتصال بارد', coldOpenerDesc: 'بدء اتصال بارد من الصفر', discovery: 'الاستكشاف', discoveryDesc: 'الكشف عن نقاط الألم والاحتياجات', closing: 'الإغلاق', closingDesc: 'الدفع نحو الالتزام في النهاية', random: 'سيناريو عشوائي', randomDesc: 'الذكاء الاصطناعي يولد موقفاً مفاجئاً', custom: 'سيناريو مخصص', customDesc: 'صف شخصية العميل المحتمل الخاصة بك' },
  analytics: { avgClosePercent: 'متوسط الإغلاق %', bestCall: 'أفضل مكالمة', callsWon: 'مكالمات ناجحة', activeStages: 'المراحل النشطة', mostCalls: 'أكثر المكالمات', bestStageAvg: 'أفضل متوسط مرحلة', highScores: 'نتائج عالية', mastered: 'مُتقن', avgBest: 'أفضل متوسط', totalAttempts: 'إجمالي المحاولات', activeDays: 'الأيام النشطة', callAndTraining: 'مكالمة + تدريب', callOnly: 'مكالمة فقط', trainingOnly: 'تدريب فقط', trainingLabel: 'التدريب', title: 'التحليلات', subtitle: 'اتجاهات الأداء عبر المكالمات والتدريب', totalCalls: 'إجمالي المكالمات', totalTime: 'الوقت الإجمالي', avgScore: 'متوسط النتيجة', objections: 'الاعتراضات المعالجة', noCalls: 'لا بيانات بعد', noCallsSub: 'أكمل بعض المكالمات لرؤية تحليلاتك.', callHistory: 'سجل المكالمات', performance: 'الأداء', callIntel: 'معلومات المكالمة', training: 'التدريب', team: 'الفريق', avgCloseProb: 'متوسط احتمال الإغلاق', avgLeadScore: 'متوسط نتيجة العميل', avgDuration: 'متوسط المدة', closeProbChart: n => `احتمال الإغلاق — آخر ${n} مكالمات`, callsByStage: 'المكالمات حسب المرحلة', activityDays: 'النشاط — آخر 28 يوم', viewDetails: 'عرض التفاصيل →', both: 'كلاهما', call: 'مكالمة', demoData: 'بيانات تجريبية', totalSessions: 'إجمالي الجلسات', bestScore: 'أفضل نتيجة', lessonsTried: 'الدروس المجربة', scoreSessions: n => `النتيجة — آخر ${n} جلسات`, bestPerLesson: 'أفضل نتيجة لكل درس', topObjections: 'أبرز الاعتراضات والتقنيات', winningPatterns: 'أنماط النجاح', stageDistribution: 'توزيع المراحل', bestDayToCall: 'أفضل يوم للاتصال', objectionToCloseRate: 'معدل الاعتراض إلى الإغلاق', objectionCloseRateDesc: 'كيف يتغير احتمال الإغلاق بناءً على عدد الاعتراضات التي ظهرت في المكالمة.', closeProbOverTime: 'احتمال الإغلاق عبر الوقت', repScoreTrend: n => `مؤشر أداء المندوب (${n} مكالمات)`, fullCallLog: 'سجل المكالمات الكامل', callVolumeByStage: 'حجم المكالمات حسب المرحلة', perStageBreakdown: 'تفصيل حسب المرحلة', dayGrid28: 'شبكة 28 يومًا', dailyBreakdown: 'التفاصيل اليومية', callDay: 'يوم مكالمة', daysOff: 'أيام بدون مكالمات', teamLeaderboard: 'ترتيب الفريق — هذا الشهر', managerCreateTeam: 'المدير — إنشاء فريق', repJoinTeam: 'المندوب — الانضمام لفريق', teamCodeDesc: 'أنشئ رمز الفريق وشاركه مع مندوبيك لربط إحصائيات الجميع.', teamJoinDesc: 'أدخل الرمز الذي شاركه مديرك للانضمام لفريقه والظهور في الترتيب.', codeCopied: 'تم نسخ الرمز!', teamCodeCreated: 'تم إنشاء رمز الفريق. شاركه مع مندوبيك.', joinedTeamMsg: code => `تم الانضمام للفريق ${code}.`, currentlyInTeam: 'الفريق الحالي: ', copyBtn: '⎘ نسخ', generateTeamCode: 'إنشاء رمز الفريق', joinBtn: 'انضمام', teamCodePlaceholder: 'رمز الفريق (مثال: ABC123)', colDate: 'التاريخ', colDuration: 'المدة', colClosePercent: 'الإغلاق %', colLeadScore: 'نتيجة العميل', colStage: 'المرحلة', colObjections: 'الاعتراضات', colCalls: 'المكالمات', colAvgClosePercent: 'متوسط الإغلاق %', colAvgDuration: 'متوسط المدة', colRep: 'المندوب', colTraining: 'التدريب', colStreak: 'السلسلة', closeProbDetail: 'احتمال الإغلاق', closeProbDetailSub: 'اتجاه معدل الفوز عبر جميع المكالمات المسجلة', callsByStageDetail: 'المكالمات حسب المرحلة', callsByStageDetailSub: 'أين تنتهي مكالماتك وكيف تؤدي في كل مرحلة', activityLogDetail: 'سجل النشاط', activityLogDetailSub: 'نشاط المكالمات اليومي خلال آخر 28 يومًا', avgRepScore: 'متوسط نتيجة المندوب', avgTalkRatio: 'متوسط نسبة الكلام', avgCloseProbLabel: 'متوسط احتمال الإغلاق', successWhenHandled: pct => `${pct}% نجاح عند المعالجة`, objZero: '0 اعتراضات', objOne: 'اعتراض واحد', objTwoPlus: 'اعتراضان أو أكثر', callsUnit: 'مكالمات', winPatternDuration: botDur => `متوسط مدة مكالماتك الأعلى أداءً مقابل ${botDur} للمكالمات الأقل`, winPatternObjections: botObj => `متوسط الاعتراضات في المكالمات الناجحة مقابل ${botObj} في الخاسرة — المعالجة المبكرة مهمة`, winPatternCloseStage: otherP => `متوسط احتمال الإغلاق في مرحلة الإغلاق مقابل ${otherP}% في المراحل الأولى`, objPriceBudget: 'قلق السعر / الميزانية', objNotRightTime: 'ليس الوقت المناسب', objAlreadyVendor: 'لديهم مورد بالفعل', objNotInterested: 'غير مهتم', techAnchorROI: 'الربط بعائد الاستثمار — اربط التكلفة بالقيمة المحققة أو المشكلة المحلولة', techFuturePace: 'تقدير تكلفة التأخير — أظهر ما يكلفه الانتظار', techContrast: 'التمييز التنافسي — حدد الشيء الوحيد الذي تفعله بشكل أفضل' },
  trainingExtra: { practiceTitle: 'سيناريوهات التدريب', practiceDesc: 'تدرب مع محاكاة العملاء المحتملين المدعومة بالذكاء الاصطناعي. احصل على تغذية راجعة فورية.', practiceFeature1: '9 سيناريوهات مبيعات فريدة', practiceFeature2: 'صعوبة سهلة ومتوسطة وقاسية', practiceFeature3: 'تقرير تدريبي كامل في نهاية كل جلسة', practiceCta: 'ابدأ التدريب →', academyTitle: 'أكاديمية AI', academyDesc: 'دروس منظمة لبناء مهارات مبيعات حقيقية.', academyFeature1: '3 مستويات — مبتدئ إلى متقدم', academyFeature2: '27 درسًا: تعلم أولاً ثم اختبار', academyFeature3: 'تتبع نتائجك وتحسنك', academyCta: 'ابدأ التعلم →', backToSelection: '← العودة للاختيار', switchToAcademy: 'التبديل للأكاديمية ◈', switchToPractice: 'التبديل للتدريب ◎' },
  precall: { title: 'إعداد ما قبل المكالمة', prospectName: 'اسم العميل المحتمل', prospectNamePlaceholder: 'مثال: محمد علي', company: 'الشركة', companyPlaceholder: 'مثال: شركة المثال', callGoal: 'هدف المكالمة', callGoalPlaceholder: 'مثال: حجز عرض توضيحي، إتمام الصفقة...', yourPitch: 'عرضك / منتجك', yourPitchPlaceholder: 'ماذا تبيع؟', language: 'اللغة', startCall: 'بدء المكالمة' },
  liveCall: { endCall: 'إنهاء المكالمة', mute: 'كتم الصوت', unmute: 'إلغاء كتم الصوت', aiSuggestions: 'اقتراحات الذكاء الاصطناعي', transcript: 'النص', closeProbability: 'احتمالية الإغلاق', stage: 'المرحلة', note: 'ملاحظة', addNote: 'إضافة ملاحظة...', listening: 'جار الاستماع...', liveMode: 'الوضع المباشر', noProspect: 'لا عميل محتمل', active: 'نشط', standby: 'استعداد', objections: 'الاعتراضات', closeProb: 'احتمال الإغلاق', aiFeed: 'تغذية الذكاء الاصطناعي', coaching: 'التدريب', readyToAssist: 'مستعد للمساعدة', readyDesc: 'انقر على "استماع" في لوحة النص لتشغيل الميكروفون. سأكتشف الاعتراضات وإشارات الشراء وأدربك في الوقت الفعلي.', transcriptFeed: 'تغذية النص', live: 'مباشر', you: 'أنت', prospect: 'العميل', system: 'النظام', listeningStatus: 'جار الاستماع — يتم اكتشاف المتحدثين تلقائيًا.', micStarting: 'جار تشغيل الميكروفون... أو اكتب ما قاله العميل أدناه.', typeProspect: 'اكتب ما قاله العميل المحتمل...', leadProfile: 'ملف العميل المحتمل', name: 'الاسم', company: 'الشركة', goal: 'الهدف', pitch: 'العرض', callStats: 'إحصائيات المكالمة', quickActions: 'الإجراءات السريعة', callNotes: 'ملاحظات المكالمة', noLeadData: 'لم يتم استخراج بيانات العميل بعد. ابدأ محادثة لبناء الملف.', summarizeCall: 'تلخيص المكالمة', generateEmail: 'إنشاء بريد متابعة', exportLead: 'تصدير بيانات العميل', scoreLead: 'تقييم هذا العميل', stageOpener: 'افتتاح', stageDiscovery: 'استكشاف', stagePitch: 'عرض', stageClose: 'إغلاق' },
  postcall: { title: 'مراجعة المكالمة', summary: 'الملخص', transcript: 'النص', newCall: 'مكالمة جديدة', backToDashboard: 'العودة للوحة القيادة', followUp: 'بريد المتابعة', copyEmail: 'نسخ البريد', notes: 'ملاحظات', addNote: 'إضافة ملاحظة...', saveNote: 'حفظ', duration: 'المدة', score: 'نتيجة الإغلاق', objections: 'الاعتراضات', leadScore: 'نتيجة العميل المحتمل', entries: 'مدخلات', stageReached: 'المرحلة المُنجزة', savedToCrm: 'محفوظ في CRM', download: 'تحميل .TXT' },
  auth: { signIn: 'تسجيل الدخول', signUp: 'إنشاء حساب', email: 'البريد الإلكتروني', password: 'كلمة المرور', forgotPassword: 'نسيت كلمة المرور؟', continueWithGoogle: 'المتابعة مع Google', alreadyHaveAccount: 'لديك حساب بالفعل؟', dontHaveAccount: 'ليس لديك حساب؟', backToHome: 'العودة للرئيسية' },
  onboarding: { welcome: 'مرحبًا بك في Pitchbase', yourName: 'اسمك', yourNamePlaceholder: 'مثال: محمد علي', yourRole: 'مسماك الوظيفي', yourRolePlaceholder: 'مثال: مدير حسابات', whatYouSell: 'ماذا تبيع؟', whatYouSellPlaceholder: 'مثال: برمجيات، استشارات، تأمين...', language: 'اللغة المفضلة', letsGo: 'لنبدأ →' },
  upload: { title: 'رفع تسجيل', subtitle: 'ارفع تسجيل مكالمة للحصول على تدريب ذكاء اصطناعي وتقرير كامل.', dropzone: 'اسحب ملف الصوت هنا', analyzing: 'جار تحليل مكالمتك...', browseFiles: 'استعراض الملفات' },
};

// ─── Map ──────────────────────────────────────────────────────────────────────

export const TRANSLATIONS: Record<LanguageCode, T> = {
  'en-US': en,
  'es-ES': es,
  'fr-FR': fr,
  'pt-BR': pt,
  'de-DE': de,
  'it-IT': it,
  'nl-NL': nl,
  'zh-CN': zh,
  'ja-JP': ja,
  'ar-SA': ar,
};
