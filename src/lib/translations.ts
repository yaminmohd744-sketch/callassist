import type { LanguageCode } from './languages';

// ─── Translation shape ────────────────────────────────────────────────────────
export interface T {
  // Navigation
  nav: {
    dashboard: string;
    training: string;
    analytics: string;
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
    maxRank: string;
    appLanguage: string;
    langNote: string;
  };
  // Tiers
  tiers: {
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
  };
  // Analytics
  analytics: {
    title: string;
    totalCalls: string;
    totalTime: string;
    avgScore: string;
    objections: string;
    noCalls: string;
    noCallsSub: string;
    callHistory: string;
    performance: string;
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
}

// ─── Translation data ─────────────────────────────────────────────────────────

const en: T = {
  nav: {
    dashboard: 'Dashboard',
    training: 'Training',
    analytics: 'Analytics',
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
    quota: (used, total) => `${used} / ${total} scenario sessions used this month`,
    quotaExhausted: total => `Monthly limit reached — ${total} scenario sessions used this month. Resets next month.`,
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
  },
  analytics: {
    title: 'Analytics',
    totalCalls: 'Total Calls',
    totalTime: 'Total Time',
    avgScore: 'Avg. Score',
    objections: 'Objections Handled',
    noCalls: 'No data yet',
    noCallsSub: 'Complete some calls to see your analytics.',
    callHistory: 'Call History',
    performance: 'Performance',
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
    endCall: 'End Call',
    mute: 'Mute',
    unmute: 'Unmute',
    aiSuggestions: 'AI Suggestions',
    transcript: 'Transcript',
    closeProbability: 'Close Probability',
    stage: 'Stage',
    note: 'Note',
    addNote: 'Add note...',
    listening: 'Listening...',
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
    welcome: 'Welcome to PitchPlus',
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
};

const es: T = {
  nav: { dashboard: 'Panel', training: 'Entrenamiento', analytics: 'Análisis', newCall: '▶ Nueva Llamada', upload: '↑ Subir' },
  common: { back: 'Volver', cancel: 'Cancelar', save: 'Guardar', send: 'Enviar', start: 'Iniciar', done: 'Hecho', close: 'Cerrar', loading: 'Cargando...', signOut: 'Cerrar sesión', next: 'Siguiente', skip: 'Omitir', edit: 'Editar', delete: 'Eliminar', confirm: 'Confirmar', tryAgain: 'Intentar de nuevo', learnMore: 'Saber más', or: 'o' },
  profile: { activity: 'ACTIVIDAD', appearance: 'APARIENCIA', dark: 'Oscuro', light: 'Claro', calls: n => `${n} llamada${n !== 1 ? 's' : ''}`, trainingSessions: n => `${n} sesión${n !== 1 ? 'es' : ''} de entrenamiento`, totalOnPlatform: 'total en la plataforma', maxRank: '✦ Rango máximo alcanzado', appLanguage: 'Idioma de la app', langNote: 'Afecta el idioma del coaching y el entrenamiento. Se puede cambiar por llamada en la configuración previa.' },
  tiers: { title: 'Niveles de Rango', subtitle: 'Desbloquea niveles completando llamadas reales y sesiones de entrenamiento. Ambos deben alcanzar el umbral para avanzar.', unlocked: 'Desbloqueado', noCalls: 'Sin llamadas requeridas', noSessions: 'Sin sesiones requeridas', calls: 'llamadas', sessions: 'sesiones de entrenamiento', percentThere: '% ahí' },
  dashboard: { greeting: name => `Bienvenido de nuevo${name ? `, ${name}` : ''}`, tagline: 'Tu entrenador de ventas AI personal', streakMessage: n => `Racha de ${n} día${n !== 1 ? 's' : ''} — ¡sigue así!`, recentCalls: 'Llamadas Recientes', noCalls: 'Sin llamadas aún', noCallsSub: 'Inicia tu primera llamada para ver tu historial aquí.', startCall: 'Nueva Llamada', uploadCall: 'Subir Grabación', duration: 'Duración', score: 'Puntuación', stage: 'Etapa', viewSession: 'Ver', deleteSession: 'Eliminar', totalCalls: 'Total Llamadas', avgCloseProb: 'Prob. Cierre Prom.', totalObjections: 'Total Objeciones', avgDuration: 'Duración Prom.', practiceStreak: 'Racha de Práctica', total: 'total', overview: 'Resumen', contacts: 'Contactos', contactsSub: 'Todos los prospectos de tu historial', noContacts: 'Sin contactos aún', noContactsSub: 'Completa una llamada para ver los contactos aquí.', noResults: 'Sin resultados', searchPlaceholder: 'Buscar por nombre o empresa…', latestScore: 'Última Puntuación', bestCloseProb: 'Mejor Prob. Cierre', latestSummary: 'Último Resumen AI', latestNotes: 'Últimas Notas', latestEmail: 'Último Email de Seguimiento', callHistory: 'Historial de Llamadas', copy: 'Copiar', copied: 'Copiado', callCount: n => `${n} ${n === 1 ? 'llamada' : 'llamadas'}` },
  training: { title: 'Modo de Entrenamiento', subtitle: 'Elige un escenario. La IA interpreta al prospecto. Termina la llamada cuando estés listo para tu informe.', language: 'IDIOMA', startTraining: 'Iniciar Entrenamiento', endSession: 'Terminar Sesión', practicing: 'Practicando', yourResponse: 'Tu respuesta...', generating: 'Generando...', sessionComplete: 'Sesión Completa', practiceAgain: 'Practicar de Nuevo', backToDashboard: 'Volver al Panel', quota: (u, t) => `${u} / ${t} sesiones usadas este mes`, quotaExhausted: t => `Límite mensual alcanzado — ${t} sesiones usadas. Se restablece el próximo mes.`, setupContext: 'Configura tu escenario', whatSelling: '¿Qué estás vendiendo?', whatSellingPlaceholder: 'p.ej. software, consultoría, seguros...', selectSub: 'Selecciona un sub-escenario', difficulty: 'Dificultad', easy: 'Fácil', medium: 'Medio', hard: 'Difícil', customScenario: 'Describe tu escenario', customPlaceholder: 'Describe el prospecto y la situación...', sessionHistory: 'Historial de Sesiones', exchanges: n => `${n} intercambio${n !== 1 ? 's' : ''}`, score: 'Puntuación', keyTakeaway: 'CONCLUSIÓN CLAVE', strengths: '✓ Lo que hiciste bien', improvements: '✗ En qué trabajar', practice: 'Práctica', academy: 'Academia', loadingAcademy: 'Cargando Academia...', generatingReport: 'Generando tu informe de coaching...' },
  analytics: { title: 'Análisis', totalCalls: 'Total de Llamadas', totalTime: 'Tiempo Total', avgScore: 'Puntuación Media', objections: 'Objeciones Manejadas', noCalls: 'Sin datos aún', noCallsSub: 'Completa algunas llamadas para ver tus análisis.', callHistory: 'Historial de Llamadas', performance: 'Rendimiento' },
  precall: { title: 'Configuración Previa', prospectName: 'Nombre del Prospecto', prospectNamePlaceholder: 'p.ej. Juan García', company: 'Empresa', companyPlaceholder: 'p.ej. Acme Corp', callGoal: 'Objetivo de la Llamada', callGoalPlaceholder: 'p.ej. Reservar una demo, cerrar el trato...', yourPitch: 'Tu Propuesta / Producto', yourPitchPlaceholder: '¿Qué estás vendiendo?', language: 'Idioma', startCall: 'Iniciar Llamada' },
  liveCall: { endCall: 'Terminar Llamada', mute: 'Silenciar', unmute: 'Activar Micrófono', aiSuggestions: 'Sugerencias de IA', transcript: 'Transcripción', closeProbability: 'Prob. de Cierre', stage: 'Etapa', note: 'Nota', addNote: 'Añadir nota...', listening: 'Escuchando...' },
  postcall: { title: 'Revisión de Llamada', summary: 'Resumen', transcript: 'Transcripción', newCall: 'Nueva Llamada', backToDashboard: 'Volver al Panel', followUp: 'Correo de Seguimiento', copyEmail: 'Copiar Correo', notes: 'Notas', addNote: 'Añadir nota...', saveNote: 'Guardar', duration: 'Duración', score: 'Puntuación de Cierre', objections: 'Objeciones', leadScore: 'Puntuación del Prospecto' },
  auth: { signIn: 'Iniciar sesión', signUp: 'Registrarse', email: 'Correo electrónico', password: 'Contraseña', forgotPassword: '¿Olvidaste tu contraseña?', continueWithGoogle: 'Continuar con Google', alreadyHaveAccount: '¿Ya tienes cuenta?', dontHaveAccount: '¿No tienes cuenta?', backToHome: 'Volver al inicio' },
  onboarding: { welcome: 'Bienvenido a PitchPlus', yourName: 'Tu Nombre', yourNamePlaceholder: 'p.ej. Alex García', yourRole: 'Tu Rol', yourRolePlaceholder: 'p.ej. Ejecutivo de Cuentas', whatYouSell: '¿Qué vendes?', whatYouSellPlaceholder: 'p.ej. SaaS, consultoría, seguros...', language: 'Idioma Preferido', letsGo: 'Vamos →' },
  upload: { title: 'Subir Grabación', subtitle: 'Sube una grabación para obtener coaching de IA y un resumen completo.', dropzone: 'Suelta tu archivo de audio aquí', analyzing: 'Analizando tu llamada...', browseFiles: 'Buscar archivos' },
};

const fr: T = {
  nav: { dashboard: 'Tableau de bord', training: 'Entraînement', analytics: 'Analytique', newCall: '▶ Nouvel Appel', upload: '↑ Importer' },
  common: { back: 'Retour', cancel: 'Annuler', save: 'Enregistrer', send: 'Envoyer', start: 'Démarrer', done: 'Terminé', close: 'Fermer', loading: 'Chargement...', signOut: 'Se déconnecter', next: 'Suivant', skip: 'Passer', edit: 'Modifier', delete: 'Supprimer', confirm: 'Confirmer', tryAgain: 'Réessayer', learnMore: 'En savoir plus', or: 'ou' },
  profile: { activity: 'ACTIVITÉ', appearance: 'APPARENCE', dark: 'Sombre', light: 'Clair', calls: n => `${n} appel${n !== 1 ? 's' : ''}`, trainingSessions: n => `${n} session${n !== 1 ? 's' : ''} d'entraînement`, totalOnPlatform: 'total sur la plateforme', maxRank: '✦ Rang maximum atteint', appLanguage: 'Langue de l\'app', langNote: 'Affecte la langue du coaching et de l\'entraînement. Peut être changé par appel dans la configuration.' },
  tiers: { title: 'Niveaux de Rang', subtitle: 'Débloquez les niveaux en complétant des appels réels et des sessions d\'entraînement. Les deux doivent atteindre le seuil pour progresser.', unlocked: 'Débloqué', noCalls: 'Aucun appel requis', noSessions: 'Aucune session requise', calls: 'appels', sessions: 'sessions d\'entraînement', percentThere: '% accompli' },
  dashboard: { greeting: name => `Bon retour${name ? `, ${name}` : ''}`, tagline: 'Votre coach de vente AI personnel', streakMessage: n => `Série de ${n} jour${n !== 1 ? 's' : ''} — continuez !`, recentCalls: 'Appels Récents', noCalls: 'Aucun appel encore', noCallsSub: 'Commencez votre premier appel pour voir votre historique ici.', startCall: 'Nouvel Appel', uploadCall: 'Importer Enregistrement', duration: 'Durée', score: 'Score', stage: 'Étape', viewSession: 'Voir', deleteSession: 'Supprimer', totalCalls: 'Total Appels', avgCloseProb: 'Prob. Clôture Moy.', totalObjections: 'Total Objections', avgDuration: 'Durée Moy.', practiceStreak: 'Série de Pratique', total: 'total', overview: 'Aperçu', contacts: 'Contacts', contactsSub: 'Tous les prospects de votre historique', noContacts: 'Aucun contact encore', noContactsSub: 'Complétez un appel pour voir les contacts ici.', noResults: 'Aucun résultat', searchPlaceholder: 'Rechercher par nom ou entreprise…', latestScore: 'Dernier Score', bestCloseProb: 'Meilleure Prob. Clôture', latestSummary: 'Dernier Résumé AI', latestNotes: 'Dernières Notes', latestEmail: 'Dernier E-mail de Suivi', callHistory: 'Historique des Appels', copy: 'Copier', copied: 'Copié', callCount: n => `${n} appel${n !== 1 ? 's' : ''}` },
  training: { title: 'Mode Entraînement', subtitle: 'Choisissez un scénario. L\'IA joue le prospect. Terminez l\'appel quand vous êtes prêt pour votre rapport.', language: 'LANGUE', startTraining: 'Démarrer l\'Entraînement', endSession: 'Terminer la Session', practicing: 'En pratique', yourResponse: 'Votre réponse...', generating: 'Génération...', sessionComplete: 'Session Terminée', practiceAgain: 'Pratiquer à Nouveau', backToDashboard: 'Retour au Tableau de Bord', quota: (u, t) => `${u} / ${t} sessions utilisées ce mois`, quotaExhausted: t => `Limite mensuelle atteinte — ${t} sessions utilisées. Se réinitialise le mois prochain.`, setupContext: 'Configurez votre scénario', whatSelling: 'Que vendez-vous ?', whatSellingPlaceholder: 'ex. logiciel SaaS, conseil, assurance...', selectSub: 'Sélectionnez un sous-scénario', difficulty: 'Difficulté', easy: 'Facile', medium: 'Moyen', hard: 'Difficile', customScenario: 'Décrivez votre scénario', customPlaceholder: 'Décrivez le prospect et la situation...', sessionHistory: 'Historique des Sessions', exchanges: n => `${n} échange${n !== 1 ? 's' : ''}`, score: 'Score', keyTakeaway: 'POINT CLÉ', strengths: '✓ Ce que vous avez bien fait', improvements: '✗ Ce sur quoi travailler', practice: 'Pratique', academy: 'Académie', loadingAcademy: 'Chargement de l\'Académie...', generatingReport: 'Génération de votre rapport de coaching...' },
  analytics: { title: 'Analytique', totalCalls: 'Total d\'Appels', totalTime: 'Temps Total', avgScore: 'Score Moyen', objections: 'Objections Gérées', noCalls: 'Pas encore de données', noCallsSub: 'Complétez quelques appels pour voir vos analyses.', callHistory: 'Historique des Appels', performance: 'Performance' },
  precall: { title: 'Configuration Pré-Appel', prospectName: 'Nom du Prospect', prospectNamePlaceholder: 'ex. Jean Dupont', company: 'Entreprise', companyPlaceholder: 'ex. Acme Corp', callGoal: 'Objectif de l\'Appel', callGoalPlaceholder: 'ex. Réserver une démo, conclure l\'affaire...', yourPitch: 'Votre Offre / Produit', yourPitchPlaceholder: 'Que vendez-vous ?', language: 'Langue', startCall: 'Démarrer l\'Appel' },
  liveCall: { endCall: 'Terminer l\'Appel', mute: 'Muet', unmute: 'Réactiver', aiSuggestions: 'Suggestions IA', transcript: 'Transcription', closeProbability: 'Prob. de Clôture', stage: 'Étape', note: 'Note', addNote: 'Ajouter une note...', listening: 'En écoute...' },
  postcall: { title: 'Révision d\'Appel', summary: 'Résumé', transcript: 'Transcription', newCall: 'Nouvel Appel', backToDashboard: 'Retour au Tableau de Bord', followUp: 'E-mail de Suivi', copyEmail: 'Copier l\'E-mail', notes: 'Notes', addNote: 'Ajouter une note...', saveNote: 'Enregistrer', duration: 'Durée', score: 'Score de Clôture', objections: 'Objections', leadScore: 'Score du Prospect' },
  auth: { signIn: 'Se connecter', signUp: 'S\'inscrire', email: 'E-mail', password: 'Mot de passe', forgotPassword: 'Mot de passe oublié ?', continueWithGoogle: 'Continuer avec Google', alreadyHaveAccount: 'Vous avez déjà un compte ?', dontHaveAccount: 'Vous n\'avez pas de compte ?', backToHome: 'Retour à l\'accueil' },
  onboarding: { welcome: 'Bienvenue sur PitchPlus', yourName: 'Votre Nom', yourNamePlaceholder: 'ex. Alex Martin', yourRole: 'Votre Rôle', yourRolePlaceholder: 'ex. Responsable Commercial', whatYouSell: 'Que vendez-vous ?', whatYouSellPlaceholder: 'ex. SaaS, conseil, assurance...', language: 'Langue Préférée', letsGo: 'C\'est parti →' },
  upload: { title: 'Importer un Enregistrement', subtitle: 'Importez un enregistrement pour obtenir un coaching IA et un compte-rendu complet.', dropzone: 'Déposez votre fichier audio ici', analyzing: 'Analyse de votre appel...', browseFiles: 'Parcourir les fichiers' },
};

const pt: T = {
  nav: { dashboard: 'Painel', training: 'Treinamento', analytics: 'Análise', newCall: '▶ Nova Chamada', upload: '↑ Enviar' },
  common: { back: 'Voltar', cancel: 'Cancelar', save: 'Salvar', send: 'Enviar', start: 'Iniciar', done: 'Concluído', close: 'Fechar', loading: 'Carregando...', signOut: 'Sair', next: 'Próximo', skip: 'Pular', edit: 'Editar', delete: 'Excluir', confirm: 'Confirmar', tryAgain: 'Tentar novamente', learnMore: 'Saiba mais', or: 'ou' },
  profile: { activity: 'ATIVIDADE', appearance: 'APARÊNCIA', dark: 'Escuro', light: 'Claro', calls: n => `${n} chamada${n !== 1 ? 's' : ''}`, trainingSessions: n => `${n} sessão${n !== 1 ? 'ões' : ''} de treinamento`, totalOnPlatform: 'total na plataforma', maxRank: '✦ Rank máximo atingido', appLanguage: 'Idioma do app', langNote: 'Afeta o idioma do coaching e treinamento. Pode ser alterado por chamada nas configurações.' },
  tiers: { title: 'Níveis de Rank', subtitle: 'Desbloqueie níveis completando chamadas reais e sessões de treinamento. Ambos devem atingir o limite para avançar.', unlocked: 'Desbloqueado', noCalls: 'Nenhuma chamada necessária', noSessions: 'Nenhuma sessão necessária', calls: 'chamadas', sessions: 'sessões de treinamento', percentThere: '% lá' },
  dashboard: { greeting: name => `Bem-vindo de volta${name ? `, ${name}` : ''}`, tagline: 'Seu coach de vendas AI pessoal', streakMessage: n => `Sequência de ${n} dia${n !== 1 ? 's' : ''} — continue assim!`, recentCalls: 'Chamadas Recentes', noCalls: 'Nenhuma chamada ainda', noCallsSub: 'Inicie sua primeira chamada para ver seu histórico aqui.', startCall: 'Nova Chamada', uploadCall: 'Enviar Gravação', duration: 'Duração', score: 'Pontuação', stage: 'Etapa', viewSession: 'Ver', deleteSession: 'Excluir', totalCalls: 'Total Chamadas', avgCloseProb: 'Prob. Fechamento Méd.', totalObjections: 'Total Objeções', avgDuration: 'Duração Méd.', practiceStreak: 'Sequência de Prática', total: 'total', overview: 'Visão Geral', contacts: 'Contatos', contactsSub: 'Todos os prospects do seu histórico', noContacts: 'Nenhum contato ainda', noContactsSub: 'Conclua uma chamada para ver os contatos aqui.', noResults: 'Sem resultados', searchPlaceholder: 'Pesquisar por nome ou empresa…', latestScore: 'Última Pontuação', bestCloseProb: 'Melhor Prob. Fechamento', latestSummary: 'Último Resumo AI', latestNotes: 'Últimas Notas', latestEmail: 'Último Email de Acompanhamento', callHistory: 'Histórico de Chamadas', copy: 'Copiar', copied: 'Copiado', callCount: n => `${n} chamada${n !== 1 ? 's' : ''}` },
  training: { title: 'Modo Treinamento', subtitle: 'Escolha um cenário. A IA interpreta o prospect. Encerre quando estiver pronto para seu relatório.', language: 'IDIOMA', startTraining: 'Iniciar Treinamento', endSession: 'Encerrar Sessão', practicing: 'Praticando', yourResponse: 'Sua resposta...', generating: 'Gerando...', sessionComplete: 'Sessão Concluída', practiceAgain: 'Praticar Novamente', backToDashboard: 'Voltar ao Painel', quota: (u, t) => `${u} / ${t} sessões usadas este mês`, quotaExhausted: t => `Limite mensal atingido — ${t} sessões usadas. Reinicia no próximo mês.`, setupContext: 'Configure seu cenário', whatSelling: 'O que você está vendendo?', whatSellingPlaceholder: 'ex. SaaS, consultoria, seguros...', selectSub: 'Selecione um sub-cenário', difficulty: 'Dificuldade', easy: 'Fácil', medium: 'Médio', hard: 'Difícil', customScenario: 'Descreva seu cenário', customPlaceholder: 'Descreva o prospect e a situação...', sessionHistory: 'Histórico de Sessões', exchanges: n => `${n} troca${n !== 1 ? 's' : ''}`, score: 'Pontuação', keyTakeaway: 'LIÇÃO PRINCIPAL', strengths: '✓ O que você fez bem', improvements: '✗ No que trabalhar', practice: 'Prática', academy: 'Academia', loadingAcademy: 'Carregando Academia...', generatingReport: 'Gerando seu relatório de coaching...' },
  analytics: { title: 'Análise', totalCalls: 'Total de Chamadas', totalTime: 'Tempo Total', avgScore: 'Pontuação Média', objections: 'Objeções Tratadas', noCalls: 'Sem dados ainda', noCallsSub: 'Complete algumas chamadas para ver suas análises.', callHistory: 'Histórico de Chamadas', performance: 'Desempenho' },
  precall: { title: 'Configuração Pré-Chamada', prospectName: 'Nome do Prospect', prospectNamePlaceholder: 'ex. João Silva', company: 'Empresa', companyPlaceholder: 'ex. Acme Corp', callGoal: 'Objetivo da Chamada', callGoalPlaceholder: 'ex. Agendar uma demo, fechar o negócio...', yourPitch: 'Sua Proposta / Produto', yourPitchPlaceholder: 'O que você está vendendo?', language: 'Idioma', startCall: 'Iniciar Chamada' },
  liveCall: { endCall: 'Encerrar Chamada', mute: 'Mutar', unmute: 'Desmutar', aiSuggestions: 'Sugestões de IA', transcript: 'Transcrição', closeProbability: 'Prob. de Fechamento', stage: 'Etapa', note: 'Nota', addNote: 'Adicionar nota...', listening: 'Ouvindo...' },
  postcall: { title: 'Revisão da Chamada', summary: 'Resumo', transcript: 'Transcrição', newCall: 'Nova Chamada', backToDashboard: 'Voltar ao Painel', followUp: 'E-mail de Acompanhamento', copyEmail: 'Copiar E-mail', notes: 'Notas', addNote: 'Adicionar nota...', saveNote: 'Salvar', duration: 'Duração', score: 'Pontuação de Fechamento', objections: 'Objeções', leadScore: 'Pontuação do Lead' },
  auth: { signIn: 'Entrar', signUp: 'Cadastrar', email: 'E-mail', password: 'Senha', forgotPassword: 'Esqueceu a senha?', continueWithGoogle: 'Continuar com o Google', alreadyHaveAccount: 'Já tem uma conta?', dontHaveAccount: 'Não tem uma conta?', backToHome: 'Voltar ao início' },
  onboarding: { welcome: 'Bem-vindo ao PitchPlus', yourName: 'Seu Nome', yourNamePlaceholder: 'ex. Alex Santos', yourRole: 'Seu Cargo', yourRolePlaceholder: 'ex. Executivo de Contas', whatYouSell: 'O que você vende?', whatYouSellPlaceholder: 'ex. SaaS, consultoria, seguros...', language: 'Idioma Preferido', letsGo: 'Vamos →' },
  upload: { title: 'Enviar Gravação', subtitle: 'Envie uma gravação para obter coaching de IA e um resumo completo.', dropzone: 'Solte seu arquivo de áudio aqui', analyzing: 'Analisando sua chamada...', browseFiles: 'Procurar arquivos' },
};

const de: T = {
  nav: { dashboard: 'Dashboard', training: 'Training', analytics: 'Analytik', newCall: '▶ Neuer Anruf', upload: '↑ Hochladen' },
  common: { back: 'Zurück', cancel: 'Abbrechen', save: 'Speichern', send: 'Senden', start: 'Starten', done: 'Fertig', close: 'Schließen', loading: 'Lädt...', signOut: 'Abmelden', next: 'Weiter', skip: 'Überspringen', edit: 'Bearbeiten', delete: 'Löschen', confirm: 'Bestätigen', tryAgain: 'Nochmal versuchen', learnMore: 'Mehr erfahren', or: 'oder' },
  profile: { activity: 'AKTIVITÄT', appearance: 'ERSCHEINUNGSBILD', dark: 'Dunkel', light: 'Hell', calls: n => `${n} Anruf${n !== 1 ? 'e' : ''}`, trainingSessions: n => `${n} Trainingseinheit${n !== 1 ? 'en' : ''}`, totalOnPlatform: 'gesamt auf der Plattform', maxRank: '✦ Maximaler Rang erreicht', appLanguage: 'App-Sprache', langNote: 'Beeinflusst die Coaching- und Trainingssprache. Im Vorab-Setup pro Anruf änderbar.' },
  tiers: { title: 'Rang-Stufen', subtitle: 'Stufen durch echte Anrufe und Trainingseinheiten freischalten. Beide Werte müssen den Schwellenwert erreichen.', unlocked: 'Freigeschaltet', noCalls: 'Keine Anrufe erforderlich', noSessions: 'Keine Sitzungen erforderlich', calls: 'Anrufe', sessions: 'Trainingseinheiten', percentThere: '% geschafft' },
  dashboard: { greeting: name => `Willkommen zurück${name ? `, ${name}` : ''}`, tagline: 'Ihr persönlicher AI-Verkaufscoach', streakMessage: n => `${n}-tägige Übungsserie — weiter so!`, recentCalls: 'Letzte Anrufe', noCalls: 'Noch keine Anrufe', noCallsSub: 'Starten Sie Ihren ersten Anruf, um Ihren Verlauf hier zu sehen.', startCall: 'Neuer Anruf', uploadCall: 'Aufnahme hochladen', duration: 'Dauer', score: 'Bewertung', stage: 'Phase', viewSession: 'Ansehen', deleteSession: 'Löschen', totalCalls: 'Anrufe gesamt', avgCloseProb: 'Ø Abschlusswahrsch.', totalObjections: 'Einwände gesamt', avgDuration: 'Ø Dauer', practiceStreak: 'Übungsserie', total: 'gesamt', overview: 'Übersicht', contacts: 'Kontakte', contactsSub: 'Alle Interessenten aus Ihrer Anrufhistorie', noContacts: 'Noch keine Kontakte', noContactsSub: 'Schließen Sie einen Anruf ab, um Kontakte hier zu sehen.', noResults: 'Keine Ergebnisse', searchPlaceholder: 'Nach Name oder Firma suchen…', latestScore: 'Letzter Score', bestCloseProb: 'Beste Abschlusswahrsch.', latestSummary: 'Letztes AI-Fazit', latestNotes: 'Letzte Notizen', latestEmail: 'Letzte Follow-up E-Mail', callHistory: 'Anrufverlauf', copy: 'Kopieren', copied: 'Kopiert', callCount: n => `${n} Anruf${n !== 1 ? 'e' : ''}` },
  training: { title: 'Trainingsmodus', subtitle: 'Wählen Sie ein Szenario. Die KI spielt den Interessenten. Beenden Sie den Anruf für Ihren Coaching-Bericht.', language: 'SPRACHE', startTraining: 'Training Starten', endSession: 'Sitzung Beenden', practicing: 'Im Training', yourResponse: 'Ihre Antwort...', generating: 'Wird generiert...', sessionComplete: 'Sitzung Abgeschlossen', practiceAgain: 'Erneut Üben', backToDashboard: 'Zurück zum Dashboard', quota: (u, t) => `${u} / ${t} Sitzungen diesen Monat genutzt`, quotaExhausted: t => `Monatliches Limit erreicht — ${t} Sitzungen genutzt. Wird nächsten Monat zurückgesetzt.`, setupContext: 'Szenario einrichten', whatSelling: 'Was verkaufen Sie?', whatSellingPlaceholder: 'z.B. SaaS, Beratung, Versicherung...', selectSub: 'Unter-Szenario wählen', difficulty: 'Schwierigkeit', easy: 'Leicht', medium: 'Mittel', hard: 'Schwer', customScenario: 'Szenario beschreiben', customPlaceholder: 'Beschreiben Sie den Interessenten und die Situation...', sessionHistory: 'Sitzungsverlauf', exchanges: n => `${n} Austausch${n !== 1 ? 'e' : ''}`, score: 'Bewertung', keyTakeaway: 'WICHTIGSTE ERKENNTNIS', strengths: '✓ Was Sie gut gemacht haben', improvements: '✗ Woran Sie arbeiten sollten', practice: 'Übung', academy: 'Akademie', loadingAcademy: 'Akademie wird geladen...', generatingReport: 'Coaching-Bericht wird erstellt...' },
  analytics: { title: 'Analytik', totalCalls: 'Anrufe gesamt', totalTime: 'Gesamtzeit', avgScore: 'Ø Bewertung', objections: 'Behandelte Einwände', noCalls: 'Noch keine Daten', noCallsSub: 'Führen Sie Anrufe durch, um Ihre Analysen zu sehen.', callHistory: 'Anrufverlauf', performance: 'Leistung' },
  precall: { title: 'Anruf-Vorbereitung', prospectName: 'Name des Interessenten', prospectNamePlaceholder: 'z.B. Max Müller', company: 'Unternehmen', companyPlaceholder: 'z.B. Acme GmbH', callGoal: 'Anrufziel', callGoalPlaceholder: 'z.B. Demo buchen, Deal abschließen...', yourPitch: 'Ihr Angebot / Produkt', yourPitchPlaceholder: 'Was verkaufen Sie?', language: 'Sprache', startCall: 'Anruf Starten' },
  liveCall: { endCall: 'Anruf Beenden', mute: 'Stumm', unmute: 'Stummschaltung aufheben', aiSuggestions: 'KI-Vorschläge', transcript: 'Transkript', closeProbability: 'Abschlusswahrsch.', stage: 'Phase', note: 'Notiz', addNote: 'Notiz hinzufügen...', listening: 'Hört zu...' },
  postcall: { title: 'Anruf-Review', summary: 'Zusammenfassung', transcript: 'Transkript', newCall: 'Neuer Anruf', backToDashboard: 'Zurück zum Dashboard', followUp: 'Follow-up E-Mail', copyEmail: 'E-Mail kopieren', notes: 'Notizen', addNote: 'Notiz hinzufügen...', saveNote: 'Speichern', duration: 'Dauer', score: 'Abschluss-Bewertung', objections: 'Einwände', leadScore: 'Lead-Bewertung' },
  auth: { signIn: 'Anmelden', signUp: 'Registrieren', email: 'E-Mail', password: 'Passwort', forgotPassword: 'Passwort vergessen?', continueWithGoogle: 'Mit Google fortfahren', alreadyHaveAccount: 'Haben Sie bereits ein Konto?', dontHaveAccount: 'Noch kein Konto?', backToHome: 'Zurück zur Startseite' },
  onboarding: { welcome: 'Willkommen bei PitchPlus', yourName: 'Ihr Name', yourNamePlaceholder: 'z.B. Alex Müller', yourRole: 'Ihre Position', yourRolePlaceholder: 'z.B. Account Executive', whatYouSell: 'Was verkaufen Sie?', whatYouSellPlaceholder: 'z.B. SaaS, Beratung, Versicherung...', language: 'Bevorzugte Sprache', letsGo: 'Los geht\'s →' },
  upload: { title: 'Aufnahme Hochladen', subtitle: 'Laden Sie eine Aufnahme hoch für KI-Coaching und ein vollständiges Debriefing.', dropzone: 'Audiodatei hier ablegen', analyzing: 'Anruf wird analysiert...', browseFiles: 'Dateien durchsuchen' },
};

const it: T = {
  nav: { dashboard: 'Dashboard', training: 'Formazione', analytics: 'Analisi', newCall: '▶ Nuova Chiamata', upload: '↑ Carica' },
  common: { back: 'Indietro', cancel: 'Annulla', save: 'Salva', send: 'Invia', start: 'Avvia', done: 'Fatto', close: 'Chiudi', loading: 'Caricamento...', signOut: 'Esci', next: 'Avanti', skip: 'Salta', edit: 'Modifica', delete: 'Elimina', confirm: 'Conferma', tryAgain: 'Riprova', learnMore: 'Scopri di più', or: 'o' },
  profile: { activity: 'ATTIVITÀ', appearance: 'ASPETTO', dark: 'Scuro', light: 'Chiaro', calls: n => `${n} chiamata${n !== 1 ? 'e' : ''}`, trainingSessions: n => `${n} sessione${n !== 1 ? 'i' : ''} di formazione`, totalOnPlatform: 'totale sulla piattaforma', maxRank: '✦ Rango massimo raggiunto', appLanguage: 'Lingua dell\'app', langNote: 'Influisce sulla lingua del coaching e della formazione. Modificabile per chiamata nella configurazione.' },
  tiers: { title: 'Livelli di Rango', subtitle: 'Sblocca i livelli completando chiamate reali e sessioni di formazione. Entrambi devono raggiungere la soglia per avanzare.', unlocked: 'Sbloccato', noCalls: 'Nessuna chiamata richiesta', noSessions: 'Nessuna sessione richiesta', calls: 'chiamate', sessions: 'sessioni di formazione', percentThere: '% raggiunto' },
  dashboard: { greeting: name => `Bentornato${name ? `, ${name}` : ''}`, tagline: 'Il tuo coach di vendite AI personale', streakMessage: n => `Serie di ${n} giorno${n !== 1 ? 'i' : ''} — continua così!`, recentCalls: 'Chiamate Recenti', noCalls: 'Nessuna chiamata ancora', noCallsSub: 'Inizia la tua prima chiamata per vedere la cronologia qui.', startCall: 'Nuova Chiamata', uploadCall: 'Carica Registrazione', duration: 'Durata', score: 'Punteggio', stage: 'Fase', viewSession: 'Vedi', deleteSession: 'Elimina', totalCalls: 'Chiamate Totali', avgCloseProb: 'Prob. Chiusura Med.', totalObjections: 'Obiezioni Totali', avgDuration: 'Durata Med.', practiceStreak: 'Serie di Pratica', total: 'totale', overview: 'Panoramica', contacts: 'Contatti', contactsSub: 'Tutti i prospect dalla tua cronologia', noContacts: 'Nessun contatto ancora', noContactsSub: 'Completa una chiamata per vedere i contatti qui.', noResults: 'Nessun risultato', searchPlaceholder: 'Cerca per nome o azienda…', latestScore: 'Ultimo Punteggio', bestCloseProb: 'Miglior Prob. Chiusura', latestSummary: 'Ultimo Riepilogo AI', latestNotes: 'Ultime Note', latestEmail: 'Ultima Email di Follow-up', callHistory: 'Cronologia Chiamate', copy: 'Copia', copied: 'Copiato', callCount: n => `${n} chiamata${n !== 1 ? 'e' : ''}` },
  training: { title: 'Modalità Formazione', subtitle: 'Scegli uno scenario. L\'IA interpreta il prospect. Termina la chiamata per il tuo report di coaching.', language: 'LINGUA', startTraining: 'Inizia Formazione', endSession: 'Termina Sessione', practicing: 'In pratica', yourResponse: 'La tua risposta...', generating: 'Generazione...', sessionComplete: 'Sessione Completata', practiceAgain: 'Pratica di Nuovo', backToDashboard: 'Torna alla Dashboard', quota: (u, t) => `${u} / ${t} sessioni usate questo mese`, quotaExhausted: t => `Limite mensile raggiunto — ${t} sessioni usate. Si azzera il mese prossimo.`, setupContext: 'Configura il tuo scenario', whatSelling: 'Cosa stai vendendo?', whatSellingPlaceholder: 'es. SaaS, consulenza, assicurazione...', selectSub: 'Seleziona un sotto-scenario', difficulty: 'Difficoltà', easy: 'Facile', medium: 'Medio', hard: 'Difficile', customScenario: 'Descrivi il tuo scenario', customPlaceholder: 'Descrivi il prospect e la situazione...', sessionHistory: 'Cronologia Sessioni', exchanges: n => `${n} scambio${n !== 1 ? 'i' : ''}`, score: 'Punteggio', keyTakeaway: 'PUNTO CHIAVE', strengths: '✓ Cosa hai fatto bene', improvements: '✗ Su cosa lavorare', practice: 'Pratica', academy: 'Accademia', loadingAcademy: 'Caricamento Accademia...', generatingReport: 'Generazione del tuo report di coaching...' },
  analytics: { title: 'Analisi', totalCalls: 'Chiamate Totali', totalTime: 'Tempo Totale', avgScore: 'Punteggio Medio', objections: 'Obiezioni Gestite', noCalls: 'Ancora nessun dato', noCallsSub: 'Completa alcune chiamate per vedere le tue analisi.', callHistory: 'Cronologia Chiamate', performance: 'Prestazione' },
  precall: { title: 'Configurazione Pre-Chiamata', prospectName: 'Nome del Prospect', prospectNamePlaceholder: 'es. Mario Rossi', company: 'Azienda', companyPlaceholder: 'es. Acme Srl', callGoal: 'Obiettivo della Chiamata', callGoalPlaceholder: 'es. Prenotare una demo, chiudere l\'affare...', yourPitch: 'La Tua Proposta / Prodotto', yourPitchPlaceholder: 'Cosa stai vendendo?', language: 'Lingua', startCall: 'Avvia Chiamata' },
  liveCall: { endCall: 'Termina Chiamata', mute: 'Silenzia', unmute: 'Riattiva', aiSuggestions: 'Suggerimenti IA', transcript: 'Trascrizione', closeProbability: 'Prob. di Chiusura', stage: 'Fase', note: 'Nota', addNote: 'Aggiungi nota...', listening: 'In ascolto...' },
  postcall: { title: 'Revisione Chiamata', summary: 'Riepilogo', transcript: 'Trascrizione', newCall: 'Nuova Chiamata', backToDashboard: 'Torna alla Dashboard', followUp: 'Email di Follow-up', copyEmail: 'Copia Email', notes: 'Note', addNote: 'Aggiungi nota...', saveNote: 'Salva', duration: 'Durata', score: 'Punteggio di Chiusura', objections: 'Obiezioni', leadScore: 'Punteggio Lead' },
  auth: { signIn: 'Accedi', signUp: 'Registrati', email: 'Email', password: 'Password', forgotPassword: 'Password dimenticata?', continueWithGoogle: 'Continua con Google', alreadyHaveAccount: 'Hai già un account?', dontHaveAccount: 'Non hai un account?', backToHome: 'Torna alla home' },
  onboarding: { welcome: 'Benvenuto su PitchPlus', yourName: 'Il Tuo Nome', yourNamePlaceholder: 'es. Alex Rossi', yourRole: 'Il Tuo Ruolo', yourRolePlaceholder: 'es. Account Executive', whatYouSell: 'Cosa vendi?', whatYouSellPlaceholder: 'es. SaaS, consulenza, assicurazione...', language: 'Lingua Preferita', letsGo: 'Andiamo →' },
  upload: { title: 'Carica Registrazione', subtitle: 'Carica una registrazione per ottenere coaching IA e un debriefing completo.', dropzone: 'Trascina il tuo file audio qui', analyzing: 'Analisi della chiamata in corso...', browseFiles: 'Sfoglia file' },
};

const nl: T = {
  nav: { dashboard: 'Dashboard', training: 'Training', analytics: 'Analyse', newCall: '▶ Nieuw Gesprek', upload: '↑ Uploaden' },
  common: { back: 'Terug', cancel: 'Annuleren', save: 'Opslaan', send: 'Versturen', start: 'Starten', done: 'Klaar', close: 'Sluiten', loading: 'Laden...', signOut: 'Uitloggen', next: 'Volgende', skip: 'Overslaan', edit: 'Bewerken', delete: 'Verwijderen', confirm: 'Bevestigen', tryAgain: 'Opnieuw proberen', learnMore: 'Meer weten', or: 'of' },
  profile: { activity: 'ACTIVITEIT', appearance: 'WEERGAVE', dark: 'Donker', light: 'Licht', calls: n => `${n} gesprek${n !== 1 ? 'ken' : ''}`, trainingSessions: n => `${n} trainingssessie${n !== 1 ? 's' : ''}`, totalOnPlatform: 'totaal op het platform', maxRank: '✦ Maximale rang bereikt', appLanguage: 'App-taal', langNote: 'Beïnvloedt de taal van coaching en training. Per gesprek aanpasbaar in de voorbereiding.' },
  tiers: { title: 'Rang-Niveaus', subtitle: 'Ontgrendel niveaus door echte gesprekken en trainingsessies te voltooien. Beide moeten de drempel bereiken.', unlocked: 'Ontgrendeld', noCalls: 'Geen gesprekken vereist', noSessions: 'Geen sessies vereist', calls: 'gesprekken', sessions: 'trainingsessies', percentThere: '% behaald' },
  dashboard: { greeting: name => `Welkom terug${name ? `, ${name}` : ''}`, tagline: 'Uw persoonlijke AI-verkoopcoach', streakMessage: n => `${n}-daagse oefenreeks — houd het vol!`, recentCalls: 'Recente Gesprekken', noCalls: 'Nog geen gesprekken', noCallsSub: 'Start uw eerste gesprek om uw geschiedenis hier te zien.', startCall: 'Nieuw Gesprek', uploadCall: 'Opname uploaden', duration: 'Duur', score: 'Score', stage: 'Fase', viewSession: 'Bekijken', deleteSession: 'Verwijderen', totalCalls: 'Totaal Gesprekken', avgCloseProb: 'Gem. Afsluitkans', totalObjections: 'Totaal Bezwaren', avgDuration: 'Gem. Duur', practiceStreak: 'Oefenreeks', total: 'totaal', overview: 'Overzicht', contacts: 'Contacten', contactsSub: 'Alle prospects uit uw gespreksgeschiedenis', noContacts: 'Nog geen contacten', noContactsSub: 'Voltooi een gesprek om contacten hier te zien.', noResults: 'Geen resultaten', searchPlaceholder: 'Zoeken op naam of bedrijf…', latestScore: 'Laatste Score', bestCloseProb: 'Beste Afsluitkans', latestSummary: 'Laatste AI-samenvatting', latestNotes: 'Laatste Notities', latestEmail: 'Laatste Opvolg-e-mail', callHistory: 'Gespreksgeschiedenis', copy: 'Kopiëren', copied: 'Gekopieerd', callCount: n => `${n} gesprek${n !== 1 ? 'ken' : ''}` },
  training: { title: 'Trainingsmodus', subtitle: 'Kies een scenario. De AI speelt de prospect. Beëindig het gesprek voor uw coachingrapport.', language: 'TAAL', startTraining: 'Training Starten', endSession: 'Sessie Beëindigen', practicing: 'Aan het oefenen', yourResponse: 'Uw antwoord...', generating: 'Genereren...', sessionComplete: 'Sessie Voltooid', practiceAgain: 'Opnieuw oefenen', backToDashboard: 'Terug naar Dashboard', quota: (u, t) => `${u} / ${t} sessies gebruikt deze maand`, quotaExhausted: t => `Maandlimiet bereikt — ${t} sessies gebruikt. Wordt volgende maand gereset.`, setupContext: 'Scenario instellen', whatSelling: 'Wat verkoopt u?', whatSellingPlaceholder: 'bijv. SaaS, advies, verzekering...', selectSub: 'Selecteer een subscenario', difficulty: 'Moeilijkheid', easy: 'Makkelijk', medium: 'Gemiddeld', hard: 'Moeilijk', customScenario: 'Beschrijf uw scenario', customPlaceholder: 'Beschrijf de prospect en situatie...', sessionHistory: 'Sessiegeschiedenis', exchanges: n => `${n} uitwisseling${n !== 1 ? 'en' : ''}`, score: 'Score', keyTakeaway: 'BELANGRIJK INZICHT', strengths: '✓ Wat u goed deed', improvements: '✗ Waar u aan moet werken', practice: 'Oefening', academy: 'Academie', loadingAcademy: 'Academie laden...', generatingReport: 'Coachingrapport genereren...' },
  analytics: { title: 'Analyse', totalCalls: 'Totaal Gesprekken', totalTime: 'Totale Tijd', avgScore: 'Gem. Score', objections: 'Bezwaren Behandeld', noCalls: 'Nog geen gegevens', noCallsSub: 'Voltooi wat gesprekken om uw analyses te zien.', callHistory: 'Gespreksgeschiedenis', performance: 'Prestatie' },
  precall: { title: 'Gespreksvoorbereiding', prospectName: 'Naam Prospect', prospectNamePlaceholder: 'bijv. Jan de Vries', company: 'Bedrijf', companyPlaceholder: 'bijv. Acme BV', callGoal: 'Gespreksdoel', callGoalPlaceholder: 'bijv. Demo boeken, deal sluiten...', yourPitch: 'Uw Aanbod / Product', yourPitchPlaceholder: 'Wat verkoopt u?', language: 'Taal', startCall: 'Gesprek Starten' },
  liveCall: { endCall: 'Gesprek Beëindigen', mute: 'Dempen', unmute: 'Dempen opheffen', aiSuggestions: 'AI-Suggesties', transcript: 'Transcript', closeProbability: 'Kans op Afsluiting', stage: 'Fase', note: 'Notitie', addNote: 'Notitie toevoegen...', listening: 'Luistert...' },
  postcall: { title: 'Gespreksevaluatie', summary: 'Samenvatting', transcript: 'Transcript', newCall: 'Nieuw Gesprek', backToDashboard: 'Terug naar Dashboard', followUp: 'Opvolg-e-mail', copyEmail: 'E-mail kopiëren', notes: 'Notities', addNote: 'Notitie toevoegen...', saveNote: 'Opslaan', duration: 'Duur', score: 'Afsluitingsscore', objections: 'Bezwaren', leadScore: 'Leadscore' },
  auth: { signIn: 'Inloggen', signUp: 'Registreren', email: 'E-mail', password: 'Wachtwoord', forgotPassword: 'Wachtwoord vergeten?', continueWithGoogle: 'Doorgaan met Google', alreadyHaveAccount: 'Heeft u al een account?', dontHaveAccount: 'Heeft u nog geen account?', backToHome: 'Terug naar home' },
  onboarding: { welcome: 'Welkom bij PitchPlus', yourName: 'Uw Naam', yourNamePlaceholder: 'bijv. Alex de Vries', yourRole: 'Uw Functie', yourRolePlaceholder: 'bijv. Account Executive', whatYouSell: 'Wat verkoopt u?', whatYouSellPlaceholder: 'bijv. SaaS, advies, verzekering...', language: 'Voorkeurstaal', letsGo: 'Aan de slag →' },
  upload: { title: 'Opname Uploaden', subtitle: 'Upload een opname voor AI-coaching en een volledig debriefing.', dropzone: 'Sleep uw audiobestand hier', analyzing: 'Gesprek analyseren...', browseFiles: 'Bestanden zoeken' },
};

const zh: T = {
  nav: { dashboard: '仪表板', training: '训练', analytics: '分析', newCall: '▶ 新通话', upload: '↑ 上传' },
  common: { back: '返回', cancel: '取消', save: '保存', send: '发送', start: '开始', done: '完成', close: '关闭', loading: '加载中...', signOut: '退出登录', next: '下一步', skip: '跳过', edit: '编辑', delete: '删除', confirm: '确认', tryAgain: '重试', learnMore: '了解更多', or: '或' },
  profile: { activity: '活动', appearance: '外观', dark: '深色', light: '浅色', calls: n => `${n} 次通话`, trainingSessions: n => `${n} 次训练`, totalOnPlatform: '平台总时长', maxRank: '✦ 已达最高等级', appLanguage: '应用语言', langNote: '影响辅导和训练语言。可在通话前设置中逐次更改。' },
  tiers: { title: '等级体系', subtitle: '通过完成真实通话和训练课程解锁等级，两项均须达到阈值方可晋升。', unlocked: '已解锁', noCalls: '无通话要求', noSessions: '无课程要求', calls: '次通话', sessions: '次训练', percentThere: '% 进度' },
  dashboard: { greeting: name => `欢迎回来${name ? `，${name}` : ''}`, tagline: '您的个人AI销售教练', streakMessage: n => `连续练习${n}天 — 继续加油！`, recentCalls: '近期通话', noCalls: '暂无通话', noCallsSub: '开始您的第一次通话，历史记录将显示在此处。', startCall: '新建通话', uploadCall: '上传录音', duration: '时长', score: '评分', stage: '阶段', viewSession: '查看', deleteSession: '删除', totalCalls: '总通话数', avgCloseProb: '平均成交概率', totalObjections: '总异议数', avgDuration: '平均时长', practiceStreak: '练习连击', total: '共', overview: '概览', contacts: '联系人', contactsSub: '通话历史中的所有潜在客户', noContacts: '暂无联系人', noContactsSub: '完成通话后联系人将显示在此处。', noResults: '无结果', searchPlaceholder: '按姓名或公司搜索…', latestScore: '最新评分', bestCloseProb: '最佳成交概率', latestSummary: '最新AI总结', latestNotes: '最新通话记录', latestEmail: '最新跟进邮件', callHistory: '通话历史', copy: '复制', copied: '已复制', callCount: n => `${n}次通话` },
  training: { title: '训练模式', subtitle: '选择一个场景，AI扮演潜在客户。结束通话后获取您的辅导报告。', language: '语言', startTraining: '开始训练', endSession: '结束课程', practicing: '训练中', yourResponse: '您的回复...', generating: '生成中...', sessionComplete: '课程完成', practiceAgain: '再次练习', backToDashboard: '返回仪表板', quota: (u, t) => `本月已使用 ${u} / ${t} 次`, quotaExhausted: t => `已达本月上限 — 已使用 ${t} 次。下月重置。`, setupContext: '配置场景', whatSelling: '您在销售什么？', whatSellingPlaceholder: '例如：SaaS软件、咨询服务、保险...', selectSub: '选择子场景', difficulty: '难度', easy: '简单', medium: '中等', hard: '困难', customScenario: '描述您的场景', customPlaceholder: '描述潜在客户和情况...', sessionHistory: '历史记录', exchanges: n => `${n} 次交流`, score: '评分', keyTakeaway: '关键要点', strengths: '✓ 做得好的地方', improvements: '✗ 需要改进的地方', practice: '自由练习', academy: '学院', loadingAcademy: '加载学院...', generatingReport: '正在生成辅导报告...' },
  analytics: { title: '分析', totalCalls: '通话总数', totalTime: '总时长', avgScore: '平均评分', objections: '处理的异议', noCalls: '暂无数据', noCallsSub: '完成一些通话后查看您的分析。', callHistory: '通话历史', performance: '表现' },
  precall: { title: '通话前设置', prospectName: '潜在客户姓名', prospectNamePlaceholder: '例如：张三', company: '公司', companyPlaceholder: '例如：某科技有限公司', callGoal: '通话目标', callGoalPlaceholder: '例如：预约演示、完成成交...', yourPitch: '您的方案/产品', yourPitchPlaceholder: '您在销售什么？', language: '语言', startCall: '开始通话' },
  liveCall: { endCall: '结束通话', mute: '静音', unmute: '取消静音', aiSuggestions: 'AI建议', transcript: '实时转录', closeProbability: '成交概率', stage: '阶段', note: '备注', addNote: '添加备注...', listening: '监听中...' },
  postcall: { title: '通话回顾', summary: '摘要', transcript: '转录', newCall: '新建通话', backToDashboard: '返回仪表板', followUp: '跟进邮件', copyEmail: '复制邮件', notes: '备注', addNote: '添加备注...', saveNote: '保存', duration: '时长', score: '成交评分', objections: '异议', leadScore: '线索评分' },
  auth: { signIn: '登录', signUp: '注册', email: '邮箱', password: '密码', forgotPassword: '忘记密码？', continueWithGoogle: '使用Google继续', alreadyHaveAccount: '已有账户？', dontHaveAccount: '没有账户？', backToHome: '返回首页' },
  onboarding: { welcome: '欢迎使用PitchPlus', yourName: '您的姓名', yourNamePlaceholder: '例如：张三', yourRole: '您的职位', yourRolePlaceholder: '例如：客户经理', whatYouSell: '您销售什么？', whatYouSellPlaceholder: '例如：SaaS、咨询、保险...', language: '偏好语言', letsGo: '开始 →' },
  upload: { title: '上传录音', subtitle: '上传通话录音，获取AI辅导和完整分析报告。', dropzone: '将音频文件拖放到此处', analyzing: '正在分析您的通话...', browseFiles: '浏览文件' },
};

const ja: T = {
  nav: { dashboard: 'ダッシュボード', training: 'トレーニング', analytics: '分析', newCall: '▶ 新規通話', upload: '↑ アップロード' },
  common: { back: '戻る', cancel: 'キャンセル', save: '保存', send: '送信', start: '開始', done: '完了', close: '閉じる', loading: '読み込み中...', signOut: 'サインアウト', next: '次へ', skip: 'スキップ', edit: '編集', delete: '削除', confirm: '確認', tryAgain: '再試行', learnMore: '詳細を見る', or: 'または' },
  profile: { activity: 'アクティビティ', appearance: '外観', dark: 'ダーク', light: 'ライト', calls: n => `${n} 件の通話`, trainingSessions: n => `${n} 件のトレーニング`, totalOnPlatform: 'プラットフォーム合計', maxRank: '✦ 最高ランク達成', appLanguage: 'アプリの言語', langNote: 'コーチングとトレーニングの言語に影響します。通話前設定で変更可能。' },
  tiers: { title: 'ランクティア', subtitle: '実際の通話とトレーニングを完了してティアをアンロック。両方が基準を満たす必要があります。', unlocked: 'アンロック済み', noCalls: '通話不要', noSessions: 'セッション不要', calls: '件の通話', sessions: '件のトレーニング', percentThere: '% 達成' },
  dashboard: { greeting: name => `おかえりなさい${name ? `、${name}` : ''}`, tagline: 'あなた専属のAI営業コーチ', streakMessage: n => `${n}日連続練習中 — この調子で！`, recentCalls: '最近の通話', noCalls: 'まだ通話がありません', noCallsSub: '最初の通話を開始すると、履歴がここに表示されます。', startCall: '新規通話', uploadCall: '録音をアップロード', duration: '通話時間', score: 'スコア', stage: 'ステージ', viewSession: '表示', deleteSession: '削除', totalCalls: '総通話数', avgCloseProb: '平均成約率', totalObjections: '総異議数', avgDuration: '平均通話時間', practiceStreak: '練習連続記録', total: '件', overview: '概要', contacts: '連絡先', contactsSub: '通話履歴の全見込み客', noContacts: 'まだ連絡先がありません', noContactsSub: '通話を完了すると連絡先が表示されます。', noResults: '結果なし', searchPlaceholder: '名前または会社で検索…', latestScore: '最新スコア', bestCloseProb: '最良成約率', latestSummary: '最新AIサマリー', latestNotes: '最新通話メモ', latestEmail: '最新フォローアップメール', callHistory: '通話履歴', copy: 'コピー', copied: 'コピー済み', callCount: n => `${n}件の通話` },
  training: { title: 'トレーニングモード', subtitle: 'シナリオを選んでください。AIが見込み客を演じます。コーチングレポートの準備ができたら通話を終了してください。', language: '言語', startTraining: 'トレーニング開始', endSession: 'セッション終了', practicing: '練習中', yourResponse: 'あなたの返答...', generating: '生成中...', sessionComplete: 'セッション完了', practiceAgain: 'もう一度練習', backToDashboard: 'ダッシュボードに戻る', quota: (u, t) => `今月 ${u} / ${t} セッション使用`, quotaExhausted: t => `月間上限達成 — ${t} セッション使用済み。来月リセット。`, setupContext: 'シナリオ設定', whatSelling: '何を販売していますか？', whatSellingPlaceholder: '例: SaaS、コンサルティング、保険...', selectSub: 'サブシナリオを選択', difficulty: '難易度', easy: '簡単', medium: '普通', hard: '難しい', customScenario: 'シナリオを説明', customPlaceholder: '見込み客と状況を説明してください...', sessionHistory: 'セッション履歴', exchanges: n => `${n} 回のやり取り`, score: 'スコア', keyTakeaway: '重要なポイント', strengths: '✓ うまくできたこと', improvements: '✗ 改善すべき点', practice: '練習', academy: 'アカデミー', loadingAcademy: 'アカデミー読み込み中...', generatingReport: 'コーチングレポートを生成中...' },
  analytics: { title: '分析', totalCalls: '通話合計', totalTime: '合計時間', avgScore: '平均スコア', objections: '処理した異議', noCalls: 'まだデータがありません', noCallsSub: '通話を完了すると分析が表示されます。', callHistory: '通話履歴', performance: 'パフォーマンス' },
  precall: { title: '通話前設定', prospectName: '見込み客名', prospectNamePlaceholder: '例: 田中 太郎', company: '会社', companyPlaceholder: '例: 株式会社サンプル', callGoal: '通話目標', callGoalPlaceholder: '例: デモを予約、成約...', yourPitch: 'あなたの提案/製品', yourPitchPlaceholder: '何を販売していますか？', language: '言語', startCall: '通話開始' },
  liveCall: { endCall: '通話終了', mute: 'ミュート', unmute: 'ミュート解除', aiSuggestions: 'AI提案', transcript: 'トランスクリプト', closeProbability: '成約確率', stage: 'ステージ', note: 'メモ', addNote: 'メモを追加...', listening: '聴取中...' },
  postcall: { title: '通話レビュー', summary: 'サマリー', transcript: 'トランスクリプト', newCall: '新規通話', backToDashboard: 'ダッシュボードに戻る', followUp: 'フォローアップメール', copyEmail: 'メールをコピー', notes: 'メモ', addNote: 'メモを追加...', saveNote: '保存', duration: '通話時間', score: '成約スコア', objections: '異議', leadScore: 'リードスコア' },
  auth: { signIn: 'サインイン', signUp: 'サインアップ', email: 'メールアドレス', password: 'パスワード', forgotPassword: 'パスワードを忘れた？', continueWithGoogle: 'Googleで続ける', alreadyHaveAccount: 'すでにアカウントをお持ちですか？', dontHaveAccount: 'アカウントをお持ちでない方?', backToHome: 'ホームに戻る' },
  onboarding: { welcome: 'PitchPlusへようこそ', yourName: 'お名前', yourNamePlaceholder: '例: 田中 太郎', yourRole: '役職', yourRolePlaceholder: '例: アカウントエグゼクティブ', whatYouSell: '何を販売していますか？', whatYouSellPlaceholder: '例: SaaS、コンサルティング、保険...', language: '使用言語', letsGo: 'はじめる →' },
  upload: { title: '録音をアップロード', subtitle: '録音をアップロードしてAIコーチングと完全なレポートを取得してください。', dropzone: 'ここに音声ファイルをドロップ', analyzing: '通話を分析中...', browseFiles: 'ファイルを参照' },
};

const ar: T = {
  nav: { dashboard: 'لوحة القيادة', training: 'التدريب', analytics: 'التحليلات', newCall: '▶ مكالمة جديدة', upload: '↑ رفع' },
  common: { back: 'رجوع', cancel: 'إلغاء', save: 'حفظ', send: 'إرسال', start: 'بدء', done: 'تم', close: 'إغلاق', loading: 'جار التحميل...', signOut: 'تسجيل الخروج', next: 'التالي', skip: 'تخطي', edit: 'تعديل', delete: 'حذف', confirm: 'تأكيد', tryAgain: 'المحاولة مجددًا', learnMore: 'معرفة المزيد', or: 'أو' },
  profile: { activity: 'النشاط', appearance: 'المظهر', dark: 'داكن', light: 'فاتح', calls: n => `${n} مكالمة`, trainingSessions: n => `${n} جلسة تدريب`, totalOnPlatform: 'الإجمالي على المنصة', maxRank: '✦ تم الوصول للمرتبة القصوى', appLanguage: 'لغة التطبيق', langNote: 'يؤثر على لغة التدريب والإرشاد. يمكن تغييره لكل مكالمة في إعدادات ما قبل المكالمة.' },
  tiers: { title: 'مستويات الرتبة', subtitle: 'افتح المستويات عبر إكمال المكالمات الحقيقية وجلسات التدريب. يجب أن يصل كلاهما للحد المطلوب للتقدم.', unlocked: 'مفتوح', noCalls: 'لا يلزم مكالمات', noSessions: 'لا يلزم جلسات', calls: 'مكالمة', sessions: 'جلسات تدريب', percentThere: '% من الهدف' },
  dashboard: { greeting: name => `مرحبًا بعودتك${name ? `، ${name}` : ''}`, tagline: 'مدربك الشخصي للمبيعات بالذكاء الاصطناعي', streakMessage: n => `سلسلة تدريب ${n} يوم — واصل!`, recentCalls: 'المكالمات الأخيرة', noCalls: 'لا مكالمات بعد', noCallsSub: 'ابدأ مكالمتك الأولى لرؤية سجلك هنا.', startCall: 'مكالمة جديدة', uploadCall: 'رفع تسجيل', duration: 'المدة', score: 'النتيجة', stage: 'المرحلة', viewSession: 'عرض', deleteSession: 'حذف', totalCalls: 'إجمالي المكالمات', avgCloseProb: 'متوسط احتمال الإغلاق', totalObjections: 'إجمالي الاعتراضات', avgDuration: 'متوسط المدة', practiceStreak: 'سلسلة التدريب', total: 'إجمالي', overview: 'نظرة عامة', contacts: 'جهات الاتصال', contactsSub: 'جميع العملاء المحتملين من سجل مكالماتك', noContacts: 'لا جهات اتصال بعد', noContactsSub: 'أكمل مكالمة لرؤية جهات الاتصال هنا.', noResults: 'لا نتائج', searchPlaceholder: 'ابحث بالاسم أو الشركة…', latestScore: 'أحدث نتيجة', bestCloseProb: 'أفضل احتمال إغلاق', latestSummary: 'آخر ملخص AI', latestNotes: 'آخر ملاحظات', latestEmail: 'آخر بريد متابعة', callHistory: 'سجل المكالمات', copy: 'نسخ', copied: 'تم النسخ', callCount: n => `${n} مكالمة` },
  training: { title: 'وضع التدريب', subtitle: 'اختر سيناريو. الذكاء الاصطناعي يلعب دور العميل. انهِ المكالمة للحصول على تقرير التدريب.', language: 'اللغة', startTraining: 'بدء التدريب', endSession: 'إنهاء الجلسة', practicing: 'جار التدريب', yourResponse: 'ردك...', generating: 'جار التوليد...', sessionComplete: 'اكتملت الجلسة', practiceAgain: 'تدرب مجددًا', backToDashboard: 'العودة للوحة القيادة', quota: (u, t) => `${u} / ${t} جلسات مستخدمة هذا الشهر`, quotaExhausted: t => `تم الوصول للحد الشهري — ${t} جلسة مستخدمة. يُعاد تعيينه الشهر القادم.`, setupContext: 'إعداد السيناريو', whatSelling: 'ماذا تبيع؟', whatSellingPlaceholder: 'مثال: برمجيات، استشارات، تأمين...', selectSub: 'اختر سيناريو فرعي', difficulty: 'الصعوبة', easy: 'سهل', medium: 'متوسط', hard: 'صعب', customScenario: 'صف سيناريوك', customPlaceholder: 'صف العميل والموقف...', sessionHistory: 'سجل الجلسات', exchanges: n => `${n} تبادل`, score: 'النتيجة', keyTakeaway: 'الدرس الرئيسي', strengths: '✓ ما أجدت فيه', improvements: '✗ ما يجب تحسينه', practice: 'تدريب حر', academy: 'الأكاديمية', loadingAcademy: 'جار تحميل الأكاديمية...', generatingReport: 'جار إنشاء تقرير التدريب...' },
  analytics: { title: 'التحليلات', totalCalls: 'إجمالي المكالمات', totalTime: 'الوقت الإجمالي', avgScore: 'متوسط النتيجة', objections: 'الاعتراضات المعالجة', noCalls: 'لا بيانات بعد', noCallsSub: 'أكمل بعض المكالمات لرؤية تحليلاتك.', callHistory: 'سجل المكالمات', performance: 'الأداء' },
  precall: { title: 'إعداد ما قبل المكالمة', prospectName: 'اسم العميل المحتمل', prospectNamePlaceholder: 'مثال: محمد علي', company: 'الشركة', companyPlaceholder: 'مثال: شركة المثال', callGoal: 'هدف المكالمة', callGoalPlaceholder: 'مثال: حجز عرض توضيحي، إتمام الصفقة...', yourPitch: 'عرضك / منتجك', yourPitchPlaceholder: 'ماذا تبيع؟', language: 'اللغة', startCall: 'بدء المكالمة' },
  liveCall: { endCall: 'إنهاء المكالمة', mute: 'كتم الصوت', unmute: 'إلغاء كتم الصوت', aiSuggestions: 'اقتراحات الذكاء الاصطناعي', transcript: 'النص', closeProbability: 'احتمالية الإغلاق', stage: 'المرحلة', note: 'ملاحظة', addNote: 'إضافة ملاحظة...', listening: 'جار الاستماع...' },
  postcall: { title: 'مراجعة المكالمة', summary: 'الملخص', transcript: 'النص', newCall: 'مكالمة جديدة', backToDashboard: 'العودة للوحة القيادة', followUp: 'بريد المتابعة', copyEmail: 'نسخ البريد', notes: 'ملاحظات', addNote: 'إضافة ملاحظة...', saveNote: 'حفظ', duration: 'المدة', score: 'نتيجة الإغلاق', objections: 'الاعتراضات', leadScore: 'نتيجة العميل المحتمل' },
  auth: { signIn: 'تسجيل الدخول', signUp: 'إنشاء حساب', email: 'البريد الإلكتروني', password: 'كلمة المرور', forgotPassword: 'نسيت كلمة المرور؟', continueWithGoogle: 'المتابعة مع Google', alreadyHaveAccount: 'لديك حساب بالفعل؟', dontHaveAccount: 'ليس لديك حساب؟', backToHome: 'العودة للرئيسية' },
  onboarding: { welcome: 'مرحبًا بك في PitchPlus', yourName: 'اسمك', yourNamePlaceholder: 'مثال: محمد علي', yourRole: 'مسماك الوظيفي', yourRolePlaceholder: 'مثال: مدير حسابات', whatYouSell: 'ماذا تبيع؟', whatYouSellPlaceholder: 'مثال: برمجيات، استشارات، تأمين...', language: 'اللغة المفضلة', letsGo: 'لنبدأ →' },
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
