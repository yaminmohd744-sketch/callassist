// ─── Signal classification keywords ──────────────────────────────────────────
// Used by classifySignal() in LiveCallScreen and UploadCallScreen to tag
// transcript entries as objection / buying-signal / neutral.

export const OBJECTION_KEYWORDS = [
  'too expensive', 'too costly', 'too high', 'price is too', 'costs too much',
  "can't afford", 'out of budget', 'not in the budget',
  'not interested', 'not right now', 'not the right time', 'no thanks',
  'not a good fit', 'no budget', 'no money',
  'already have', 'using another',
  'send me info', 'send an email',
  'too busy', 'call me back',
  'need to think', 'talk to my boss',
];

export const BUYING_KEYWORDS = [
  'interested', 'tell me more', 'how much', 'how does it work',
  'when can', 'sounds good', 'makes sense', 'can you', "what's included",
];

// ─── Speaker classification phrases ──────────────────────────────────────────
// Used by classifySpeaker() in LiveCallScreen to decide whether an utterance
// came from the rep or the prospect.

export const PROSPECT_PHRASES = [
  // Price & cost questions
  'how much', "what's the price", 'what does it cost', 'cost per', 'pricing', 'how expensive',
  'what would it cost', "what's the cost",
  // Asking about the product
  'how does it work', 'tell me more', 'what does it do', "what's included", 'can it do',
  'does it integrate', 'does it work with', 'can you show', 'can we see a demo',
  'how long does it take', 'what kind of',
  // Objections
  'not interested', 'not right now', 'not the right time', 'no thanks', 'not a good fit',
  'already have', 'already using', 'using another', 'we have a', 'we use a',
  'too expensive', 'too costly', "can't afford", 'no budget', 'no money', 'out of budget',
  'send me info', 'send an email', 'too busy', 'call me back',
  'need to think', 'talk to my boss', 'let me check', 'not sure about',
  // Buying signals
  'sounds good', 'sounds interesting', "i'm interested", "we're interested",
  'how soon can you', "let's do it", 'sign me up',
  // Prospect describing their situation
  'we currently', "we're currently", 'our team', 'our company', 'our business',
  "we've been", "we're looking", 'we need', 'we want', 'my team', 'my company',
  "we don't", 'we do', "i don't", "i'm not sure",
  // Permission / "go ahead" reactions
  'let me hear', 'let me hear it', 'go ahead', 'go on', "i'm listening",
  "you've got", 'you have my', 'make it quick', 'make it fast',
  "i'll give you", 'go for it', 'fair enough', 'alright then',
  // Identification challenges
  'what is it', 'what do you want', "what's this about", "what's it about",
  'who is this', "who's this", 'who are you', 'how did you get',
  // Availability dismissals
  'not a good time', 'bad time', 'not the best time',
  "i'm in a meeting", "i'm driving", "i'm with",
];

export const REP_PHRASES = [
  // Introducing / opening
  "i'm calling", "i'm reaching out", 'my name is', 'i work at', "i'm from",
  "the reason i'm calling", 'i wanted to', "i'd like to", "i'd love to",
  // Pitching
  'our platform', 'our product', 'our solution', 'our service', 'our software', 'our tool',
  'what we do', 'we help', 'we work with', 'we specialize', "we've helped",
  "we've been working", 'we partner',
  // Explaining
  'let me explain', 'the way it works', 'to give you an idea',
  'what that means', 'the benefit is', 'what this allows', 'for example',
  'imagine being able to',
  // Discovery questions
  "what's your current", 'how are you currently', 'what challenges', 'are you currently',
  'how do you currently', 'what would it mean', 'would it be helpful', 'what are you using',
  "what's your biggest", 'how does your team',
  // Closing / scheduling
  'can we set aside', 'can we schedule', 'do you have time', 'do you have a few',
  'ten minutes', 'fifteen minutes', 'quick call', 'quick chat',
  'would you be open', 'would it make sense', 'are you open to',
  'does that make sense', 'can i share', 'can i show you', 'let me share',
  "i'm calling from", 'calling from',
];

// Short filler/reaction words that signal the prospect responding briefly
// after the rep has spoken. Only checked when previous speaker was rep and
// the utterance is ≤10 words.
export const PROSPECT_REACTIONS = [
  'ok', 'okay', 'sure', 'alright', 'right', 'yeah', 'yes', 'fine', 'yep',
  'i see', 'i hear', 'understood', 'interesting', 'really', 'uh huh', 'mm',
  'how so', 'what do you mean', 'go on', 'tell me', 'i got it',
];
