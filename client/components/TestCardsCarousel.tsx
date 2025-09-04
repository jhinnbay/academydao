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
import { Brain, Bot, ClipboardList, MessageCircle } from "lucide-react";
import { AzuraTerminalModal } from "@/components/AzuraTerminalModal";
import { SoundEffects } from "@/lib/soundEffects";

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
    SoundEffects.playTerminal();
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
    <div className="relative px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20">
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
                  {/* Card shell with angled edges */}
                  <div
                    className="relative bg-black shadow-xl overflow-hidden"
                    style={{
                      clipPath:
                        "polygon(18px 0%, 100% 0%, 100% calc(100% - 18px), calc(100% - 18px) 100%, 0% 100%, 0% 18px)",
                    }}
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

      {/* Azura Terminal Modal */}
      <AzuraTerminalModal
        isOpen={terminalOpen}
        onClose={() => setTerminalOpen(false)}
        messages={terminalMessages}
        onComplete={() => onCompleteRef.current?.()}
        autoProceedDelayMs={600}
      />
    </div>
  );
};

export default TestCardsCarousel;
