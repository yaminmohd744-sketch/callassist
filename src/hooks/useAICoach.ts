import { useState, useRef, useCallback } from 'react';
import { analyzeTranscript, getQuickActionSuggestion, type Memory } from '../lib/mockAI';
import type { AISuggestion, CallStage, TranscriptEntry, QuickAction } from '../types';

interface AICoachState {
  closeProbability: number;
  callStage: CallStage;
  objectionsCount: number;
}

const initialState: AICoachState = {
  closeProbability: 50,
  callStage: 'opener',
  objectionsCount: 0,
};

const initialMemory: Memory = {
  lastLabel: null,
  lastObjectionType: null,
  closeAttempted: false,
};

export function useAICoach() {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const stateRef = useRef<AICoachState>({ ...initialState });
  const [coachState, setCoachState] = useState<AICoachState>({ ...initialState });
  const recentTriggersRef = useRef<Map<string, number>>(new Map());
  const memoryRef = useRef<Memory>({ ...initialMemory });

  const processEntry = useCallback(async (
    entry: TranscriptEntry,
    fullTranscript: TranscriptEntry[],
    elapsedSeconds: number,
    config?: { prospectName: string; company: string; yourPitch: string; callGoal: string }
  ) => {
    const current = stateRef.current;
    const result = await analyzeTranscript(
      entry,
      fullTranscript,
      current.callStage,
      elapsedSeconds,
      current.closeProbability,
      current.objectionsCount,
      recentTriggersRef.current,
      config,
      memoryRef.current
    );

    const nextState: AICoachState = {
      closeProbability: result.updatedProbability,
      callStage: result.updatedStage,
      objectionsCount: result.updatedObjectionsCount,
    };

    stateRef.current = nextState;
    setCoachState(nextState);

    if (result.suggestions.length > 0) {
      const primary = result.suggestions[0];
      // Update memory so next call knows what was last suggested
      memoryRef.current = {
        lastLabel: primary.headline,
        lastObjectionType: primary.type === 'objection-handler'
          ? primary.headline
          : memoryRef.current.lastObjectionType,
        closeAttempted: memoryRef.current.closeAttempted || primary.type === 'closing-prompt',
      };
      setSuggestions(s => [...result.suggestions, ...s]);
    }
  }, []);

  const addQuickActionSuggestion = useCallback((
    action: QuickAction,
    config: { prospectName: string; callGoal: string },
    elapsedSeconds: number
  ) => {
    const suggestion = getQuickActionSuggestion(action, config, elapsedSeconds);
    setSuggestions(s => [suggestion, ...s]);
  }, []);

  const reset = useCallback(() => {
    stateRef.current = { ...initialState };
    setSuggestions([]);
    setCoachState({ ...initialState });
    recentTriggersRef.current.clear();
    memoryRef.current = { ...initialMemory };
  }, []);

  return {
    suggestions,
    closeProbability: coachState.closeProbability,
    callStage: coachState.callStage,
    objectionsCount: coachState.objectionsCount,
    processEntry,
    addQuickActionSuggestion,
    reset,
  };
}
