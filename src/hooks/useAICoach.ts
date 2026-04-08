import { useState, useRef, useCallback } from 'react';
import { analyzeTranscript, getQuickActionSuggestion, type Memory } from '../lib/ai';
import type { AISuggestion, CallConfig, CallStage, TranscriptEntry, QuickAction } from '../types';

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
    config?: CallConfig
  ) => {
    const current = stateRef.current;

    // Called on every streaming chunk and on final completion.
    const onStream = (partial: AISuggestion) => {
      setSuggestions(prev => {
        const exists = prev.some(s => s.id === partial.id);
        if (exists) {
          // Streaming ended with no content (shouldShow: false) — remove placeholder.
          if (!partial.streaming && !partial.body) {
            return prev.filter(s => s.id !== partial.id);
          }
          return prev.map(s => s.id === partial.id ? partial : s);
        }
        // Only add to list if it has visible content (avoid showing empty card briefly)
        if (!partial.body && partial.streaming) return prev;
        return [partial, ...prev];
      });
    };

    const result = await analyzeTranscript(
      entry,
      fullTranscript,
      current.callStage,
      elapsedSeconds,
      current.closeProbability,
      current.objectionsCount,
      recentTriggersRef.current,
      config,
      memoryRef.current,
      onStream
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
      memoryRef.current = {
        lastLabel: primary.headline,
        lastObjectionType: primary.type === 'objection-handler'
          ? primary.headline
          : memoryRef.current.lastObjectionType,
        closeAttempted: memoryRef.current.closeAttempted || primary.type === 'closing-prompt',
      };
      // Keyword-fallback path - suggestion not already in state via onStream.
      setSuggestions(prev => {
        if (prev.some(s => s.id === primary.id)) return prev;
        return [primary, ...prev];
      });
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
