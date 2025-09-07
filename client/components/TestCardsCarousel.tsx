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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Brain, Bot, ClipboardList, X } from "lucide-react";
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
  const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false);

  useEffect(() => {
    if (!api) return;
    const id = setInterval(() => {
      try {
        api.scrollNext();
      } catch {}
    }, 4000);
    return () => clearInterval(id);
  }, [api]);



  const cards = useMemo(
    () => [
      {
        id: "surveys",
        title: "Research Surveys",
        description:
          "Contribute signal to the Academy. Complete targeted surveys that refine Azura's models.",
        icon: ClipboardList,
        cta: "Open Surveys",
        onClick: () => {
          setIsSurveyModalOpen(true);
          SoundEffects.playCompleteSound();
        },
      },
      {
        id: "iq",
        title: "IQ Test",
        description:
          "Measure your cognition across logic, memory, and reasoning. Results feed your profile.",
        icon: Brain,
        cta: "Start IQ Test",
        onClick: onOpenIQ,
      },
      {
        id: "daemon",
        title: "AI Daemon",
        description:
          "Engage the daemon to probe scenarios and harvest insights for your research.",
        icon: Bot,
        cta: "Launch Daemon",
        onClick: () => {
          // Launch Daemon disabled - do nothing
        },
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

      {/* Survey Modal */}
      <Dialog open={isSurveyModalOpen} onOpenChange={setIsSurveyModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] bg-black border border-white/20">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle className="text-white font-cartograph text-lg">
              Research Surveys
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSurveyModalOpen(false)}
              className="text-white hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </Button>
          </DialogHeader>
          <div className="mt-4">
            <iframe
              src="https://docs.google.com/forms/d/e/1FAIpQLSdzfT7shcx77U5-mim79ofoBD1t8O0jyAD1E0Ei2fiKj0bG7w/viewform?embedded=true"
              width="100%"
              height="600"
              frameBorder="0"
              marginHeight="0"
              marginWidth="0"
              className="rounded"
            >
              Loading…
            </iframe>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TestCardsCarousel;
