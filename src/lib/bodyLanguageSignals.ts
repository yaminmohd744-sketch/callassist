import type { AISuggestion, SuggestionType } from '../types';

export type BodySignalKey =
  | 'not-nodding'
  | 'eye-contact-lost'
  | 'leaning-back'
  | 'chin-down';

interface BodySignalDef {
  physicalIcon: string;
  physicalAction: string;
  headline: string;
  type: SuggestionType;
  needsScript: boolean;
}

const DEFS: Record<BodySignalKey, BodySignalDef> = {
  'not-nodding': {
    physicalIcon: 'nod',
    physicalAction: 'Nod as you say this',
    headline: 'Nodding increases agreement likelihood',
    type: 'tip',
    needsScript: true,
  },
  'eye-contact-lost': {
    physicalIcon: 'eye',
    physicalAction: 'Look at the camera',
    headline: 'Eye contact builds trust',
    type: 'tip',
    needsScript: false,
  },
  'leaning-back': {
    physicalIcon: 'lean',
    physicalAction: 'Lean forward',
    headline: 'Leaning in signals engagement',
    type: 'tip',
    needsScript: true,
  },
  'chin-down': {
    physicalIcon: 'chin',
    physicalAction: 'Chin up',
    headline: 'Chin up projects authority',
    type: 'tip',
    needsScript: false,
  },
};

let _id = 0;

export function buildBodyCard(
  key: BodySignalKey,
  elapsedSeconds: number,
  currentScript?: string,
): AISuggestion {
  const def = DEFS[key];
  return {
    id: `body-${key}-${++_id}`,
    type: def.type,
    headline: def.headline,
    body: def.needsScript ? (currentScript ?? '') : '',
    triggeredBy: `body:${key}`,
    timestampSeconds: elapsedSeconds,
    physicalAction: def.physicalAction,
    physicalIcon: def.physicalIcon,
  };
}
