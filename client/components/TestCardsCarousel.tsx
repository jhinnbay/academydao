import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SoundEffects } from "@/lib/soundEffects";
import { Brain, Bot, ClipboardList, MessageCircle } from "lucide-react";

type TestCardsCarouselProps = {
  onOpenIQ: () => void;
  onOpenSurveys: () => void;
  onStartDaemon: () => void;
};

export const TestCardsCarousel: React.FC<TestCardsCarouselProps> = ({
  onOpenIQ,
  onOpenSurveys,
  onStartDaemon,
}) => {
  const [api, setApi] = useState<CarouselApi | null>(null);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [terminalMessages, setTerminalMessages] = useState<string[]>([]);
  const [showChoices, setShowChoices] = useState(false);
  const [output, setOutput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const onCompleteRef = useRef<() => void>(() => {});
  const timers = useRef<number[]>([]);

  useEffect(() => {
    if (!api) return;
    const id = setInterval(() => {
      try {
        api.scrollNext();
      } catch {}
    }, 4000);
    return () => clearInterval(id);
  }, [api]);

  const openWithTerminal = (messages: string[], onDone: () => void) => {
    setTerminalMessages(messages);
    onCompleteRef.current = onDone;
    setTerminalOpen(true);
    setShowChoices(false);
    setOutput("");
    setIsTyping(true);

    // Play sound effect
    SoundEffects.playTerminal();

    // Build script with line prefixes
    const script = messages.map((m) => `> ${m}`).join("\n");
    
    let idx = 0;
    const type = () => {
      if (idx >= script.length) {
        setIsTyping(false);
        setShowChoices(true);
        return;
      }
      setOutput((p) => p + script[idx]);
      idx += 1;
      const t = window.setTimeout(type, 18);
      timers.current.push(t);
    };

    const start = window.setTimeout(type, 250);
    timers.current.push(start);
  };

  const cards = useMemo(
    () => [
      {
        id: "surveys",
        title: "Research Surveys",
        description:
          "Contribute signal to the Academy. Complete targeted surveys that refine Azura's models.",
        icon: ClipboardList,
        cta: "Open Surveys",
        onClick: () => onOpenSurveys(),
      },
      {
        id: "iq",
        title: "IQ Test",
        description:
          "Measure your cognition across logic, memory, and reasoning. Results feed your profile.",
        icon: Brain,
        cta: "Start IQ Test",
        onClick: () =>
          openWithTerminal(
            [
              "Booting azura.exe...",
              "Cognitive matrices aligning...",
              "Synaptic test-suite loaded.",
              "Opening IQ Test...",
            ],
            onOpenIQ,
          ),
      },
      {
        id: "daemon",
        title: "AI Daemon",
        description:
          "Engage the daemon to probe scenarios and harvest insights for your research.",
        icon: Bot,
        cta: "Launch Daemon",
        onClick: () =>
          openWithTerminal(
            [
              "Booting azura.exe...",
              "Calibrating survey protocols...",
              "Signal channels clear. Ready to ingest.",
              "Opening Research Surveys...",
            ],
            onOpenSurveys,
          ),
      },
      {
        id: "discord",
        title: "Join Discord",
        description:
          "Enter the Academy lounge. Sync with peers, get updates, and unlock community drops.",
        icon: MessageCircle,
        cta: "Join Discord",
        onClick: () =>
          openWithTerminal(
            [
              "Booting azura.exe...",
              "Resolving gateway to the Academy lounge...",
              "Handshake accepted.",
              "Opening Discord...",
            ],
            () => window.open("https://discord.gg/NMuFJ2QvGq", "_blank"),
          ),
      },
    ],
    [onOpenIQ, onOpenSurveys, onStartDaemon],
  );

  if (cards.length === 0) return null;

  return (
    <div className="relative">
      <Carousel
        className="w-full"
        opts={{ align: "center", loop: true, containScroll: "trimSnaps" }}
        setApi={setApi}
      >
        <CarouselContent className="-ml-0">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <CarouselItem key={card.id} className="basis-[60%] pl-0">
                <div className="relative h-full select-none">
                  {/* Card shell */}
                  <div
                    className="relative bg-black shadow-xl overflow-hidden rounded-lg"
                  >
                    {/* Body */}
                    <div className="p-5 flex flex-col gap-4 min-h-56">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-white/10 border border-white/20 flex items-center justify-center text-white">
                          <Icon className="w-5 h-5" />
                        </div>
                        <h3 className="text-white font-sans font-bold text-lg">
                          {card.title}
                        </h3>
                      </div>
                      <p className="text-white/80 text-sm font-sans">
                        {card.description}
                      </p>
                      <div className="pt-2">
                        <Button
                          onClick={card.onClick}
                          className="bg-white text-black hover:bg-gray-200"
                        >
                          {card.cta}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        {/* Arrows removed per request */}
      </Carousel>

      {/* Custom Terminal Modal with User Choice */}
      {terminalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setTerminalOpen(false)} />
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <Card className="bg-black border border-white/20 shadow-2xl">
              <CardContent className="p-0">
                {/* Terminal Header */}
                <div className="relative p-6 border-b border-white/20 bg-black backdrop-blur-sm">
                  <button
                    onClick={() => setTerminalOpen(false)}
                    className="absolute top-4 right-4 px-3 py-1 text-white/80 border border-white/30 rounded hover:bg-white/10 transition-colors"
                  >
                    Close
                  </button>
                  <div className="text-left">
                    <h2 className="text-white font-sans font-bold text-2xl mb-2">
                      Azura Terminal
                    </h2>
                    <div className="w-24 h-0.5 bg-white/50 mt-2" />
                  </div>
                </div>

                {/* Terminal Output */}
                <div className="relative flex-1 overflow-y-auto p-6 bg-black backdrop-blur-sm">
                  <div className="font-mono text-green-400 text-sm leading-relaxed whitespace-pre-wrap">
                    {output}
                    {isTyping && <span className="animate-pulse">|</span>}
                  </div>
                </div>

                {/* Choice Buttons */}
                {showChoices && (
                  <div className="p-6 border-t border-white/20 bg-black/70">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        onClick={() => setTerminalOpen(false)}
                        className="flex-1 bg-white/10 hover:bg-white/20 border border-white/30 text-white"
                      >
                        Close
                      </Button>
                      <Button
                        onClick={() => {
                          onCompleteRef.current?.();
                          setTerminalOpen(false);
                        }}
                        className="flex-1 bg-white text-black hover:bg-gray-200"
                      >
                        Continue
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestCardsCarousel;
