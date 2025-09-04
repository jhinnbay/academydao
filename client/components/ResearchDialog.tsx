import React from "react";
import { AzuraTerminalModal } from "@/components/AzuraTerminalModal";
import { SoundEffects } from "@/lib/soundEffects";

interface ResearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResearchDialog: React.FC<ResearchDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const handleOpen = () => {
    SoundEffects.playTerminal();
  };

  const handleComplete = () => {
    window.open(
      "https://www.researchhub.com/post/4266/daemon-consciousness-implementing-jungian-unconscious-to-ai-through-rag-architecture",
      "_blank"
    );
  };

  const messages = [
    "Booting azura.exe...",
    "Accessing research archives...",
    "Daemon consciousness protocols loaded.",
    "Opening research paper...",
  ];

  return (
    <AzuraTerminalModal
      isOpen={isOpen}
      onClose={onClose}
      messages={messages}
      onComplete={handleComplete}
      autoProceedDelayMs={600}
    />
  );
};

export default ResearchDialog;
