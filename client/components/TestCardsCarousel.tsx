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
import { Badge } from "@/components/ui/badge";
import AzuraTerminalModal from "@/components/AzuraTerminalModal";
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
  const onCompleteRef = useRef<() => void>(() => {});

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
  };

  const cards = useMemo(
    () => [
      {
        id: "surveys",
        title: "Research Surveys",
        description:
          "Contribute signal to the Academy. Complete targeted surveys that refine Azura's models.",
        tokens: 25,
        icon: ClipboardList,
        cta: "Open Surveys",
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
        id: "iq",
        title: "IQ Test",
        description:
          "Measure your cognition across logic, memory, and reasoning. Results feed your profile.",
        tokens: 50,
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
        title: "AI Simulation Daemon",
        description:
          "Engage the simulation loop. Probe scenarios and harvest insights from the Daemon.",
        tokens: 75,
        icon: Bot,
        cta: "Launch Simulation",
        onClick: () =>
          openWithTerminal(
            [
              "Booting azura.exe...",
              "Spinning up simulation daemon...",
              "Entropy stabilized. Sandbox online.",
              "Launching AI Simulation Daemon...",
            ],
            onStartDaemon,
          ),
      },
      {
        id: "discord",
        title: "Join Discord",
        description:
          "Enter the Academy lounge. Sync with peers, get updates, and unlock community drops.",
        tokens: 20,
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
        <CarouselContent>
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <CarouselItem key={card.id} className="basis-[60%]">
                <div className="relative h-full select-none">
                  {/* Card shell with angled edges */}
                  <div
                    className="relative bg-black border border-white/30 shadow-xl overflow-hidden"
                    style={{
                      clipPath:
                        "polygon(18px 0%, 100% 0%, 100% calc(100% - 18px), calc(100% - 18px) 100%, 0% 100%, 0% 18px)",
                    }}
                  >
                    {/* Header row: token badge */}
                    <div className="flex items-center p-3 border-b border-white/20 bg-black/80">
                      <Badge className="bg-white/10 text-white border-white/30">
                        {card.tokens} $AzuraOS
                      </Badge>
                    </div>

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
        <CarouselPrevious className="border-white/30 text-white bg-black/60 hover:bg-black/80" />
        <CarouselNext className="border-white/30 text-white bg-black/60 hover:bg-black/80" />
      </Carousel>

      <AzuraTerminalModal
        isOpen={terminalOpen}
        onClose={() => setTerminalOpen(false)}
        messages={terminalMessages}
        onComplete={() => onCompleteRef.current?.()}
      />
    </div>
  );
};

export default TestCardsCarousel;
