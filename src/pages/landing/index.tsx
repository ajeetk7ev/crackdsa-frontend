import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useNotificationStore } from "@/stores/notification.store";
import { useAuthStore } from "@/stores/auth.store";
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
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    document.title = "CrackDSA | Spaced Repetition DSA Tracker for LeetCode";
  }, []);

  // FAQ Accordion State
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Showcase Component Tab State
  const [showcaseTab, setShowcaseTab] = useState<"dashboard" | "sheets" | "revision" | "problem">("dashboard");

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
            {isAuthenticated ? (
              <>
                <Link to="/dashboard">
                  <Button size="lg" className="h-11 px-7 cursor-pointer shadow-md bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg text-sm flex items-center gap-1.5 transition-transform hover:-translate-y-0.5">
                    Go to Dashboard <ArrowRight className="size-4" />
                  </Button>
                </Link>
                <Link to="/problems">
                  <Button variant="outline" size="lg" className="h-11 px-7 cursor-pointer hover:bg-muted/50 rounded-lg text-sm text-foreground">
                    Browse Problems
                  </Button>
                </Link>
              </>
            ) : (
              <>
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
              </>
            )}
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

      {/* 6. PLATFORM PAGES SHOWCASE (INTERACTIVE HIGHLIGHT TABS) */}
      <section id="platform-showcase" className="w-full bg-background-secondary py-20 md:py-28 border-y border-border/80">
        <div className="max-w-6xl mx-auto px-6 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest block font-sans">Platform Workspace Experience</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
              Explore the CrackDSA Suite
            </h2>
            <p className="text-sm text-muted-foreground font-normal">
              Click through our live interface tabs to inspect the Command Dashboard, Pattern-Wise DSA Sheets, SM-2 Spaced Revision Board, and Problem Workspace.
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-stretch pt-4">
            
            {/* Tab Selectors (Left side) */}
            <div className="lg:col-span-4 flex flex-col gap-3 justify-center">
              
              <button 
                onClick={() => setShowcaseTab("dashboard")}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  showcaseTab === "dashboard" 
                    ? "border-primary bg-card shadow-lg ring-1 ring-primary/30" 
                    : "border-border/60 hover:border-border hover:bg-muted/30"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="size-7 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold">
                    <Activity className="size-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-foreground block">Command Dashboard</span>
                    <span className="text-[10px] text-muted-foreground">Action plans, streaks & Pomodoro</span>
                  </div>
                </div>
              </button>

              <button 
                onClick={() => setShowcaseTab("sheets")}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  showcaseTab === "sheets" 
                    ? "border-primary bg-card shadow-lg ring-1 ring-primary/30" 
                    : "border-border/60 hover:border-border hover:bg-muted/30"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="size-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                    <BookOpen className="size-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-foreground block">Pattern-Wise DSA Sheets</span>
                    <span className="text-[10px] text-muted-foreground">Hierarchical Subtopics & Progress Accordions</span>
                  </div>
                </div>
              </button>

              <button 
                onClick={() => setShowcaseTab("revision")}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  showcaseTab === "revision" 
                    ? "border-primary bg-card shadow-lg ring-1 ring-primary/30" 
                    : "border-border/60 hover:border-border hover:bg-muted/30"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="size-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                    <BrainCircuit className="size-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-foreground block">SM-2 Revision Queue</span>
                    <span className="text-[10px] text-muted-foreground">Automated spaced recall & forecast</span>
                  </div>
                </div>
              </button>

              <button 
                onClick={() => setShowcaseTab("problem")}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  showcaseTab === "problem" 
                    ? "border-primary bg-card shadow-lg ring-1 ring-primary/30" 
                    : "border-border/60 hover:border-border hover:bg-muted/30"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="size-7 rounded-lg bg-sky-500/10 text-sky-500 flex items-center justify-center font-bold">
                    <Code2 className="size-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-foreground block">Problem Workspace & Notes</span>
                    <span className="text-[10px] text-muted-foreground">Markdown logs, solve timer & LeetCode link</span>
                  </div>
                </div>
              </button>

            </div>

            {/* Mockup Preview Panel (Right side) */}
            <div className="lg:col-span-8 border border-border/80 bg-card/90 backdrop-blur-md rounded-2xl p-6 shadow-2xl flex flex-col justify-center min-h-[420px] transition-all relative overflow-hidden">
              
              {/* TAB 1: COMMAND DASHBOARD */}
              {showcaseTab === "dashboard" && (
                <div className="space-y-5 text-left animate-in fade-in duration-200">
                  <div className="flex justify-between items-center pb-3 border-b border-border/60">
                    <div>
                      <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                        Good evening, ajeet <Flame className="size-4 text-amber-500 fill-amber-500/20" />
                      </h4>
                      <p className="text-[11px] text-muted-foreground">Your active learning hub & daily target plan</p>
                    </div>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full font-semibold border border-emerald-500/20">
                      ⚡ 14 Days Active Streak
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-xl bg-background-secondary border border-border/60 space-y-1">
                      <span className="text-[10px] text-muted-foreground font-semibold block">TODAY'S REVISION</span>
                      <span className="text-sm font-bold text-emerald-500 flex items-center gap-1">
                        <CheckCircle2 className="size-3.5" /> All Caught Up!
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-background-secondary border border-border/60 space-y-1">
                      <span className="text-[10px] text-muted-foreground font-semibold block">LEETCODE SYNC</span>
                      <span className="text-sm font-bold text-indigo-500 flex items-center gap-1">
                        Connected (ajeet)
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-background-secondary border border-border/60 space-y-1">
                      <span className="text-[10px] text-muted-foreground font-semibold block">TODAY'S GOAL</span>
                      <span className="text-sm font-bold text-foreground">
                        0 / 4 Targets Set
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-background-secondary border border-border/60 space-y-1">
                      <span className="text-[10px] text-muted-foreground font-semibold block">POMODORO FOCUS</span>
                      <span className="text-sm font-bold text-purple-500 font-mono">
                        25:00 Focus
                      </span>
                    </div>
                  </div>

                  {/* Heatmap & Action Section */}
                  <div className="p-4 rounded-xl border border-border/60 bg-background-secondary/60 space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-foreground">28-Day Consistency Calendar</span>
                      <span className="text-[10px] text-muted-foreground">Updated automatically on review completion</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {Array.from({ length: 28 }, (_, i) => (
                        <div 
                          key={i} 
                          className={`h-4 flex-1 rounded-[2px] transition-all ${
                            i < 18 || i === 20 || i === 23 || i === 27
                              ? "bg-emerald-500 hover:bg-emerald-400"
                              : "bg-muted/40"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: PATTERN-WISE DSA SHEETS */}
              {showcaseTab === "sheets" && (
                <div className="space-y-4 text-left animate-in fade-in duration-200">
                  <div className="flex justify-between items-center pb-3 border-b border-border/60">
                    <div>
                      <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                        Dynamic Programming Master Sheet
                      </h4>
                      <p className="text-[11px] text-muted-foreground">42 Problems • 11 Hierarchical Patterns</p>
                    </div>
                    <div className="flex items-center gap-1.5 bg-background-secondary border border-border/60 p-1 rounded-lg text-[10px] font-semibold">
                      <span className="px-2 py-0.5 rounded bg-primary text-primary-foreground">Pattern Roadmap</span>
                      <span className="px-2 py-0.5 text-muted-foreground">Flat Table</span>
                    </div>
                  </div>

                  {/* Hierarchical Subtopic Accordions Preview */}
                  <div className="space-y-2.5">
                    
                    {/* Subtopic 1 */}
                    <div className="border border-border/60 rounded-xl bg-background-secondary/50 p-3 space-y-2">
                      <div className="flex justify-between items-center text-xs font-bold text-foreground">
                        <span className="flex items-center gap-1.5">
                          📁 1D Dynamic Programming <span className="text-[10px] font-normal text-muted-foreground">(3 Patterns • 0/5 Solved)</span>
                        </span>
                        <span className="text-[10px] text-emerald-500 font-mono">0%</span>
                      </div>
                      
                      <div className="pl-4 space-y-1.5 border-l-2 border-primary/40 pt-1">
                        <div className="p-2 rounded-lg border border-border/40 bg-card flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-muted-foreground">#070</span>
                            <span className="font-semibold text-foreground">Climbing Stairs</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-500 font-semibold">Easy</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-muted text-muted-foreground">Meta</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-muted text-muted-foreground">Amazon</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground">1D State Transitions</span>
                        </div>
                      </div>
                    </div>

                    {/* Subtopic 2 */}
                    <div className="border border-border/60 rounded-xl bg-background-secondary/50 p-3 space-y-2">
                      <div className="flex justify-between items-center text-xs font-bold text-foreground">
                        <span className="flex items-center gap-1.5">
                          📁 Strings & Sequence DP <span className="text-[10px] font-normal text-muted-foreground">(2 Patterns • 0/3 Solved)</span>
                        </span>
                        <span className="text-[10px] text-emerald-500 font-mono">0%</span>
                      </div>

                      <div className="pl-4 space-y-1.5 border-l-2 border-indigo-500/40 pt-1">
                        <div className="p-2 rounded-lg border border-border/40 bg-card flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-muted-foreground">#005</span>
                            <span className="font-semibold text-foreground">Longest Palindromic Substring</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-500 font-semibold">Medium</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-muted text-muted-foreground">Google</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground">Expand Center</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* TAB 3: SM-2 REVISION QUEUE */}
              {showcaseTab === "revision" && (
                <div className="space-y-5 text-left animate-in fade-in duration-200">
                  <div className="flex justify-between items-center pb-3 border-b border-border/60">
                    <div>
                      <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                        Daily Revision Board
                      </h4>
                      <p className="text-[11px] text-muted-foreground">Active recall loops & interval decay engine</p>
                    </div>
                    <span className="text-[10px] bg-indigo-500/10 text-indigo-500 px-2.5 py-1 rounded-full font-semibold border border-indigo-500/20">
                      SM-2 Algorithm Active
                    </span>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl border border-border/60 bg-background-secondary text-left space-y-1">
                      <span className="text-[10px] text-muted-foreground font-semibold block">TOMORROW</span>
                      <span className="text-sm font-bold text-foreground">2 Problems Due</span>
                    </div>

                    <div className="p-3 rounded-xl border border-border/60 bg-background-secondary text-left space-y-1">
                      <span className="text-[10px] text-muted-foreground font-semibold block">THIS WEEK</span>
                      <span className="text-sm font-bold text-foreground">7 Problems Scheduled</span>
                    </div>

                    <div className="p-3 rounded-xl border border-border/60 bg-background-secondary text-left space-y-1">
                      <span className="text-[10px] text-muted-foreground font-semibold block">RETENTION RATE</span>
                      <span className="text-sm font-bold text-emerald-500">94% Optimal Recall</span>
                    </div>
                  </div>

                  <div className="p-3.5 border border-border/60 rounded-xl bg-background-secondary/50 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-foreground">LRU Cache (#146)</span>
                      <span className="text-[10px] text-destructive font-semibold">Due Today for Recall</span>
                    </div>
                    <div className="flex gap-1.5 pt-1 justify-end">
                      <span className="text-[10px] border border-destructive/30 text-destructive bg-destructive/10 px-2 py-0.5 rounded font-semibold">Again (1d)</span>
                      <span className="text-[10px] border border-amber-500/30 text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded font-semibold">Hard (3d)</span>
                      <span className="text-[10px] border border-indigo-500/30 text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded font-semibold">Good (7d)</span>
                      <span className="text-[10px] bg-emerald-500 text-white px-2.5 py-0.5 rounded font-semibold">Easy (14d)</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: PROBLEM WORKSPACE */}
              {showcaseTab === "problem" && (
                <div className="space-y-4 text-left animate-in fade-in duration-200">
                  <div className="flex justify-between items-center pb-3 border-b border-border/60">
                    <div>
                      <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                        Climbing Stairs <span className="text-[10px] px-2 py-0.2 rounded bg-emerald-500/10 text-emerald-500 font-semibold">Easy</span>
                      </h4>
                      <p className="text-[11px] text-muted-foreground">Topic: DP (1D / State Transitions)</p>
                    </div>
                    <a href="https://leetcode.com/problems/climbing-stairs" target="_blank" rel="noreferrer" className="text-[10px] bg-primary text-primary-foreground px-3 py-1 rounded-lg font-semibold flex items-center gap-1">
                      Practice on LeetCode ↗
                    </a>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="p-3 border border-border/60 rounded-xl bg-background-secondary space-y-1">
                      <span className="text-[10px] text-muted-foreground font-semibold block uppercase">Markdown Notes.md</span>
                      <div className="bg-card border border-border/40 rounded p-2 text-[10px] font-mono text-muted-foreground leading-relaxed">
                        <span className="text-indigo-400">## State Transition</span><br />
                        dp[i] = dp[i-1] + dp[i-2]<br />
                        <span className="text-emerald-400 font-semibold">Time: O(N) • Space: O(1)</span>
                      </div>
                    </div>

                    <div className="p-3 border border-border/60 rounded-xl bg-background-secondary space-y-2">
                      <span className="text-[10px] text-muted-foreground font-semibold block uppercase">Solving Metrics</span>
                      <div className="grid grid-cols-2 gap-2 text-center text-xs">
                        <div className="p-1.5 border border-border/40 rounded bg-card">
                          <span className="text-[9px] text-muted-foreground block">TIME TAKEN</span>
                          <span className="font-bold text-foreground">12m 45s</span>
                        </div>
                        <div className="p-1.5 border border-border/40 rounded bg-card">
                          <span className="text-[9px] text-muted-foreground block">ATTEMPTS</span>
                          <span className="font-bold text-foreground">1 Attempt</span>
                        </div>
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
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button size="lg" className="h-11 px-8 cursor-pointer shadow-md bg-primary hover:bg-primary/95 text-primary-foreground font-semibold rounded-lg text-sm flex items-center gap-1.5">
                  Go to Dashboard <ArrowRight className="size-4" />
                </Button>
              </Link>
            ) : (
              <>
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
              </>
            )}
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

