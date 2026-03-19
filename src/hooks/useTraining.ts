import { useState, useCallback, useRef } from 'react';
import type { TrainingScenario, TrainingMessage, TrainingFeedback } from '../types';

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

export type TrainingPhase = 'selection' | 'active' | 'summary';

export interface TrainingState {
  phase: TrainingPhase;
  scenario: TrainingScenario | null;
  scenarioDescription: string;
  messages: TrainingMessage[];
  overallScore: number | null;
  isLoading: boolean;
  error: string | null;
  language: string;
}

const initialState: TrainingState = {
  phase: 'selection',
  scenario: null,
  scenarioDescription: '',
  messages: [],
  overallScore: null,
  isLoading: false,
  error: null,
  language: 'en-US',
};

export function useTraining() {
  const [state, setState] = useState<TrainingState>(initialState);
  const stateRef = useRef(state);
  stateRef.current = state;

  const startScenario = useCallback(async (scenario: TrainingScenario, language = 'en-US') => {
    setState(s => ({ ...s, isLoading: true, error: null }));
    try {
      const data = await callFunction('training-prospect', {
        scenario,
        scenarioDescription: '',
        messages: [],
        userResponse: null,
        language,
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
        messages: [openingMessage],
        overallScore: null,
        isLoading: false,
        error: null,
        language,
      });
    } catch {
      setState(s => ({ ...s, isLoading: false, error: 'Failed to start scenario. Check your connection.' }));
    }
  }, []);

  const sendResponse = useCallback(async (userText: string) => {
    const { scenario, scenarioDescription, messages, language } = stateRef.current;

    const repMessage: TrainingMessage = { id: genId(), role: 'rep', text: userText };
    const messagesWithRep = [...messages, repMessage];

    setState(s => ({ ...s, messages: messagesWithRep, isLoading: true, error: null }));

    try {
      const [feedbackData, prospectData] = await Promise.all([
        callFunction('training-feedback', {
          scenario,
          scenarioDescription,
          messages,
          userResponse: userText,
          language,
        }) as Promise<TrainingFeedback>,
        callFunction('training-prospect', {
          scenario,
          scenarioDescription,
          messages: messagesWithRep,
          userResponse: userText,
          language,
        }) as Promise<{ prospectResponse: string }>,
      ]);

      const prospectMessage: TrainingMessage = {
        id: genId(),
        role: 'prospect',
        text: prospectData.prospectResponse,
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
    } catch {
      setState(s => ({ ...s, isLoading: false, error: 'Failed to get response. Try again.' }));
    }
  }, []);

  const endSession = useCallback(() => {
    setState(s => {
      const scoredMessages = s.messages.filter(m => m.role === 'rep' && m.feedback);
      const overallScore = scoredMessages.length > 0
        ? Math.round(
            scoredMessages.reduce((sum, m) => sum + (m.feedback?.score ?? 0), 0) / scoredMessages.length * 10
          ) / 10
        : null;
      return { ...s, phase: 'summary', overallScore };
    });
  }, []);

  const reset = useCallback(() => setState(initialState), []);

  return { state, startScenario, sendResponse, endSession, reset };
}
