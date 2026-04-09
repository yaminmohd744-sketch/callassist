import { useState, useCallback, useRef, useLayoutEffect } from 'react';
import type { TrainingScenario, TrainingMessage, TrainingFeedback, SessionSummary } from '../types';

const FUNCTIONS_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

async function callFunction(name: string, body: unknown): Promise<unknown> {
  const res = await fetch(`${FUNCTIONS_BASE}/${name}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': ANON_KEY,
      'Authorization': `Bearer ${ANON_KEY}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${name} returned ${res.status}: ${text}`);
  }
  return res.json();
}

function genId(): string {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
}

export type TrainingPhase = 'selection' | 'context' | 'active' | 'summary';
export type TrainingDifficulty = 'easy' | 'medium' | 'hard';

export interface TrainingState {
  phase: TrainingPhase;
  scenario: TrainingScenario | null;
  scenarioDescription: string;
  saleContext: string;
  subScenarioContext: string;
  difficulty: TrainingDifficulty;
  messages: TrainingMessage[];
  overallScore: number | null;
  summary: SessionSummary | null;
  isLoading: boolean;
  error: string | null;
  language: string;
}

const initialState: TrainingState = {
  phase: 'selection',
  scenario: null,
  scenarioDescription: '',
  saleContext: '',
  subScenarioContext: '',
  difficulty: 'medium',
  messages: [],
  overallScore: null,
  summary: null,
  isLoading: false,
  error: null,
  language: 'en-US',
};

export function useTraining() {
  const [state, setState] = useState<TrainingState>(initialState);
  const stateRef = useRef(state);
  useLayoutEffect(() => { stateRef.current = state; });

  const startScenario = useCallback((scenario: TrainingScenario, language = 'en-US') => {
    setState(s => ({ ...s, phase: 'context', scenario, language, error: null }));
  }, []);

  const confirmContext = useCallback(async (saleContext: string, difficulty: TrainingDifficulty, subScenarioContext: string, languageOverride?: string) => {
    const { scenario, language } = stateRef.current;
    const effectiveLanguage = languageOverride ?? language;
    console.log('[Training] starting session — language:', effectiveLanguage);
    setState(s => ({ ...s, isLoading: true, error: null, saleContext, difficulty, subScenarioContext }));
    try {
      const data = await callFunction('training-prospect', {
        scenario,
        scenarioDescription: '',
        messages: [],
        userResponse: null,
        language: effectiveLanguage,
        saleContext,
        difficulty,
        subScenarioContext,
      }) as { scenarioDescription: string; openingLine: string };

      const openingMessage: TrainingMessage = {
        id: genId(),
        role: 'prospect',
        text: data.openingLine,
      };

      setState({
        phase: 'active',
        scenario,
        scenarioDescription: data.scenarioDescription,
        saleContext,
        subScenarioContext,
        difficulty,
        messages: [openingMessage],
        overallScore: null,
        summary: null,
        isLoading: false,
        error: null,
        language: effectiveLanguage,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const display = msg.includes('quota') ? 'Service limit reached. Please try again later.'
        : msg.includes('401') || msg.includes('403') ? 'Authentication failed. Please sign out and sign back in.'
        : 'Failed to start scenario. Check your connection.';
      setState(s => ({ ...s, isLoading: false, error: display }));
    }
  }, []);

  const sendResponse = useCallback(async (userText: string) => {
    const { scenario, scenarioDescription, saleContext, subScenarioContext, difficulty, messages, language } = stateRef.current;

    const repMessage: TrainingMessage = { id: genId(), role: 'rep', text: userText };
    const messagesWithRep = [...messages, repMessage];

    setState(s => ({ ...s, messages: messagesWithRep, isLoading: true, error: null }));

    // Collect previous feedback so the AI doesn't repeat the same points
    const previousFeedback = messages
      .filter(m => m.role === 'rep' && m.feedback)
      .map(m => ({ score: m.feedback!.score, pros: m.feedback!.pros, cons: m.feedback!.cons }));

    try {
      const [feedbackData, prospectData] = await Promise.all([
        callFunction('training-feedback', {
          scenario,
          scenarioDescription,
          saleContext,
          subScenarioContext,
          difficulty,
          messages,
          userResponse: userText,
          previousFeedback,
          language,
        }) as Promise<TrainingFeedback>,
        callFunction('training-prospect', {
          scenario,
          scenarioDescription,
          saleContext,
          subScenarioContext,
          difficulty,
          messages: messagesWithRep,
          userResponse: userText,
          language,
        }) as Promise<{ prospectResponse: string; prospectTone?: string }>,
      ]);

      const prospectMessage: TrainingMessage = {
        id: genId(),
        role: 'prospect',
        text: prospectData.prospectResponse,
        prospectTone: prospectData.prospectTone as TrainingMessage['prospectTone'] ?? undefined,
      };

      setState(s => ({
        ...s,
        messages: [
          ...s.messages.map(m =>
            m.id === repMessage.id ? { ...m, feedback: feedbackData } : m
          ),
          prospectMessage,
        ],
        isLoading: false,
      }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const display = msg.includes('quota') ? 'Service limit reached. Please try again later.'
        : 'Failed to get response. Try again.';
      setState(s => ({ ...s, isLoading: false, error: display }));
    }
  }, []);

  const endSession = useCallback(async (exitTrigger?: string) => {
    const { scenario, scenarioDescription, saleContext, subScenarioContext, difficulty, messages, language } = stateRef.current;
    const scoredMessages = messages.filter(m => m.role === 'rep' && m.feedback);
    const overallScore = scoredMessages.length > 0
      ? Math.round(
          scoredMessages.reduce((sum, m) => sum + (m.feedback?.score ?? 0), 0) / scoredMessages.length * 10
        ) / 10
      : null;

    setState(s => ({ ...s, phase: 'summary', overallScore, isLoading: true }));

    try {
      const summary = await callFunction('training-summary', {
        scenario,
        scenarioDescription,
        saleContext,
        subScenarioContext,
        difficulty,
        messages: messages.map(m => ({ role: m.role, text: m.text, feedback: m.feedback })),
        overallScore,
        exitTrigger: exitTrigger ?? 'manual',
        language,
      }) as SessionSummary;
      setState(s => ({ ...s, summary, isLoading: false }));
    } catch {
      // Summary generation failed - degrade gracefully, don't block the screen
      setState(s => ({ ...s, isLoading: false }));
    }
  }, []);

  const reset = useCallback(() => setState(initialState), []);

  return { state, startScenario, confirmContext, sendResponse, endSession, reset };
}
