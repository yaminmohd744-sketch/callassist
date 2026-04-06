import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import type { CurriculumLesson } from '../lib/curriculum';

export interface AcademyRecord {
  id: string;
  lesson_id: string;
  score: number;
  completed_at: string;
}

export interface LessonStats {
  attempts: number;
  bestScore: number;
  lastScore: number;
  allScores: number[];
  improving: boolean;
  mastered: boolean;
  needsWork: boolean;
  passed: boolean; // met passScore at least once
}

export function useAcademy(user: User | null) {
  const [records, setRecords] = useState<AcademyRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setRecords([]); setLoading(false); return; }
    void (async () => {
      try {
        const { data } = await supabase
          .from('academy_progress')
          .select('*')
          .eq('user_id', user.id)
          .order('completed_at', { ascending: false });
        setRecords((data ?? []) as AcademyRecord[]);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const saveSession = useCallback(async (lessonId: string, score: number) => {
    if (!user) return;
    const { data } = await supabase
      .from('academy_progress')
      .insert({ user_id: user.id, lesson_id: lessonId, score })
      .select()
      .single();
    if (data) setRecords(prev => [data as AcademyRecord, ...prev]);
  }, [user]);

  function getLessonStats(lessonId: string, passScore = 7.0): LessonStats | null {
    const forLesson = records
      .filter(r => r.lesson_id === lessonId)
      .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime());
    if (forLesson.length === 0) return null;
    const scores = forLesson.map(r => r.score);
    const last3 = scores.slice(0, 3);
    const avg3 = last3.reduce((s, x) => s + x, 0) / last3.length;
    const declining = scores.length >= 3 && scores[0] < scores[1] && scores[1] < scores[2];
    return {
      attempts: scores.length,
      bestScore: Math.max(...scores),
      lastScore: scores[0],
      allScores: scores.slice(0, 5).reverse(),
      improving: scores.length >= 2 && scores[0] > scores[scores.length - 1],
      mastered: avg3 >= 8.5,
      needsWork: scores.length >= 3 && (scores[0] < 6 || declining),
      passed: Math.max(...scores) >= passScore,
    };
  }

  /**
   * Returns true if this lesson is available to attempt.
   * - First lesson in the module is always unlocked.
   * - Every subsequent lesson requires the previous one to have been passed
   *   (best score >= previous lesson's passScore).
   */
  function isLessonUnlocked(lessons: CurriculumLesson[], lessonIndex: number): boolean {
    if (lessonIndex === 0) return true;
    const prev = lessons[lessonIndex - 1];
    const stats = getLessonStats(prev.id, prev.passScore);
    return stats?.passed === true;
  }

  function getOverallStats() {
    const attempted = new Set(records.map(r => r.lesson_id)).size;
    const allScores = records.map(r => r.score);
    const avgScore = allScores.length > 0
      ? Math.round(allScores.reduce((s, x) => s + x, 0) / allScores.length * 10) / 10
      : 0;
    return { attempted, avgScore, totalSessions: records.length };
  }

  return { records, loading, saveSession, getLessonStats, isLessonUnlocked, getOverallStats };
}
