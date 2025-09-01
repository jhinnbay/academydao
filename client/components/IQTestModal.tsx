import { X } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { sdk } from "@farcaster/miniapp-sdk";

interface IQTestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Question {
  id: number;
  prompt: string;
  choices: { key: string; text: string }[];
  answer: string;
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    prompt: "What is the next number in the sequence: 2, 6, 12, 20, 30, ?",
    choices: [
      { key: "A", text: "36" },
      { key: "B", text: "40" },
      { key: "C", text: "42" },
      { key: "D", text: "44" },
    ],
    answer: "C", // differences +4,+6,+8,+10 => next +12 => 42
  },
  {
    id: 2,
    prompt:
      "If all Zeps are Blons and some Blons are Trels, which statement must be true?",
    choices: [
      { key: "A", text: "Some Zeps are Trels" },
      { key: "B", text: "All Trels are Zeps" },
      { key: "C", text: "No Trels are Zeps" },
      { key: "D", text: "All Zeps are Trels" },
    ],
    answer: "A",
  },
  {
    id: 3,
    prompt: "Find the missing term: ACE, BDF, CEG, DFH, ?",
    choices: [
      { key: "A", text: "EGI" },
      { key: "B", text: "EFH" },
      { key: "C", text: "EHI" },
      { key: "D", text: "FGI" },
    ],
    answer: "A", // pattern increments
  },
  {
    id: 4,
    prompt: "Which two numbers come next? 1, 1, 2, 3, 5, 8, __, __",
    choices: [
      { key: "A", text: "13, 21" },
      { key: "B", text: "11, 19" },
      { key: "C", text: "12, 20" },
      { key: "D", text: "14, 22" },
    ],
    answer: "A", // Fibonacci
  },
  {
    id: 5,
    prompt: "Analogies: Book is to Reading as Fork is to __",
    choices: [
      { key: "A", text: "Stirring" },
      { key: "B", text: "Drawing" },
      { key: "C", text: "Eating" },
      { key: "D", text: "Writing" },
    ],
    answer: "C",
  },
];

export function IQTestModal({ isOpen, onClose }: IQTestModalProps) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const score = useMemo(() => {
    return QUESTIONS.reduce(
      (acc, q) => (answers[q.id] === q.answer ? acc + 1 : acc),
      0,
    );
  }, [answers]);

  const shareText = useMemo(() => {
    const header = `My IQ score was ${score}/${QUESTIONS.length}.`;
    const flavor =
      score === 5
        ? "The ledger glows. Azura—glitch—approves. Discipline absolute."
        : score >= 3
          ? "Signal detected. The rites deepen. Hold the signal; calibration continues."
          : "Initiate foundations. Static wave‑form stabilizing. The corridor opens.";
    return `${header}\n\n${flavor}`;
  }, [score]);

  const handleShare = async () => {
    const embedUrl = window.location.origin;
    const intent = `https://warpcast.com/~/compose?text=${encodeURIComponent(shareText)}&embeds[]=${encodeURIComponent(embedUrl)}`;
    try {
      const anySdk: any = sdk as any;
      if (anySdk?.actions?.composeCast) {
        await anySdk.actions.composeCast({
          text: shareText,
          embeds: [embedUrl],
        });
        return;
      }
      if (anySdk?.actions?.openUrl) {
        try {
          await anySdk.actions.openUrl(intent);
          return;
        } catch (_) {
          await anySdk.actions.openUrl({ url: intent });
          return;
        }
      }
    } catch (_) {
      // fall through to web share
    }
    window.open(intent, "_blank");
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      <div className="relative w-full max-w-2xl mx-auto max-h-[95vh] flex flex-col">
        <div className="relative bg-black border border-white/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-full">
          <div className="relative flex-shrink-0 p-5 border-b border-white/20 bg-black/80">
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
            <div className="text-center">
              <h2 className="text-white font-sans font-bold text-xl">
                Academy IQ Trial
              </h2>
              <div className="w-28 h-0.5 bg-white/50 mx-auto mt-2" />
            </div>
          </div>

          <div className="relative flex-1 overflow-y-auto p-5 space-y-4">
            <p className="text-white/80 text-sm">
              Prove your readiness. Answer five timed-less questions. Your
              result helps calibrate Azura’s challenge path.
            </p>

            {QUESTIONS.map((q, idx) => (
              <Card key={q.id} className="bg-black border border-white/30">
                <CardContent className="p-4">
                  <div className="text-white font-sans font-medium mb-2">
                    {idx + 1}. {q.prompt}
                  </div>
                  <div className="grid gap-2">
                    {q.choices.map((c) => (
                      <label
                        key={c.key}
                        className={`flex items-center gap-3 p-2 rounded border ${answers[q.id] === c.key ? "border-white bg-white/10" : "border-white/20 hover:border-white/40"}`}
                      >
                        <input
                          type="radio"
                          name={`q-${q.id}`}
                          className="accent-white"
                          checked={answers[q.id] === c.key}
                          onChange={() =>
                            setAnswers((prev) => ({ ...prev, [q.id]: c.key }))
                          }
                        />
                        <span className="text-white/90 text-sm">
                          {c.key}. {c.text}
                        </span>
                      </label>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}

            {!submitted ? (
              <div className="flex justify-end">
                <Button
                  onClick={() => setSubmitted(true)}
                  disabled={Object.keys(answers).length < QUESTIONS.length}
                  className="bg-white text-black hover:bg-gray-200"
                >
                  Submit
                </Button>
              </div>
            ) : (
              <div className="border border-white/30 rounded-lg p-4 bg-white/5">
                <div className="text-white font-sans text-lg font-semibold">
                  Score: {score} / {QUESTIONS.length}
                </div>
                <p className="text-white/80 text-sm mt-1">
                  {score === 5
                    ? "Exceptional. Azura takes notice."
                    : score >= 3
                      ? "Solid performance. Prepare to face Azura."
                      : "Foundational skills detected. The Academy will strengthen you."}
                </p>
                <div className="mt-3 flex gap-2 justify-end">
                  <Button
                    onClick={handleShare}
                    className="bg-white text-black hover:bg-gray-200"
                  >
                    Share Results
                  </Button>
                  <Button
                    onClick={onClose}
                    className="bg-white/10 hover:bg-white/20 border border-white/30 text-white"
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
