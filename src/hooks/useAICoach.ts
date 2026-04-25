import { useState, useRef, useCallback } from 'react';
import { analyzeTranscript, getQuickActionSuggestion, type Memory } from '../lib/ai';
import type { AISuggestion, CallConfig, CallStage, TranscriptEntry, QuickAction, ProspectTone } from '../types';

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
  const [phaseLabel, setPhaseLabel] = useState<string>('');
  const [prospectTone, setProspectTone] = useState<ProspectTone | null>(null);
  const stateRef = useRef<AICoachState>({ ...initialState });
  const [coachState, setCoachState] = useState<AICoachState>({ ...initialState });
  const recentTriggersRef = useRef<Map<string, number>>(new Map());
  const memoryRef = useRef<Memory>({ ...initialMemory });
  const analysisAbortRef = useRef<AbortController | null>(null);

  const updateState = useCallback((nextState: AICoachState) => {
    stateRef.current = nextState;
    setCoachState(nextState);
  }, []);

  const processEntry = useCallback(async (
    entry: TranscriptEntry,
    fullTranscript: TranscriptEntry[],
    elapsedSeconds: number,
    config?: CallConfig
  ) => {
    const current = stateRef.current;

    // Prune recentTriggers entries older than 120 seconds to keep the Map bounded.
    for (const [key, firedAt] of recentTriggersRef.current) {
      if (elapsedSeconds - firedAt > 120) recentTriggersRef.current.delete(key);
    }

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
        // Dedup: if this body opens identically to an existing card, replace it.
        const dupIdx = prev.findIndex(s =>
          s.body.length > 10 && partial.body.length > 10 &&
          s.body.slice(0, 40) === partial.body.slice(0, 40)
        );
        if (dupIdx !== -1) {
          const next = [...prev];
          next[dupIdx] = partial;
          return next;
        }
        return [partial, ...prev].slice(0, 8);
      });
    };

    // Abort any in-flight analysis before starting a new one.
    analysisAbortRef.current?.abort();
    const ctrl = new AbortController();
    analysisAbortRef.current = ctrl;

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
      onStream,
      ctrl.signal
    );

    const nextState: AICoachState = {
      closeProbability: result.updatedProbability,
      callStage: result.updatedStage,
      objectionsCount: result.updatedObjectionsCount,
    };

    updateState(nextState);
    if (result.phaseLabel) setPhaseLabel(result.phaseLabel);
    if (result.prospectTone) setProspectTone(result.prospectTone);

    if (result.suggestions.length > 0) {
      const primary = result.suggestions[0];
      memoryRef.current = {
        lastLabel: primary.headline,
        lastObjectionType: primary.type === 'objection-response'
          ? primary.headline
          : memoryRef.current.lastObjectionType,
        closeAttempted: memoryRef.current.closeAttempted || primary.type === 'close-attempt',
        phaseLabel: result.phaseLabel ?? memoryRef.current.phaseLabel,
      };
      // Keyword-fallback path - suggestion not already in state via onStream.
      setSuggestions(prev => {
        if (prev.some(s => s.id === primary.id)) return prev;
        const dupIdx = prev.findIndex(s =>
          s.body.length > 10 && primary.body.length > 10 &&
          s.body.slice(0, 40) === primary.body.slice(0, 40)
        );
        if (dupIdx !== -1) {
          const next = [...prev];
          next[dupIdx] = primary;
          return next;
        }
        return [primary, ...prev].slice(0, 8);
      });
    } else {
      memoryRef.current = {
        ...memoryRef.current,
        phaseLabel: result.phaseLabel ?? memoryRef.current.phaseLabel,
      };
    }
  }, [updateState]);

  const addQuickActionSuggestion = useCallback((
    action: QuickAction,
    config: { prospectName: string; callGoal: string },
    elapsedSeconds: number
  ) => {
    const suggestion = getQuickActionSuggestion(action, config, elapsedSeconds);
    setSuggestions(s => [suggestion, ...s]);
  }, []);

  const reset = useCallback(() => {
    analysisAbortRef.current?.abort();
    analysisAbortRef.current = null;
    updateState({ ...initialState });
    setSuggestions([]);
    setPhaseLabel('');
    setProspectTone(null);
    recentTriggersRef.current.clear();
    memoryRef.current = { ...initialMemory };
  }, [updateState]);

  return {
    suggestions,
    phaseLabel,
    prospectTone,
    closeProbability: coachState.closeProbability,
    callStage: coachState.callStage,
    objectionsCount: coachState.objectionsCount,
    processEntry,
    addQuickActionSuggestion,
    reset,
  };
}
