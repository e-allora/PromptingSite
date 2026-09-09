export type Lesson = {
  slug: string;
  title: string;
  /** One line, plain language, shown on the index. */
  hook: string;
  minutes: number;
  /** Paragraphs of body copy. */
  body: string[];
  before: string;
  after: string;
  /** Why the "after" works — the point of the lesson. */
  point: string;
};

export const LESSONS: Lesson[] = [
  {
    slug: "say-who-it-is-for",
    title: "Say who it's for",
    hook: "The same answer can be right for a lawyer and useless for your mum.",
    minutes: 2,
    body: [
      "An AI doesn't know who's reading. So it picks an average: middle-of-the-road, a bit formal, aimed at nobody in particular. That's why answers so often feel like a brochure.",
      "Tell it who's on the other end and everything shifts — the words it picks, how much it explains, how long it goes on.",
      "You don't need a fancy description. \"For my 70-year-old dad who's never used a computer\" does more work than any clever phrasing.",
    ],
    before: "explain cloud storage",
    after:
      "Explain what cloud storage is to my 70-year-old dad, who has never used a computer. Use an everyday comparison and skip the technical words.",
    point:
      "One phrase — who it's for — changed the reading level, the length, and the tone all at once.",
  },
  {
    slug: "say-what-you-want-back",
    title: "Say what you want back",
    hook: "A list, an email, a table, three options? Ask, or you'll get an essay.",
    minutes: 2,
    body: [
      "Left to itself, an AI writes paragraphs. Paragraphs are its default shape for everything, including things that should obviously be a list.",
      "If you know the shape you want — a bulleted list, a table, a ready-to-send email, exactly five ideas — say so. It costs you four words.",
      "This is also how you control length. \"In two sentences\" is a real instruction, and it will follow it.",
    ],
    before: "ideas for a team offsite",
    after:
      "Give me 5 ideas for a team offsite. Put them in a list. For each one, add a single line on why it suits a team that mostly works remotely.",
    point:
      "Naming the format and the count means you get something you can use immediately, instead of something you have to reformat.",
  },
  {
    slug: "give-it-the-facts",
    title: "Give it the facts you already know",
    hook: "It can't read your situation. Anything you leave out, it invents.",
    minutes: 3,
    body: [
      "This is the big one. Every detail you leave out, the AI fills in with a plausible guess — and a plausible guess about your life is usually wrong.",
      "Ask for \"a complaint letter\" and you'll get one about a fictional order from a fictional shop on a fictional date. Useless, and you'll spend longer fixing it than writing it yourself.",
      "Before you hit send, ask yourself one question: what do I know that this thing doesn't? Then paste that in. Dates, names, numbers, what's already been tried — none of it has to be tidy.",
    ],
    before: "write a complaint letter about a delivery",
    after:
      "Write a complaint email to Brightway Furniture. I ordered a dining table on 3 March, they promised delivery within 10 days, and it's now 2 April with no delivery. I've called twice and nobody called back. I want a full refund. Keep it firm but polite, under 200 words.",
    point:
      "Same request. But now every specific belongs to your actual problem, so the letter is ready to send rather than ready to rewrite.",
  },
  {
    slug: "tell-it-who-to-be",
    title: "Tell it who to be",
    hook: "\"You are a nurse explaining this to a patient\" changes everything after it.",
    minutes: 2,
    body: [
      "Giving the AI a role is a shortcut. Instead of listing every rule you want it to follow, you name a kind of person, and it pulls in all the habits that come with that job.",
      "\"You are an experienced plumber\" brings practical, safety-first, no-nonsense. \"You are a patient tutor\" brings small steps and checking in. You didn't have to spell any of that out.",
      "Keep it honest, though. A role changes how it writes, not what it knows. Calling it a doctor doesn't make its medical advice safe to rely on.",
    ],
    before: "is my sourdough starter dead",
    after:
      "You are an experienced baker helping a nervous beginner. My sourdough starter has a grey liquid on top and smells sharp, like nail polish. Walk me through whether it's dead, and what to do next, in plain steps.",
    point:
      "The role set the tone and the level of detail. The specific facts — grey liquid, sharp smell — did the actual diagnostic work.",
  },
  {
    slug: "show-an-example",
    title: "Show it an example",
    hook: "Describing the style you want is hard. Showing it is easy.",
    minutes: 2,
    body: [
      "Some things are almost impossible to describe but trivial to demonstrate. Tone is the classic one. You can write a paragraph about wanting something \"warm but not cutesy, professional but not stiff\" and still get it wrong.",
      "Paste in one example instead. An email you liked. A product description that sounds right. Then say: match this.",
      "This works for structure too. Show it one entry done the way you want, and ask for the other twenty in the same shape.",
    ],
    before: "write product descriptions for my candles in a nice style",
    after:
      "Here's a product description I like the sound of:\n\n\"Smells like the first ten minutes of a bonfire. Burns for 40 hours. Made in a shed in Leeds.\"\n\nWrite descriptions in that same voice — short, dry, concrete — for these three candles: [list your candles].",
    point:
      "One example did what three paragraphs of adjectives couldn't. The AI can copy a pattern far more reliably than it can interpret a mood.",
  },
  {
    slug: "keep-going",
    title: "Don't accept the first answer",
    hook: "The first reply is a draft. Talking back is the whole skill.",
    minutes: 2,
    body: [
      "Most people type one thing, get something mediocre, and conclude the AI isn't very good. But the first answer is a starting point, not a verdict.",
      "You can just say what's wrong with it. \"Too formal.\" \"Cut it in half.\" \"The second one — do three more like that.\" \"You've invented a date, I never said that.\" It keeps the context and adjusts.",
      "This is the habit that separates people who get a lot out of these tools from people who give up on them. Not better opening prompts — more rounds.",
    ],
    before: "[you accept a stiff, generic first draft and give up]",
    after:
      "That's too formal and it's twice as long as I need. Cut it to 100 words, make it sound like a real person wrote it, and drop the part about our 'valued partnership'.",
    point:
      "You don't have to get it right first time. You just have to say what's off — the same way you would to a person.",
  },
];

export function getLesson(slug: string): Lesson | undefined {
  return LESSONS.find((lesson) => lesson.slug === slug);
}
