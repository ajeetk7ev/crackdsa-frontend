import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useNotificationStore } from "@/stores/notification.store";
import {
  BrainCircuit,
  Target,
  Clock,
  Check,
  ChevronDown,
  ChevronUp,
  Flame,
  ArrowRight,
  Code2,
  BookOpen,
  Activity,
  Award,
  CheckCircle2,
  Compass
} from "lucide-react";


interface FAQItem {
  question: string;
  answer: string;
}

interface MockProblem {
  id: number;
  title: string;
  pattern: string;
  lastSolved: string;
  nextReview: string;
  status: "due" | "scheduled";
  interval?: string;
}

export function LandingPage() {
  const addToast = useNotificationStore((state: any) => state.addToast);

  // FAQ Accordion State
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Showcase Component Tab State
  const [showcaseTab, setShowcaseTab] = useState<"srs" | "analytics" | "collections" | "productivity">("srs");

  // Mock Dashboard State for Hero Interaction
  const [streak, setStreak] = useState(14);
  const [readinessScore, setReadinessScore] = useState(78);
  const [problems, setProblems] = useState<MockProblem[]>([
    {
      id: 1,
      title: "LRU Cache Design",
      pattern: "Design / Linked List",
      lastSolved: "3 days ago",
      nextReview: "Due Today",
      status: "due",
    },
    {
      id: 2,
      title: "Course Schedule",
      pattern: "Graphs (DFS/BFS)",
      lastSolved: "5 days ago",
      nextReview: "Due Today",
      status: "due",
    },
    {
      id: 3,
      title: "Merge k Sorted Lists",
      pattern: "Heaps & Merge Sort",
      lastSolved: "7 days ago",
      nextReview: "Due Today",
      status: "due",
    },
  ]);

  // Heatmap tracking (28 days array)
  // Index 27 is the current day. It lights up when they complete a review.
  const [activityGrid, setActivityGrid] = useState<boolean[]>(
    Array.from({ length: 28 }, (_, i) => i < 18 || i === 20 || i === 23)
  );

  const handleHeroConfidence = (problemId: number, confidence: "again" | "hard" | "good" | "easy", days: number) => {
    setProblems((prev) =>
      prev.map((p) => {
        if (p.id === problemId) {
          return {
            ...p,
            status: "scheduled",
            nextReview: `Scheduled`,
            interval: `${days} days`,
          };
        }
        return p;
      })
    );

    // Increment streak on first action of the day
    if (streak === 14) {
      setStreak(15);
      // Light up today in heatmap
      setActivityGrid((prev) => {
        const copy = [...prev];
        copy[27] = true;
        return copy;
      });
      setReadinessScore((prev) => Math.min(prev + 4, 100));
    } else {
      setReadinessScore((prev) => Math.min(prev + 2, 100));
    }

    const problemName = problems.find((p) => p.id === problemId)?.title || "Problem";
    addToast(
      `SM2 Scheduler: "${problemName}" scheduled for review in ${days} days. Confidence: ${confidence.toUpperCase()}`,
      "success"
    );
  };

  const resetHeroSimulator = () => {
    setStreak(14);
    setReadinessScore(78);
    setProblems([
      {
        id: 1,
        title: "LRU Cache Design",
        pattern: "Design / Linked List",
        lastSolved: "3 days ago",
        nextReview: "Due Today",
        status: "due",
      },
      {
        id: 2,
        title: "Course Schedule",
        pattern: "Graphs (DFS/BFS)",
        lastSolved: "5 days ago",
        nextReview: "Due Today",
        status: "due",
      },
      {
        id: 3,
        title: "Merge k Sorted Lists",
        pattern: "Heaps & Merge Sort",
        lastSolved: "7 days ago",
        nextReview: "Due Today",
        status: "due",
      },
    ]);
    setActivityGrid(Array.from({ length: 28 }, (_, i) => i < 18 || i === 20 || i === 23));
  };

  const faqItems: FAQItem[] = [
    {
      question: "Is CrackDSA another LeetCode competitor or Online Judge?",
      answer:
        "No. CrackDSA does not run code or compete with LeetCode. Think of LeetCode as the gym where you lift weights, and CrackDSA as the digital coach that schedules your workouts, records your logs, builds custom focus plans, and ensures you retain what you trained.",
    },
    {
      question: "Do I write or execute code on CrackDSA?",
      answer:
        "You write and submit code directly on LeetCode. Once solved, you log the problem into CrackDSA, record your markdown notes on the pattern's core mechanics, and let our algorithm handle revision triggers.",
    },
    {
      question: "How is this different from a static Excel DSA Sheet?",
      answer:
        "Excel sheets show a list of tasks. They don't track memory decay. A week after checking off a question, you forget its optimal time complexity. CrackDSA tracks the forgetting curve dynamically via the SM2 algorithm to trigger review loops when you are on the verge of forgetting.",
    },
    {
      question: "Can I connect my LeetCode profile?",
      answer:
        "Yes! You can add your LeetCode username inside settings. We sync your submission history so you can visually correlate LeetCode practice with your revision timelines and readiness scores.",
    },
    {
      question: "Is there a free version of the platform?",
      answer:
        "Yes, the basic plan is completely free. It provides access to our standard curated sheet of 100+ high-yield problems, checklist tracking, and markdown notes. The Premium Prep plan ($12/month) unlocks the automated SM2 Spaced Repetition engine, unlimited collections, advanced analytics, and weekly progress reports.",
    },
  ];

  return (
    <div className="flex flex-col items-center bg-background text-foreground overflow-x-hidden selection:bg-primary/10 w-full">
      
      {/* 1. HERO SECTION */}
      <section className="relative w-full max-w-7xl mx-auto px-6 pt-16 md:pt-24 pb-20 grid lg:grid-cols-12 gap-12 items-center">
        
        {/* Hero Left Content */}
        <div className="lg:col-span-6 space-y-8 text-left">
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-background-secondary text-xs text-muted-foreground font-medium w-fit">
            <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 size-2 rounded-full inline-block animate-pulse" />
            Curated by a Google Software Engineer
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.08] font-sans">
              You solved hundreds of coding problems.
              <span className="block mt-2 text-muted-foreground">
                Can you still solve them today?
              </span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed font-normal">
              Solving is only half the battle. Mastery is remembering. CrackDSA replaces scattered Excel sheets, notebooks, and folders with a single spaced-repetition workflow designed to build permanent coding pattern recall.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 items-center pt-2">
            <Link to="/signup">
              <Button size="lg" className="h-11 px-7 cursor-pointer shadow-md bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg text-sm flex items-center gap-1.5 transition-transform hover:-translate-y-0.5">
                Start Mastering DSA <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="h-11 px-7 cursor-pointer hover:bg-muted/50 rounded-lg text-sm text-foreground">
                Browse Problems
              </Button>
            </Link>
          </div>

          {/* Micro-Social Proof */}
          <div className="flex items-center gap-8 pt-4 text-xs text-muted-foreground border-t border-border/60 max-w-md">
            <div>
              <strong className="block text-sm font-semibold text-foreground">500+ Curated Problems</strong>
              High-yield patterns
            </div>
            <div className="w-px h-6 bg-border" />
            <div>
              <strong className="block text-sm font-semibold text-foreground">18 Core Patterns</strong>
              Sliding Window, Graphs, DP...
            </div>
            <div className="w-px h-6 bg-border" />
            <div>
              <strong className="block text-sm font-semibold text-foreground">SM2 Scheduler</strong>
              Memory-backed recall
            </div>
          </div>
        </div>

        {/* Hero Right Visual: Interactive Dashboard mockup */}
        <div className="lg:col-span-6 w-full flex justify-center">
          <div className="w-full max-w-xl rounded-2xl border border-border/80 bg-card/65 backdrop-blur-sm p-6 shadow-xl space-y-6 relative overflow-hidden transition-all duration-300 hover:border-border">
            
            {/* Mock Dashboard Header */}
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <div>
                <h3 className="font-semibold text-sm text-foreground">Prepare Dashboard</h3>
                <p className="text-[11px] text-muted-foreground">Revision Companion for LeetCode</p>
              </div>

              {/* Reset Control */}
              <button 
                onClick={resetHeroSimulator}
                className="text-[10px] text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors cursor-pointer"
              >
                Reset Demo
              </button>
            </div>

            {/* Mock Metrics Row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-background-secondary border border-border/50 text-center space-y-1">
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider block">Daily Streak</span>
                <span className="text-lg font-bold text-amber-500 flex items-center justify-center gap-1">
                  <Flame className="size-4 fill-amber-500/20" /> {streak}d
                </span>
              </div>
              <div className="p-3 rounded-lg bg-background-secondary border border-border/50 text-center space-y-1">
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider block">Readiness</span>
                <span className="text-lg font-bold text-indigo-500">{readinessScore}%</span>
              </div>
              <div className="p-3 rounded-lg bg-background-secondary border border-border/50 text-center space-y-1">
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider block">Due Today</span>
                <span className="text-lg font-bold text-foreground">
                  {problems.filter((p) => p.status === "due").length} items
                </span>
              </div>
            </div>

            {/* Today's Revision Queue */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <BrainCircuit className="size-3.5 text-indigo-500 animate-pulse" />
                  Today's Revision Queue
                </span>
                <span className="text-[10px] bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full font-medium">
                  Active Recall Required
                </span>
              </div>

              <div className="space-y-2">
                {problems.map((p) => (
                  <div 
                    key={p.id}
                    className="p-3 rounded-lg border border-border/50 bg-card hover:border-border/90 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 text-left"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-foreground">{p.title}</span>
                        <span className="text-[9px] font-normal text-muted-foreground px-1.5 py-0.2 bg-muted rounded">
                          {p.pattern}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Last solved: {p.lastSolved}</p>
                    </div>

                    {p.status === "due" ? (
                      <div className="flex gap-1 justify-end items-center self-end md:self-auto">
                        <span className="text-[10px] text-muted-foreground mr-1.5 hidden md:inline">Difficulty?</span>
                        <button
                          onClick={() => handleHeroConfidence(p.id, "again", 1)}
                          className="text-[9px] font-semibold border border-destructive/20 hover:border-destructive/60 hover:bg-destructive/5 text-destructive px-2 py-0.5 rounded cursor-pointer"
                        >
                          Again (1d)
                        </button>
                        <button
                          onClick={() => handleHeroConfidence(p.id, "good", 5)}
                          className="text-[9px] font-semibold border border-indigo-200/50 dark:border-indigo-900/50 hover:bg-indigo-500/10 text-indigo-500 px-2 py-0.5 rounded cursor-pointer"
                        >
                          Good (5d)
                        </button>
                        <button
                          onClick={() => handleHeroConfidence(p.id, "easy", 14)}
                          className="text-[9px] font-semibold bg-emerald-500 text-white px-2 py-0.5 rounded cursor-pointer"
                        >
                          Easy (14d)
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium text-xs">
                        <CheckCircle2 className="size-3.5" /> Reviewed, next recall in {p.interval}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Consistency Heatmap Segment */}
            <div className="space-y-2 pt-2 border-t border-border/60">
              <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                <span>Consistency Synced (LeetCode + Reviews)</span>
                <span>Active Streak: {streak} days</span>
              </div>
              <div className="flex items-center gap-1.5 justify-start">
                <span className="text-[9px] text-muted-foreground">Past Weeks:</span>
                <div className="grid grid-flow-col grid-rows-4 gap-1">
                  {activityGrid.map((active, index) => (
                    <div 
                      key={index}
                      className={`size-2.5 rounded-[1px] transition-all duration-300 ${
                        active 
                          ? index === 27 
                            ? "bg-emerald-500 animate-bounce scale-110" 
                            : "bg-emerald-600 dark:bg-emerald-500" 
                          : "bg-muted dark:bg-muted/30"
                      }`}
                      title={active ? `Activity on Day ${index + 1}` : "No activity"}
                    />
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. THE PROBLEM (THE SILENT LEETCODE TAX) */}
      <section className="w-full bg-background-secondary py-20 md:py-28 border-y border-border/80">
        <div className="max-w-6xl mx-auto px-6 space-y-16 text-center">
          
          <div className="max-w-2xl mx-auto space-y-4">
            <span className="text-xs font-bold text-destructive uppercase tracking-widest block font-sans">The Interview Prep Bottleneck</span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
              Why solving hundreds of LeetCode problems isn't working.
            </h2>
            <p className="text-muted-foreground leading-relaxed text-sm md:text-base font-normal">
              Developers fall into a repetitive trap. You read an Excel sheet, open LeetCode, solve a problem, write code, forget it in two weeks, and restart from scratch. Your efforts are scattered across incompatible apps.
            </p>
          </div>

          {/* Visualizing the Chaos */}
          <div className="grid md:grid-cols-12 gap-8 items-center pt-4">
            
            {/* The Disconnected Workspace Mockup */}
            <div className="md:col-span-7 border border-border/80 bg-card rounded-2xl p-6 shadow-sm space-y-4 text-left">
              <h4 className="text-sm font-semibold text-destructive flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-destructive" /> Disconnected Workspace (Before)
              </h4>
              <p className="text-xs text-muted-foreground">Everything is stored in separate, siloed locations with no unified flow:</p>
              
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 border border-border/60 rounded-lg bg-background-secondary">
                  <span className="text-[10px] text-muted-foreground font-semibold block uppercase">1. Excel Sheets</span>
                  <p className="text-xs text-foreground font-medium mt-1">Problems List</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Rows of links with no schedule or metadata.</p>
                </div>
                <div className="p-3 border border-border/60 rounded-lg bg-background-secondary">
                  <span className="text-[10px] text-muted-foreground font-semibold block uppercase">2. Google Docs & Notion</span>
                  <p className="text-xs text-foreground font-medium mt-1">Code & Explanations</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Long docs nested under folders, hard to search.</p>
                </div>
                <div className="p-3 border border-border/60 rounded-lg bg-background-secondary">
                  <span className="text-[10px] text-muted-foreground font-semibold block uppercase">3. Calendar Tasks</span>
                  <p className="text-xs text-foreground font-medium mt-1">Revision Reminders</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Rigid events quickly overrun by daily workloads.</p>
                </div>
                <div className="p-3 border border-border/60 rounded-lg bg-background-secondary">
                  <span className="text-[10px] text-muted-foreground font-semibold block uppercase">4. Sticky Notes & Paper</span>
                  <p className="text-xs text-foreground font-medium mt-1">Quick Complexity Traces</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Easily lost handwritten diagrams.</p>
                </div>
              </div>
            </div>

            {/* The Explanation */}
            <div className="md:col-span-5 text-left space-y-6">
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-foreground">The cost of cognitive overhead</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  When you prepare, you waste more time context-switching between tools than actually reinforcing patterns. Because you lack a memory engine, you end up studying the same Sliding Window or Topological Sort logic 3 or 4 times.
                </p>
              </div>

              <ul className="space-y-3 text-xs text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-destructive font-bold text-sm mt-0.5">✕</span>
                  <span><strong>Zero Recall Scheduling:</strong> You revision-guess based on gut feeling, not logic.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-destructive font-bold text-sm mt-0.5">✕</span>
                  <span><strong>Decentralized Journals:</strong> Notes are separated from code, hindering rapid reviews.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-destructive font-bold text-sm mt-0.5">✕</span>
                  <span><strong>No Readiness Analytics:</strong> You enter interviews guessing if you've mastered key patterns.</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* 3. THE SOLUTION (THE Master LOOP) */}
      <section className="w-full py-20 md:py-28 max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-12 gap-12 items-center">
          
          <div className="md:col-span-5 space-y-6 text-left">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block font-sans">The Master Loop</span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground leading-[1.1]">
              A unified learning companion for LeetCode.
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              CrackDSA isn't a platform where you copy-paste code. It's a structured learning system designed to work alongside LeetCode to organize notes, schedule spaced recalls, and measure preparation metrics.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex gap-3">
                <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 size-8 rounded-lg flex items-center justify-center shrink-0">
                  <Check className="size-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">Code in the real sandbox</h4>
                  <p className="text-xs text-muted-foreground">Keep solving directly on LeetCode with full IDE features and extensions.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 size-8 rounded-lg flex items-center justify-center shrink-0">
                  <Check className="size-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">Intelligent memory scheduler</h4>
                  <p className="text-xs text-muted-foreground">Our SM2 scheduler tells you exactly when to revisit problems to build long-term retention.</p>
                </div>
              </div>
            </div>
          </div>

          {/* The visual timeline graph */}
          <div className="md:col-span-7 border border-border bg-card/50 rounded-2xl p-6 shadow-sm relative overflow-hidden text-left">
            <h3 className="text-sm font-bold text-foreground mb-4">Streamlined Recall Loop</h3>
            
            <div className="space-y-6 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-px before:bg-border/80">
              
              {/* Step 1 */}
              <div className="relative pl-8 flex items-start gap-3">
                <div className="absolute left-1.5 top-1 size-5 rounded-full border-2 border-primary bg-background flex items-center justify-center text-[10px] font-bold">1</div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">Pick a Curated Pattern</h4>
                  <p className="text-[11px] text-muted-foreground">Select a problem from the 500+ sheet covering core structures like sliding windows and graphs.</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative pl-8 flex items-start gap-3">
                <div className="absolute left-1.5 top-1 size-5 rounded-full border-2 border-primary bg-background flex items-center justify-center text-[10px] font-bold">2</div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">Solve on LeetCode</h4>
                  <p className="text-[11px] text-muted-foreground">Execute the solution in the sandbox environment. Test edge cases and optimize execution time.</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative pl-8 flex items-start gap-3">
                <div className="absolute left-1.5 top-1 size-5 rounded-full border-2 border-primary bg-background flex items-center justify-center text-[10px] font-bold">3</div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">Log Notes & Rate Recall</h4>
                  <p className="text-[11px] text-muted-foreground">Save markdown code traces, complexity bounds, and rate your confidence (Again, Good, Easy).</p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="relative pl-8 flex items-start gap-3">
                <div className="absolute left-1.5 top-1 size-5 rounded-full border-2 border-emerald-500 bg-background text-emerald-500 flex items-center justify-center text-[10px] font-bold">✓</div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">Automated Spaced Review</h4>
                  <p className="text-[11px] text-muted-foreground">Our SM2 scheduler handles the rest, raising alert cards in your queue exactly when you're about to forget.</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 4. HOW IT WORKS (FOUR PILLARS CARD GRID) */}
      <section className="w-full bg-background-secondary py-20 md:py-28 border-y border-border/80">
        <div className="max-w-6xl mx-auto px-6 space-y-16 text-center">
          
          <div className="max-w-xl mx-auto space-y-3">
            <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest block font-sans">System Mechanics</span>
            <h2 className="text-3xl font-extrabold text-foreground">How CrackDSA Works</h2>
            <p className="text-sm text-muted-foreground font-normal">Four modular processes that turn chaotic practice into permanent engineering recall.</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 text-left">
            
            {/* Card 1 */}
            <div className="p-6 rounded-xl border border-border/70 bg-card hover:border-border transition-all hover:-translate-y-1 shadow-sm flex flex-col justify-between h-56">
              <div className="space-y-3">
                <div className="bg-primary/5 text-primary size-9 rounded-lg flex items-center justify-center">
                  <Compass className="size-5 text-indigo-500" />
                </div>
                <h4 className="font-bold text-sm text-foreground">1. Discover</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Browse a curated sheet of 500+ problems handpicked by a Google engineer, categorizing high-yield patterns across top tech interviews.
                </p>
              </div>
              <span className="text-[10px] text-muted-foreground font-semibold">500+ Curated Sheet</span>
            </div>

            {/* Card 2 */}
            <div className="p-6 rounded-xl border border-border/70 bg-card hover:border-border transition-all hover:-translate-y-1 shadow-sm flex flex-col justify-between h-56">
              <div className="space-y-3">
                <div className="bg-primary/5 text-primary size-9 rounded-lg flex items-center justify-center">
                  <Code2 className="size-5 text-emerald-500" />
                </div>
                <h4 className="font-bold text-sm text-foreground">2. Solve</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Practice directly in the official LeetCode interface. No clunky online judge clones; code in the sandbox where you feel most comfortable.
                </p>
              </div>
              <span className="text-[10px] text-muted-foreground font-semibold">Vetted LeetCode Sandbox</span>
            </div>

            {/* Card 3 */}
            <div className="p-6 rounded-xl border border-border/70 bg-card hover:border-border transition-all hover:-translate-y-1 shadow-sm flex flex-col justify-between h-56">
              <div className="space-y-3">
                <div className="bg-primary/5 text-primary size-9 rounded-lg flex items-center justify-center">
                  <BookOpen className="size-5 text-amber-500" />
                </div>
                <h4 className="font-bold text-sm text-foreground">3. Learn</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Consolidate with markdown logs, organize custom folder collections (e.g., 'Meta Prep'), and sync complexity data.
                </p>
              </div>
              <span className="text-[10px] text-muted-foreground font-semibold">Markdown Notebook</span>
            </div>

            {/* Card 4 */}
            <div className="p-6 rounded-xl border border-border/70 bg-card hover:border-border transition-all hover:-translate-y-1 shadow-sm flex flex-col justify-between h-56">
              <div className="space-y-3">
                <div className="bg-primary/5 text-primary size-9 rounded-lg flex items-center justify-center">
                  <BrainCircuit className="size-5 text-sky-500" />
                </div>
                <h4 className="font-bold text-sm text-foreground">4. Master</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Automatic revision schedules trigger cards when memory decay starts. Check metrics like topic progress and readiness indexes.
                </p>
              </div>
              <span className="text-[10px] text-muted-foreground font-semibold">SM2 Memory Scheduler</span>
            </div>

          </div>
        </div>
      </section>

      {/* 5. FEATURES MATRIX (LOGICALLY GROUPED) */}
      <section className="w-full py-20 md:py-28 max-w-6xl mx-auto px-6 space-y-16">
        
        <div className="text-center max-w-xl mx-auto space-y-3">
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block font-sans">Capabilities Matrix</span>
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
            A comprehensive suite for technical mastery.
          </h2>
          <p className="text-sm text-muted-foreground font-normal">
            A look at the feature sets designed to manage study consistency, track notebook records, and schedule revision intervals.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Group 1: Revision Engine */}
          <div className="p-6 rounded-xl border border-border/60 bg-card/30 space-y-5">
            <h3 className="font-bold text-base text-foreground flex items-center gap-2 pb-2 border-b border-border/60">
              <BrainCircuit className="size-4.5 text-indigo-500" /> Revision Engine
            </h3>
            <ul className="space-y-4">
              <li className="space-y-1 text-left">
                <span className="text-xs font-semibold text-foreground block">Smart Revision Queue</span>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Automatically surfaces problems that are due for active recall based on your memory intervals.
                </p>
              </li>
              <li className="space-y-1 text-left">
                <span className="text-xs font-semibold text-foreground block">Revision Timeline</span>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Visualize your upcoming review calendar to prevent cramming before interview loops.
                </p>
              </li>
              <li className="space-y-1 text-left">
                <span className="text-xs font-semibold text-foreground block">Custom SRS Intervals</span>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Manually adjust next-review targets to match personal study goals or target deadlines.
                </p>
              </li>
            </ul>
          </div>

          {/* Group 2: Learning Records */}
          <div className="p-6 rounded-xl border border-border/60 bg-card/30 space-y-5">
            <h3 className="font-bold text-base text-foreground flex items-center gap-2 pb-2 border-b border-border/60">
              <BookOpen className="size-4.5 text-emerald-500" /> Learning Records
            </h3>
            <ul className="space-y-4">
              <li className="space-y-1 text-left">
                <span className="text-xs font-semibold text-foreground block">Personal Markdown Notes</span>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Save time complexities, optimal approaches, and alternative code pathways in a structured notebook.
                </p>
              </li>
              <li className="space-y-1 text-left">
                <span className="text-xs font-semibold text-foreground block">Custom Collections</span>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Organize problem groupings by target companies, specific difficulty tiers, or weak areas.
                </p>
              </li>
              <li className="space-y-1 text-left">
                <span className="text-xs font-semibold text-foreground block">Unified Study Journal</span>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Log notes and reviews chronologically to inspect daily progress over long prep timelines.
                </p>
              </li>
            </ul>
          </div>

          {/* Group 3: Consistency Systems */}
          <div className="p-6 rounded-xl border border-border/60 bg-card/30 space-y-5">
            <h3 className="font-bold text-base text-foreground flex items-center gap-2 pb-2 border-b border-border/60">
              <Target className="size-4.5 text-amber-500" /> Consistency Systems
            </h3>
            <ul className="space-y-4">
              <li className="space-y-1 text-left">
                <span className="text-xs font-semibold text-foreground block">Contribution Heatmap</span>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Sync daily commits, reviews, and solved problems directly to a GitHub-style calendar grid.
                </p>
              </li>
              <li className="space-y-1 text-left">
                <span className="text-xs font-semibold text-foreground block">Weekly Performance Digests</span>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Receive email insights summary metrics, category totals, and speed benchmarks weekly.
                </p>
              </li>
              <li className="space-y-1 text-left">
                <span className="text-xs font-semibold text-foreground block">Daily Streak Metrics</span>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Track active streaks and set reminders to avoid breaking consistency.
                </p>
              </li>
            </ul>
          </div>

          {/* Group 4: Progress Analytics */}
          <div className="p-6 rounded-xl border border-border/60 bg-card/30 space-y-5">
            <h3 className="font-bold text-base text-foreground flex items-center gap-2 pb-2 border-b border-border/60">
              <Activity className="size-4.5 text-sky-500" /> Progress Analytics
            </h3>
            <ul className="space-y-4">
              <li className="space-y-1 text-left">
                <span className="text-xs font-semibold text-foreground block">Interview Readiness rating</span>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  A dynamic score calculated from retention stats, accuracy metrics, and speed tracking.
                </p>
              </li>
              <li className="space-y-1 text-left">
                <span className="text-xs font-semibold text-foreground block">Topic Coverage Distributions</span>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Identify and target weak patterns like Trees, Backtracking, or Heaps before interviews.
                </p>
              </li>
              <li className="space-y-1 text-left">
                <span className="text-xs font-semibold text-foreground block">Historical Mastery Logs</span>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Track performance indices over months to verify growth curves.
                </p>
              </li>
            </ul>
          </div>

          {/* Group 5: Productivity Kits */}
          <div className="p-6 rounded-xl border border-border/60 bg-card/30 space-y-5">
            <h3 className="font-bold text-base text-foreground flex items-center gap-2 pb-2 border-b border-border/60">
              <Clock className="size-4.5 text-purple-500" /> Productivity Kits
            </h3>
            <ul className="space-y-4">
              <li className="space-y-1 text-left">
                <span className="text-xs font-semibold text-foreground block">Pomodoro Focus Timer</span>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Set customizable timer sessions directly alongside problem descriptions to practice time limits.
                </p>
              </li>
              <li className="space-y-1 text-left">
                <span className="text-xs font-semibold text-foreground block">Alarms & Alerts</span>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Subtle sound cues remind you when scheduled study blocks conclude or reviews are due.
                </p>
              </li>
              <li className="space-y-1 text-left">
                <span className="text-xs font-semibold text-foreground block">LeetCode Sync Extension</span>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Quick-sync Chrome integration updates problem states directly upon submission.
                </p>
              </li>
            </ul>
          </div>

          {/* Group 6: System Infrastructure */}
          <div className="p-6 rounded-xl border border-border/60 bg-card/30 space-y-5">
            <h3 className="font-bold text-base text-foreground flex items-center gap-2 pb-2 border-b border-border/60">
              <Award className="size-4.5 text-pink-500" /> Infrastructure
            </h3>
            <ul className="space-y-4">
              <li className="space-y-1 text-left">
                <span className="text-xs font-semibold text-foreground block">Cloud Backups</span>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Your markdown notebooks, problem lists, and recall logs are securely backed up across devices.
                </p>
              </li>
              <li className="space-y-1 text-left">
                <span className="text-xs font-semibold text-foreground block">Dark Mode Native Interface</span>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  A high-contrast interface designed for long night study sessions.
                </p>
              </li>
              <li className="space-y-1 text-left">
                <span className="text-xs font-semibold text-foreground block">Fast Search & Filters</span>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Search through 500+ problems, custom collections, and markdown entries in milliseconds.
                </p>
              </li>
            </ul>
          </div>

        </div>
      </section>

      {/* 6. PRODUCT SHOWCASE (INTERACTIVE HIGHLIGHT TABS) */}
      <section className="w-full bg-background-secondary py-20 md:py-28 border-y border-border/80">
        <div className="max-w-6xl mx-auto px-6 space-y-12">
          
          <div className="text-center max-w-xl mx-auto space-y-3">
            <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest block font-sans">Interactive Walkthrough</span>
            <h2 className="text-3xl font-extrabold text-foreground">Explore the CrackDSA Interface</h2>
            <p className="text-sm text-muted-foreground font-normal">Select a feature below to preview dashboard integrations and core mechanics.</p>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-stretch pt-4">
            
            {/* Tab Selectors (Left side) */}
            <div className="lg:col-span-4 flex flex-col gap-2 justify-center">
              
              <button 
                onClick={() => setShowcaseTab("srs")}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  showcaseTab === "srs" 
                    ? "border-primary bg-card shadow-sm" 
                    : "border-border/60 hover:border-border hover:bg-muted/30"
                }`}
              >
                <div className="flex items-center gap-2">
                  <BrainCircuit className="size-4 text-indigo-500" />
                  <span className="text-xs font-bold text-foreground">Adaptive SRS Engine</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">
                  Watch how the SM2 algorithm increases gap intervals for mastered questions to reduce study loads.
                </p>
              </button>

              <button 
                onClick={() => setShowcaseTab("analytics")}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  showcaseTab === "analytics" 
                    ? "border-primary bg-card shadow-sm" 
                    : "border-border/60 hover:border-border hover:bg-muted/30"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Activity className="size-4 text-emerald-500" />
                  <span className="text-xs font-bold text-foreground">Readiness Analytics</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">
                  Identify prepare metrics and weaknesses across critical coding patterns before schedule runs.
                </p>
              </button>

              <button 
                onClick={() => setShowcaseTab("collections")}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  showcaseTab === "collections" 
                    ? "border-primary bg-card shadow-sm" 
                    : "border-border/60 hover:border-border hover:bg-muted/30"
                }`}
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="size-4 text-amber-500" />
                  <span className="text-xs font-bold text-foreground">Collections & Notes</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">
                  Organize custom workspace folders and save solutions in the built-in editor.
                </p>
              </button>

              <button 
                onClick={() => setShowcaseTab("productivity")}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  showcaseTab === "productivity" 
                    ? "border-primary bg-card shadow-sm" 
                    : "border-border/60 hover:border-border hover:bg-muted/30"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Clock className="size-4 text-purple-500" />
                  <span className="text-xs font-bold text-foreground">Pomodoro Timer</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">
                  Maintain consistency under study pressure using integrated focus timers.
                </p>
              </button>

            </div>

            {/* Mockup Preview Panel (Right side) */}
            <div className="lg:col-span-8 border border-border bg-card rounded-2xl p-6 shadow-md flex flex-col justify-center min-h-[350px] transition-all">
              
              {showcaseTab === "srs" && (
                <div className="space-y-6 text-left animate-in fade-in duration-200">
                  <div className="flex justify-between items-center pb-3 border-b border-border/60">
                    <div>
                      <h4 className="text-xs font-bold text-foreground">Adaptive Memory Recall Gaps</h4>
                      <p className="text-[10px] text-muted-foreground">Ebbinghaus forgetting curve optimization</p>
                    </div>
                    <span className="text-[10px] bg-indigo-500/10 text-indigo-500 px-2 py-0.5 rounded font-medium">SM2 Algorithm</span>
                  </div>

                  {/* SVG Line Graph representation of Retention curves */}
                  <div className="space-y-4">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Without Spaced Repetition, your memory of a coding pattern drops to 20% in 5 days. With CrackDSA, scheduled reviews flatten the curve, locking in patterns over weeks.
                    </p>
                    
                    {/* Visual Curve Representation */}
                    <div className="relative h-32 border-l border-b border-border/80 mx-2 pt-2">
                      {/* Forgetting Curve line */}
                      <svg className="w-full h-full absolute inset-0 overflow-visible" fill="none">
                        {/* Static Forgot Curve (Red) */}
                        <path 
                          d="M 0 10 Q 50 80 150 110" 
                          stroke="rgba(239, 68, 68, 0.4)" 
                          strokeWidth="2" 
                          strokeDasharray="4 2"
                        />
                        <text x="60" y="85" fill="rgba(239, 68, 68, 0.6)" className="text-[8px] font-medium">Forgot curve (Excel/None)</text>
                        
                        {/* Spaced Recall Curve (Green) */}
                        <path 
                          d="M 0 10 Q 15 25 30 10 Q 60 25 90 10 Q 140 25 190 10 Q 260 25 350 10" 
                          stroke="var(--color-success)" 
                          strokeWidth="2.5"
                        />
                        <text x="240" y="25" fill="var(--color-success)" className="text-[8px] font-semibold">SRS Mastery retention curve</text>
                      </svg>
                      
                      {/* X and Y labels */}
                      <span className="absolute bottom-1 right-2 text-[8px] text-muted-foreground">Days of Study</span>
                      <span className="absolute top-1 left-2 text-[8px] text-muted-foreground">Memory %</span>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-center pt-2">
                      <div className="p-2 border border-border/60 rounded bg-background-secondary text-left">
                        <span className="text-[9px] text-muted-foreground block">Review 1</span>
                        <span className="text-xs font-semibold text-foreground">Day 1</span>
                      </div>
                      <div className="p-2 border border-border/60 rounded bg-background-secondary text-left">
                        <span className="text-[9px] text-muted-foreground block">Review 2</span>
                        <span className="text-xs font-semibold text-foreground">Day 4</span>
                      </div>
                      <div className="p-2 border border-border/60 rounded bg-background-secondary text-left">
                        <span className="text-[9px] text-muted-foreground block">Review 3</span>
                        <span className="text-xs font-semibold text-foreground">Day 12</span>
                      </div>
                      <div className="p-2 border border-border/60 rounded bg-background-secondary text-left">
                        <span className="text-[9px] text-muted-foreground block">Review 4</span>
                        <span className="text-xs font-semibold text-foreground">Day 28</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {showcaseTab === "analytics" && (
                <div className="space-y-6 text-left animate-in fade-in duration-200">
                  <div className="flex justify-between items-center pb-3 border-b border-border/60">
                    <div>
                      <h4 className="text-xs font-bold text-foreground">Interview Readiness Metrics</h4>
                      <p className="text-[10px] text-muted-foreground">Data-driven preparation metrics</p>
                    </div>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded font-medium">84% Interview Ready</span>
                  </div>

                  <div className="space-y-4">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Understand exactly where you stand. Our Readiness Indicator rates topic depth, accuracy metrics, and spaced recall logs to predict performance.
                    </p>

                    <div className="space-y-2.5 pt-2">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-semibold text-foreground">
                          <span>Arrays & Hashing (Mastered)</span>
                          <span>100%</span>
                        </div>
                        <div className="w-full bg-muted dark:bg-muted/40 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full w-full" />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-semibold text-foreground">
                          <span>Sliding Window (Strong)</span>
                          <span>85%</span>
                        </div>
                        <div className="w-full bg-muted dark:bg-muted/40 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full w-[85%]" />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-semibold text-foreground">
                          <span>Graphs & DFS/BFS (Reinforcing)</span>
                          <span>60%</span>
                        </div>
                        <div className="w-full bg-muted dark:bg-muted/40 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-indigo-500 h-full w-[60%]" />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-semibold text-foreground">
                          <span>Dynamic Programming (Weak)</span>
                          <span>35%</span>
                        </div>
                        <div className="w-full bg-muted dark:bg-muted/40 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-destructive h-full w-[35%]" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {showcaseTab === "collections" && (
                <div className="space-y-5 text-left animate-in fade-in duration-200">
                  <div className="flex justify-between items-center pb-3 border-b border-border/60">
                    <div>
                      <h4 className="text-xs font-bold text-foreground">Custom Playlists & Markdown Notebook</h4>
                      <p className="text-[10px] text-muted-foreground">Store notes directly adjacent to problems</p>
                    </div>
                    <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded font-medium">Notebook Workspace</span>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Build targeted revision checklists for specific interviews. Document complexity metrics and optimal code pathways.
                  </p>

                  <div className="grid md:grid-cols-2 gap-4">
                    
                    {/* Mock Collections list */}
                    <div className="p-3 border border-border/60 rounded bg-background-secondary space-y-2">
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase block">Playlists (3)</span>
                      
                      <div className="p-2 border border-border/40 rounded bg-card flex items-center justify-between text-[11px] font-medium">
                        <span className="flex items-center gap-1.5 text-foreground">
                          📁 Meta high yield pack
                        </span>
                        <span className="text-muted-foreground text-[10px]">12 items</span>
                      </div>

                      <div className="p-2 border border-border/40 rounded bg-card flex items-center justify-between text-[11px] font-medium">
                        <span className="flex items-center gap-1.5 text-foreground">
                          📁 Blind 75 Revision
                        </span>
                        <span className="text-muted-foreground text-[10px]">75 items</span>
                      </div>

                      <div className="p-2 border border-border/40 rounded bg-card flex items-center justify-between text-[11px] font-medium">
                        <span className="flex items-center gap-1.5 text-foreground">
                          📁 Graph Traversal
                        </span>
                        <span className="text-muted-foreground text-[10px]">6 items</span>
                      </div>
                    </div>

                    {/* Mock Notes Editor */}
                    <div className="p-3 border border-border/60 rounded bg-background-secondary flex flex-col justify-between">
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase block">LRU Cache Notes.md</span>
                      <div className="bg-card border border-border/40 rounded p-2 text-[10px] font-mono text-muted-foreground leading-relaxed mt-1.5">
                        <span className="text-blue-500">## Intuition</span><br />
                        Combine <span className="text-foreground">HashMap</span> + <span className="text-foreground">Doubly LinkedList</span>.<br />
                        HashMap gets O(1) reads.<br />
                        DLL allows O(1) updates to node orders.
                      </div>
                      <span className="text-[9px] text-emerald-500 font-semibold mt-2 block">✓ Saved to cloud</span>
                    </div>

                  </div>
                </div>
              )}

              {showcaseTab === "productivity" && (
                <div className="space-y-6 text-left animate-in fade-in duration-200">
                  <div className="flex justify-between items-center pb-3 border-b border-border/60">
                    <div>
                      <h4 className="text-xs font-bold text-foreground">Pomodoro Focus Framework</h4>
                      <p className="text-[10px] text-muted-foreground">Prepare under structured time bounds</p>
                    </div>
                    <span className="text-[10px] bg-purple-500/10 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded font-medium">Pomodoro Timer</span>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Set focused 25-minute study intervals. Time-management tracking builds the edge required for short technical assessment loops.
                  </p>

                  <div className="flex items-center justify-center p-4 border border-border/60 rounded bg-background-secondary gap-6">
                    <div className="text-center space-y-1">
                      <div className="text-2xl font-bold text-foreground tracking-widest font-mono">24:59</div>
                      <span className="text-[9px] text-muted-foreground uppercase font-medium">Time Remaining</span>
                    </div>

                    <div className="h-10 w-px bg-border/80" />

                    <div className="text-left space-y-1.5">
                      <span className="text-[10px] text-foreground font-semibold block">Focus Loop: LRU Cache</span>
                      <div className="flex gap-2">
                        <button className="px-3 py-1 bg-primary text-primary-foreground text-[10px] rounded font-semibold">Pause</button>
                        <button className="px-3 py-1 border border-border/80 text-[10px] rounded font-semibold text-foreground">Skip</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>

          </div>
        </div>
      </section>

      {/* 7. THE MASTER JOURNEY (MEMORY RETENTION TIMELINE) */}
      <section className="w-full py-20 md:py-28 max-w-6xl mx-auto px-6 text-center space-y-16">
        
        <div className="max-w-xl mx-auto space-y-3">
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block font-sans">The Path to Recall</span>
          <h2 className="text-3xl font-extrabold text-foreground">The Retention Journey</h2>
          <p className="text-sm text-muted-foreground font-normal">Moving coding solutions from temporary comprehension to permanent recall.</p>
        </div>

        <div className="relative flex flex-col md:flex-row md:justify-between items-center gap-8 md:gap-4 max-w-4xl mx-auto before:absolute before:left-1/2 before:top-0 before:bottom-0 before:w-px before:bg-border/60 md:before:left-0 md:before:right-0 md:before:top-1/2 md:before:bottom-auto md:before:h-px">
          
          <div className="relative bg-background border border-border rounded-xl p-4 w-48 text-left z-10 space-y-1.5">
            <span className="bg-primary/5 text-primary size-7 rounded-full flex items-center justify-center font-bold text-xs">1</span>
            <h4 className="text-xs font-bold text-foreground">1. Comprehension</h4>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Read the patterns, write edge cases, and solve on LeetCode. Solution exists in short-term RAM.
            </p>
          </div>

          <div className="relative bg-background border border-border rounded-xl p-4 w-48 text-left z-10 space-y-1.5">
            <span className="bg-primary/5 text-primary size-7 rounded-full flex items-center justify-center font-bold text-xs">2</span>
            <h4 className="text-xs font-bold text-foreground">2. Document</h4>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Write clear complexity bounds, optimal paths, and log initial review intervals.
            </p>
          </div>

          <div className="relative bg-background border border-border rounded-xl p-4 w-48 text-left z-10 space-y-1.5">
            <span className="bg-primary/5 text-primary size-7 rounded-full flex items-center justify-center font-bold text-xs">3</span>
            <h4 className="text-xs font-bold text-foreground">3. Recall Syncs</h4>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Re-solve key problems at 1-day, 3-day, and 8-day marks right as memory decay begins.
            </p>
          </div>

          <div className="relative bg-background border border-emerald-500 rounded-xl p-4 w-48 text-left z-10 space-y-1.5">
            <span className="bg-emerald-500 text-white size-7 rounded-full flex items-center justify-center font-bold text-xs">✓</span>
            <h4 className="text-xs font-bold text-foreground">4. Interview Readiness</h4>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Permanent retention achieved. Patterns are recalled fluently in high-pressure assessments.
            </p>
          </div>

        </div>
      </section>

      {/* 8. WHO IS THIS FOR? */}
      <section className="w-full bg-background-secondary py-20 md:py-28 border-y border-border/80">
        <div className="max-w-6xl mx-auto px-6 space-y-16 text-center">
          
          <div className="max-w-xl mx-auto space-y-3">
            <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest block font-sans">Ideal Users</span>
            <h2 className="text-3xl font-extrabold text-foreground">Engineered for Ambitious Careers</h2>
            <p className="text-sm text-muted-foreground font-normal">Different candidates prepare differently. CrackDSA accommodates all preparation timelines.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 text-left">
            
            {/* User Profile 1 */}
            <div className="p-6 rounded-xl border border-border/60 bg-card shadow-sm space-y-4">
              <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 size-9 rounded-lg flex items-center justify-center font-semibold text-xs">
                Switch
              </div>
              <h4 className="font-bold text-sm text-foreground">Experienced Switchers</h4>
              <p className="text-xs text-muted-foreground leading-relaxed font-normal">
                Working full-time leaves little room to solve 500+ LeetCode problems. Optimize prep by re-solving questions based on SM2 intervals, keeping review loops tight.
              </p>
            </div>

            {/* User Profile 2 */}
            <div className="p-6 rounded-xl border border-border/60 bg-card shadow-sm space-y-4">
              <div className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 size-9 rounded-lg flex items-center justify-center font-semibold text-xs">
                Grads
              </div>
              <h4 className="font-bold text-sm text-foreground">Freshers & Students</h4>
              <p className="text-xs text-muted-foreground leading-relaxed font-normal">
                Build high-yield structural memory before interview loops start. Master critical patterns instead of memorizing separate problem solutions.
              </p>
            </div>

            {/* User Profile 3 */}
            <div className="p-6 rounded-xl border border-border/60 bg-card shadow-sm space-y-4">
              <div className="bg-amber-500/10 text-amber-600 dark:text-amber-400 size-9 rounded-lg flex items-center justify-center font-semibold text-xs">
                Sprint
              </div>
              <h4 className="font-bold text-sm text-foreground">Active Candidates</h4>
              <p className="text-xs text-muted-foreground leading-relaxed font-normal">
                Sync collections and view topic coverage grids to target weaknesses, ensuring readiness in under 30 days.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 9. SOCIAL PROOF & METRICS */}
      <section className="w-full py-20 md:py-28 max-w-6xl mx-auto px-6 space-y-16 text-center">
        
        <div className="max-w-xl mx-auto space-y-3">
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block font-sans">Preparation Metrics</span>
          <h2 className="text-3xl font-extrabold text-foreground">Vetted by Engineers</h2>
          <p className="text-sm text-muted-foreground font-normal">Moving away from passive sheets. A closer look at preparation statistics.</p>
        </div>

        {/* Numbers grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4 max-w-4xl mx-auto">
          
          <div className="p-4 border border-border/60 rounded-xl bg-card">
            <span className="block text-3xl font-extrabold text-foreground font-sans">500+</span>
            <span className="text-[10px] text-muted-foreground uppercase font-semibold">High-Yield Questions</span>
          </div>

          <div className="p-4 border border-border/60 rounded-xl bg-card">
            <span className="block text-3xl font-extrabold text-foreground font-sans">18+</span>
            <span className="text-[10px] text-muted-foreground uppercase font-semibold">Core Patterns mapped</span>
          </div>

          <div className="p-4 border border-border/60 rounded-xl bg-card">
            <span className="block text-3xl font-extrabold text-foreground font-sans">14 Days</span>
            <span className="text-[10px] text-muted-foreground uppercase font-semibold">Target Recall Lock</span>
          </div>

          <div className="p-4 border border-border/60 rounded-xl bg-card">
            <span className="block text-3xl font-extrabold text-foreground font-sans">0</span>
            <span className="text-[10px] text-muted-foreground uppercase font-semibold">Forgotten Solutions</span>
          </div>

        </div>

        {/* Elegant Testimonial placeholder grid */}
        <div className="grid md:grid-cols-2 gap-6 pt-6 max-w-4xl mx-auto text-left">
          
          <div className="p-6 border border-border bg-card/40 rounded-xl space-y-3">
            <p className="text-xs text-muted-foreground leading-relaxed italic font-normal">
              "Before CrackDSA, I would solve 200 questions on LeetCode, pause for a month, and forget nearly everything. Spaced repetition scheduled reviews exactly when I needed them. I switched to Google without feeling scattered."
            </p>
            <div>
              <span className="text-xs font-semibold text-foreground block">Software Engineer</span>
              <span className="text-[10px] text-muted-foreground">Admitted to Google, 2026</span>
            </div>
          </div>

          <div className="p-6 border border-border bg-card/40 rounded-xl space-y-3">
            <p className="text-xs text-muted-foreground leading-relaxed italic font-normal">
              "Excel sheets are passive. You look at rows and feel overwhelmed. Loging my notes and tracking readiness metrics inside CrackDSA gave me the confidence to pass Meta's technical screens."
            </p>
            <div>
              <span className="text-xs font-semibold text-foreground block">Senior Developer</span>
              <span className="text-[10px] text-muted-foreground">Admitted to Meta, 2026</span>
            </div>
          </div>

        </div>
      </section>

      {/* 10. FAQ SECTION */}
      <section className="w-full bg-background-secondary py-20 md:py-28 border-t border-border/80">
        <div className="max-w-3xl mx-auto px-6 space-y-8">
          
          <div className="text-center space-y-3">
            <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest block font-sans">Support & Context</span>
            <h2 className="text-3xl font-extrabold text-foreground flex items-center justify-center gap-2">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-muted-foreground font-normal font-sans">Everything you need to know about the platform mechanics.</p>
          </div>

          {/* FAQ Accordion container */}
          <div className="divide-y divide-border border border-border/70 rounded-xl bg-card overflow-hidden shadow-sm">
            {faqItems.map((faq, idx) => (
              <div key={idx} className="p-4 transition-all">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between text-left font-semibold text-xs text-foreground cursor-pointer focus:outline-none py-1"
                >
                  <span>{faq.question}</span>
                  {expandedFaq === idx ? (
                    <ChevronUp className="size-4 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronDown className="size-4 text-muted-foreground shrink-0" />
                  )}
                </button>
                
                {expandedFaq === idx && (
                  <div className="mt-2 text-[11px] text-muted-foreground leading-relaxed animate-in fade-in slide-in-from-top-1 duration-150 pt-1 border-t border-border/20">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="w-full py-24 px-6 max-w-5xl mx-auto text-center">
        <div className="p-8 md:p-16 border border-border bg-card rounded-3xl relative overflow-hidden shadow-lg space-y-6">
          
          {/* Subtle gradient glow block */}
          <div className="absolute inset-0 bg-radial-gradient from-indigo-500/5 via-transparent to-transparent pointer-events-none" />

          <div className="space-y-3 relative z-10 max-w-xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-none">
              Build Better Interview Habits
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Stop pouring solutions into a leaking memory bucket. Sync your LeetCode habits with an intelligent, spaced-recall engine starting today.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 justify-center relative z-10 pt-2">
            <Link to="/signup">
              <Button size="lg" className="h-11 px-8 cursor-pointer shadow-md bg-primary hover:bg-primary/95 text-primary-foreground font-semibold rounded-lg text-sm flex items-center gap-1.5">
                Start Mastering DSA
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="h-11 px-8 cursor-pointer hover:bg-muted/50 rounded-lg text-sm text-foreground">
                Sign In
              </Button>
            </Link>
          </div>

        </div>
      </section>

      {/* PAGE FOOTER */}
      <footer className="w-full border-t border-border/60 py-8 px-6 text-center text-[10px] text-muted-foreground bg-background">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© 2026 CrackDSA Platform. All rights reserved. Created by engineering professionals.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-foreground transition-colors">Support Portal</a>
          </div>
        </div>
      </footer>

    </div>
  );
}

