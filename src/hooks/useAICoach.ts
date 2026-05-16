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

const MAX_SUGGESTIONS    = 8;
const TRIGGER_MEMORY_TTL = 120; // seconds

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
      if (elapsedSeconds - firedAt > TRIGGER_MEMORY_TTL) recentTriggersRef.current.delete(key);
    }

    // Called on every streaming chunk and on final completion.
    const onStream = (partial: AISuggestion) => {
      const stamped = { ...partial, createdAt: partial.createdAt ?? elapsedSeconds };
      setSuggestions(prev => {
        const exists = prev.some(s => s.id === stamped.id);
        if (exists) {
          // Streaming ended with no content (shouldShow: false) — remove placeholder.
          if (!stamped.streaming && !stamped.body) {
            return prev.filter(s => s.id !== stamped.id);
          }
          return prev.map(s => s.id === stamped.id ? stamped : s);
        }
        // Only add to list if it has visible content (avoid showing empty card briefly)
        if (!stamped.body && stamped.streaming) return prev;
        // Dedup: if this body opens identically to an existing card, replace it.
        const dupIdx = prev.findIndex(s =>
          s.body.length > 10 && stamped.body.length > 10 &&
          s.body.trim() === stamped.body.trim()
        );
        if (dupIdx !== -1) {
          const next = [...prev];
          next[dupIdx] = stamped;
          return next;
        }
        return [stamped, ...prev].slice(0, MAX_SUGGESTIONS);
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
      const primary = { ...result.suggestions[0], createdAt: result.suggestions[0].createdAt ?? elapsedSeconds };
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
          s.body.trim() === primary.body.trim()
        );
        if (dupIdx !== -1) {
          const next = [...prev];
          next[dupIdx] = primary;
          return next;
        }
        return [primary, ...prev].slice(0, MAX_SUGGESTIONS);
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

  const seedSuggestions = useCallback((s: AISuggestion[]) => {
    setSuggestions(s);
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
    seedSuggestions,
    reset,
  };
}
