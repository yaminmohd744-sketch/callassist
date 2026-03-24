import type { TrainingScenario } from '../types';
import type { TrainingDifficulty } from '../hooks/useTraining';

export interface CurriculumLesson {
  id: string;
  title: string;
  concept: string;
  tip: string;
  scenario: TrainingScenario;
  subScenarioIndex: number;
  difficulty: TrainingDifficulty;
}

export interface CurriculumModule {
  id: string;
  title: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  color: 'green' | 'yellow' | 'red';
  lessons: CurriculumLesson[];
}

export const CURRICULUM: CurriculumModule[] = [
  {
    id: 'foundations',
    title: 'Cold Call Foundations',
    level: 'Beginner',
    color: 'green',
    lessons: [
      {
        id: 'l1-opener',
        title: 'The Perfect Opener',
        concept: 'Hook the prospect in the first 10 seconds',
        tip: 'Your opening line decides everything. Skip the "how are you?" and lead with relevance - a specific reason why this call makes sense for them right now. Curiosity beats features every time.',
        scenario: 'cold-opener',
        subScenarioIndex: 0,
        difficulty: 'easy',
      },
      {
        id: 'l2-not-interested',
        title: 'Handling "Not Interested"',
        concept: 'Turn a rejection into a conversation',
        tip: 'Don\'t fight the objection - acknowledge it and pivot with a question. "That\'s fair - most people I talk to feel that way before they hear what specifically changed for them. Can I ask just one thing?" earns another 30 seconds.',
        scenario: 'not-interested',
        subScenarioIndex: 0,
        difficulty: 'easy',
      },
      {
        id: 'l3-skeptic',
        title: 'The Skeptical Prospect',
        concept: 'Earn the right to continue the conversation',
        tip: 'A skeptical prospect is actually a good sign - they\'re still on the phone. Replace features with questions. "What\'s the one thing you\'d change about how you currently handle X?" shifts the dynamic from pitch to dialogue.',
        scenario: 'cold-opener',
        subScenarioIndex: 1,
        difficulty: 'medium',
      },
    ],
  },
  {
    id: 'objections',
    title: 'Objection Handling',
    level: 'Intermediate',
    color: 'yellow',
    lessons: [
      {
        id: 'l4-price',
        title: 'Price Objections',
        concept: 'Reframe cost as an investment, not an expense',
        tip: 'Price objections are value objections in disguise. Before defending the price, isolate it: "Is it the price itself, or is it about whether you\'ll see the return?" Then focus all your energy on the ROI conversation.',
        scenario: 'price-objection',
        subScenarioIndex: 0,
        difficulty: 'easy',
      },
      {
        id: 'l5-think-over',
        title: 'The "Think It Over" Trap',
        concept: 'Create urgency without pressure',
        tip: '"I\'ll think about it" means you haven\'t created urgency yet. Don\'t push - ask: "What specifically would you be thinking through?" Surface the real concern, address it, and give them a reason why waiting costs them something real.',
        scenario: 'think-it-over',
        subScenarioIndex: 0,
        difficulty: 'easy',
      },
      {
        id: 'l6-status-quo',
        title: 'Breaking the Status Quo',
        concept: 'Make inaction feel riskier than change',
        tip: 'Comfortable people don\'t change. Your job isn\'t to convince them your product is great - it\'s to make the cost of staying put feel real. Ask: "What happens to your team if this problem is still unsolved in 6 months?"',
        scenario: 'not-interested',
        subScenarioIndex: 1,
        difficulty: 'medium',
      },
    ],
  },
  {
    id: 'closing',
    title: 'Discovery & Closing',
    level: 'Advanced',
    color: 'red',
    lessons: [
      {
        id: 'l7-discovery',
        title: 'Discovery That Reveals Pain',
        concept: 'Ask questions that uncover what keeps them up at night',
        tip: 'People don\'t buy solutions - they buy relief from pain. Stop describing features and start diagnosing problems. "What\'s the impact when that breaks down?" is more powerful than any product pitch.',
        scenario: 'discovery',
        subScenarioIndex: 1,
        difficulty: 'medium',
      },
      {
        id: 'l8-trial-close',
        title: 'The Trial Close',
        concept: 'Ask for a decision, not a sale',
        tip: 'Don\'t ask "Do you want to buy?" - ask "Does this solve the problem we talked about?" A yes here means you\'re closing, not selling. Remove every barrier between agreement and action.',
        scenario: 'closing',
        subScenarioIndex: 1,
        difficulty: 'medium',
      },
      {
        id: 'l9-hard-close',
        title: 'Closing the Hard Prospect',
        concept: 'Take control when the prospect keeps stalling',
        tip: 'Moving goalposts are a sign the prospect wants to be led. Stop addressing each new objection individually - step back: "It sounds like there\'s something bigger holding you back. What\'s the real concern?" Own the conversation.',
        scenario: 'closing',
        subScenarioIndex: 2,
        difficulty: 'hard',
      },
    ],
  },
];

export const ALL_LESSONS = CURRICULUM.flatMap(m => m.lessons);
