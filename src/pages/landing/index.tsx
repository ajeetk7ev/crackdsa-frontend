import { useState } from "react";
import { Link } from "react-router-dom";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { useNotificationStore } from "@/stores/notification.store";
import {
  BrainCircuit,
  Target,
  Zap,
  Clock,
  Check,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Flame,
} from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

export function LandingPage() {
  const addToast = useNotificationStore((state: any) => state.addToast);
  
  // Interactive Simulator State
  const [srsState, setSrsState] = useState<"due" | "scheduled">("due");
  const [scheduledInterval, setScheduledInterval] = useState("");

  // FAQ Expand state
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const handleConfidenceClick = (_level: "again" | "hard" | "good" | "easy", days: number) => {
    setSrsState("scheduled");
    setScheduledInterval(`Due in ${days} days`);
    addToast(
      `SM2 Scheduler: "LRU Cache" review interval updated. Next review scheduled in ${days} days.`,
      "success"
    );
  };

  const handleResetSimulator = () => {
    setSrsState("due");
    setScheduledInterval("");
  };

  const faqItems: FAQItem[] = [
    {
      question: "How does the Spaced Repetition System (SRS) work?",
      answer:
        "CrackDSA implements a modified SM2 (SuperMemo-2) algorithm. When you mark a problem solved, the platform schedules its next review. Based on your rating of recall difficulty (Again, Hard, Good, Easy), the algorithm dynamically increases or decreases the next gap interval (e.g. 1 day, 3 days, 8 days, 21 days), helping you retain coding pattern logic with minimal review cycles.",
    },
    {
      question: "Can I create custom problem collections?",
      answer:
        "Yes! Under our Collections feature, you can build custom lists (e.g., 'Targeting Meta 2026', 'Graph Revision Pack') and add problems directly from our directory to track their individual progress aggregates.",
    },
    {
      question: "Is there a LeetCode import option?",
      answer:
        "Yes, you can sync your LeetCode username inside settings to automatically import solved categories and visually populate your consistency grids directly on CrackDSA.",
    },
  ];

  return (
    <div className="flex flex-col items-center py-12 px-6 max-w-5xl mx-auto space-y-16">
      
      {/* 1. Hero Headline */}
      <div className="space-y-6 text-center max-w-3xl">
        <Typography variant="display" className="font-semibold text-foreground leading-tight tracking-tight">
          Retain Coding Patterns. <br />
          Master the Technical Interview.
        </Typography>
        <Typography variant="muted" className="text-base max-w-xl mx-auto leading-relaxed">
          CrackDSA couples a curated pattern directory with Spaced Repetition scheduling and consistency streaking. Move algorithm logic from short-term comprehension to long-term interview readiness.
        </Typography>

        {/* CTA Buttons */}
        <div className="flex gap-4 items-center justify-center pt-2">
          <Link to="/auth/register">
            <Button variant="default" size="lg" className="h-10 px-6 cursor-pointer shadow-sm">
              Start Free Onboarding
            </Button>
          </Link>
          <Link to="/auth/login">
            <Button variant="outline" size="lg" className="h-10 px-6 cursor-pointer">
              Explore Demo Mode
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Interactive Demonstration Simulator Widget */}
      <div className="w-full max-w-2xl rounded-xl border border-border bg-card p-6 shadow-md text-left space-y-4 transition-all duration-300">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <span className="bg-primary text-primary-foreground size-5 rounded flex items-center justify-center text-[10px] font-bold">
              1
            </span>
            <Typography variant="title" className="text-foreground">LRU Cache Design Pattern</Typography>
          </div>
          {srsState === "due" ? (
            <span className="text-[11px] font-semibold text-amber-600 bg-amber-500/10 px-2.5 py-0.5 rounded-full animate-pulse">
              Due Today
            </span>
          ) : (
            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-500/10 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Check className="size-3" /> {scheduledInterval}
            </span>
          )}
        </div>

        {srsState === "due" ? (
          <>
            <p className="text-xs text-muted-foreground leading-relaxed">
              You last solved this question 3 days ago. Click a confidence rating below to simulate the Spaced Repetition scheduling update.
            </p>
            <div className="flex flex-wrap gap-2 justify-end pt-2">
              <Button variant="outline" size="xs" onClick={() => handleConfidenceClick("again", 1)}>
                Again (1d)
              </Button>
              <Button variant="outline" size="xs" onClick={() => handleConfidenceClick("hard", 3)}>
                Hard (3d)
              </Button>
              <Button variant="outline" size="xs" onClick={() => handleConfidenceClick("good", 8)}>
                Good (8d)
              </Button>
              <Button variant="default" size="xs" onClick={() => handleConfidenceClick("easy", 18)}>
                Easy (18d)
              </Button>
            </div>
          </>
        ) : (
          <div className="pt-2 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Review completed! Next recall is scheduled.
            </p>
            <Button variant="ghost" size="xs" onClick={handleResetSimulator} className="text-xs">
              Reset simulator demo
            </Button>
          </div>
        )}
      </div>

      {/* 3. Feature Highlights Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 w-full text-left pt-6">
        <div className="p-5 rounded-xl border border-border bg-card space-y-2.5 shadow-sm">
          <BrainCircuit className="size-5 text-indigo-500" />
          <Typography variant="title">Spaced Repetition</Typography>
          <Typography variant="small" className="text-muted-foreground block leading-relaxed">
            SM2 decay intervals schedule reviews exactly when your memory needs reinforcement, optimizing practice time.
          </Typography>
        </div>
        <div className="p-5 rounded-xl border border-border bg-card space-y-2.5 shadow-sm">
          <Target className="size-5 text-emerald-500" />
          <Typography variant="title">Consistency Heatmap</Typography>
          <Typography variant="small" className="text-muted-foreground block leading-relaxed">
            GitHub-style contribution calendars log daily runs to help you maintain visual consistency.
          </Typography>
        </div>
        <div className="p-5 rounded-xl border border-border bg-card space-y-2.5 shadow-sm">
          <Zap className="size-5 text-amber-500 animate-pulse" />
          <Typography variant="title">Readiness Analytics</Typography>
          <Typography variant="small" className="text-muted-foreground block leading-relaxed">
            Dynamic ratings dashboard aggregates accuracy ratios, problem distributions, and speed scores.
          </Typography>
        </div>
        <div className="p-5 rounded-xl border border-border bg-card space-y-2.5 shadow-sm">
          <Clock className="size-5 text-sky-500" />
          <Typography variant="title">Pomodoro Timers</Typography>
          <Typography variant="small" className="text-muted-foreground block leading-relaxed">
            Integrated focus timers with custom pings allow you to solve and review with high-quality focus blocks.
          </Typography>
        </div>
      </div>

      {/* 4. Pricing Grid Section */}
      <div className="w-full space-y-8 pt-8">
        <div className="text-center space-y-2">
          <Typography variant="h2" className="font-semibold text-foreground">
            Simple, Transparent Pricing
          </Typography>
          <Typography variant="muted">
            Choose the plan that matches your interview goals.
          </Typography>
        </div>

        <div className="grid gap-6 md:grid-cols-2 max-w-3xl mx-auto pt-2">
          {/* Free plan */}
          <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <Typography variant="title">Basic Student</Typography>
              <p className="text-2xl font-light text-foreground">$0</p>
              <Typography variant="small" className="text-muted-foreground block">
                Standard problem sheets tracking.
              </Typography>
              <ul className="text-xs text-muted-foreground space-y-2 pt-2">
                <li>• Access to 100+ standard problems</li>
                <li>• Simple solved checklist tracking</li>
                <li>• Basic profile view</li>
              </ul>
            </div>
            <Link to="/auth/register" className="block pt-4">
              <Button variant="outline" className="w-full h-8 cursor-pointer text-xs">
                Start Free Onboarding
              </Button>
            </Link>
          </div>

          {/* Premium plan */}
          <div className="p-6 rounded-xl border border-primary/20 bg-card shadow-md space-y-4 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-3 right-3 text-[9px] font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full uppercase flex items-center gap-0.5">
              <Flame className="size-2.5 fill-amber-500/20" /> Popular
            </div>
            <div className="space-y-2">
              <Typography variant="title">Premium Prep</Typography>
              <p className="text-2xl font-semibold text-foreground">$12<span className="text-xs font-normal text-muted-foreground">/mo</span></p>
              <Typography variant="small" className="text-muted-foreground block">
                Full spaced-repetition intervals scheduler.
              </Typography>
              <ul className="text-xs text-muted-foreground space-y-2 pt-2">
                <li>• Intelligent SM2 Spaced Repetition Scheduler</li>
                <li>• Unlimited Custom Collections folders</li>
                <li>• Pomodoro integration & custom duration tools</li>
                <li>• Complete SVG Reports & Interview Readiness metrics</li>
                <li>• Advanced markdown problem notes</li>
              </ul>
            </div>
            <Link to="/auth/register" className="block pt-4">
              <Button variant="default" className="w-full h-8 cursor-pointer text-xs shadow-sm">
                Get Premium Prep
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 5. FAQ Accordion Section */}
      <div className="w-full max-w-3xl space-y-6 pt-6">
        <div className="text-center space-y-2">
          <Typography variant="h2" className="font-semibold text-foreground flex items-center justify-center gap-2">
            <HelpCircle className="size-5 text-indigo-500" /> Frequently Asked Questions
          </Typography>
        </div>

        <div className="divide-y divide-border border border-border rounded-xl bg-card overflow-hidden">
          {faqItems.map((faq, idx) => (
            <div key={idx} className="p-4">
              <button
                onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between text-left font-medium text-sm text-foreground cursor-pointer focus:outline-none"
              >
                <span>{faq.question}</span>
                {expandedFaq === idx ? <ChevronUp className="size-4 text-muted-foreground" /> : <ChevronDown className="size-4 text-muted-foreground" />}
              </button>
              
              {expandedFaq === idx && (
                <div className="mt-2 text-xs text-muted-foreground leading-relaxed animate-in fade-in slide-in-from-top-1 duration-150">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
